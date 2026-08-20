import { NextRequest, NextResponse } from "next/server";
import { getMovieSummaries } from "@/lib/tmdb";

// app/api/movies/route.ts は /api/movies というURLでアクセスできるRoute Handler。
// マイリストページ(app/mylist/page.tsx)専用のAPI。
//
// マイリストの中身(映画ID)はブラウザのlocalStorageにしか無いが、TMDbへのリクエストは
// APIキーをサーバー側に隠しておく必要があるためクライアント(ブラウザ)から直接は呼べない
// (lib/tmdb.tsのコメント参照)。そこで、ブラウザ側は「今持っているID一覧」をこのAPIに送り、
// このAPI(サーバー側)がTMDbに問い合わせて最新の映画情報を返す、という仲介役になっている。
//
// 例: /api/movies?ids=550,155,27205
export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
  // "550,155,27205" のようなカンマ区切り文字列を数値の配列に変換する。
  // Number()で数値に変換できないもの(空文字や不正な値)はfilterで取り除く。
  const ids = idsParam
    .split(",")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  const movies = await getMovieSummaries(ids);
  return NextResponse.json({ movies });
}
