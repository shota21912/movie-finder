import { NextRequest, NextResponse } from "next/server";

// Google翻訳の非公式エンドポイント。APIキー不要だが、あくまで内部向けの
// 未公開仕様なので、個人学習用途の範囲で利用する。
const GOOGLE_TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

export async function POST(request: NextRequest) {
  const { text } = (await request.json()) as { text?: unknown };

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const url = new URL(GOOGLE_TRANSLATE_URL);
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", "ja");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return NextResponse.json({ error: "翻訳に失敗しました" }, { status: 502 });
  }

  const data = (await res.json()) as unknown;
  const segments = Array.isArray(data) ? (data[0] as unknown[]) : [];
  const translated = segments
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("");

  return NextResponse.json({ translated });
}
