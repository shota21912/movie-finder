import { NextRequest, NextResponse } from "next/server";

// app/api/translate/route.ts というファイルパスは、Next.jsのApp Routerでは
// 「Route Handler」と呼ばれるAPIエンドポイントになる(= /api/translate というURLでアクセスできる)。
// これまでのapp/以下の page.tsx は「画面(HTML)を返す」ファイルだったのに対し、
// route.ts は「JSONなどのデータだけを返す」ためのファイル、という違いがある。
// ここでは、ReviewCard.tsx(ブラウザ側)から呼ばれて、テキストを翻訳して返す役割を持つ。
//
// なぜブラウザから直接Google翻訳を呼ばずに、いったんこのAPIを経由させているか:
// ① CORS(異なるドメイン間の通信を制限するブラウザの仕組み)の問題を避けられる
// ② サーバー側で処理を挟むことで、後から翻訳先を別のサービスに差し替えるのも楽になる

// Google翻訳の非公式エンドポイント。APIキー不要だが、あくまで内部向けの
// 未公開仕様なので、個人学習用途の範囲で利用する。
const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

// POSTリクエストが来た時に実行される関数。
// Next.jsのRoute Handlerでは、HTTPメソッド名(GET, POST, PUT...)をそのまま関数名にする決まり。
// ReviewCard.tsx側で fetch("/api/translate", { method: "POST", ... }) と呼んでいるので、
// ここではPOST関数だけを用意すればよい。
export async function POST(request: NextRequest) {
  // request.json()でリクエストボディ(ReviewCard.tsxが送ってきたJSON)を読み取る。
  // { text?: unknown } という型を付けているのは、
  // 「本当にtextというプロパティを含んだ正しいJSONが送られてきたか」はまだ分からないので、
  // いったん unknown(何が来るか分からない型)として受け取り、次の行でちゃんとチェックする、
  // という安全な書き方。
  const { text } = (await request.json()) as { text?: unknown };

  // textが無い、または文字列じゃない場合は、400 Bad Request(リクエスト不正)を返して処理を止める。
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  // Google翻訳の非公式エンドポイントに投げるURLを組み立てる。
  // client=gtx, dt=t は「このAPIを使うために必要な決まったパラメータ」、
  // sl=auto(自動言語検出)、tl=ja(日本語に翻訳)、q=翻訳したい文章、という意味。
  const url = new URL(GOOGLE_TRANSLATE_URL);
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", "ja");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString());
  if (!res.ok) {
    // 502 Bad Gatewayは「自分のサーバーは正常だが、その先の外部サービス(Google翻訳)への
    // 中継に失敗した」ことを表すステータスコード
    return NextResponse.json({ error: "翻訳に失敗しました" }, { status: 502 });
  }

  // このエンドポイントのレスポンスは、公式ドキュメントの無い独自の入れ子配列形式で返ってくる。
  // だいたい次のような形: [[["翻訳後の文1", "元の文1", null, ...], ["翻訳後の文2", ...], ...], ...]
  // data[0] が「翻訳された文の断片」のリストになっていて、
  // それぞれの断片([0]番目の要素)だけを取り出してつなげると、翻訳結果の全文になる。
  const data = (await res.json()) as unknown;
  const segments = Array.isArray(data) ? (data[0] as unknown[]) : [];
  const translated = segments
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("");

  return NextResponse.json({ translated });
}
