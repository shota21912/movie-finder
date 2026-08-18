import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import { AWARD_OPTIONS, ERA_OPTIONS, getAwardOption } from "@/lib/awards";
import { findMovieByImdbId, getGenres } from "@/lib/tmdb";
import { getAwardWinners } from "@/lib/wikidata";
import type { MovieSummary } from "@/types/tmdb";

// /awards に対応するページ。「受賞作品を探す」機能。
// TMDbには受賞データが無いため、lib/wikidata.tsを使ってWikidataから受賞作品の
// 一覧(タイトル・受賞年・IMDb ID)を取得し、IMDb IDをTMDbの映画データに変換して表示する。
//
// /mood や /gacha と同じく、クエリパラメータの有無で状態を出し分けている:
//   ① award未指定 → 賞・年代を選ぶフォームを表示
//   ② award指定あり → 受賞作品一覧を表示

interface AwardsPageProps {
  searchParams: Promise<{
    award?: string; // lib/awards.tsのAwardOption.key
    era?: string; // ERA_OPTIONSのvalue("開始年-終了年"形式)
  }>;
}

export default async function AwardsPage({ searchParams }: AwardsPageProps) {
  const { award, era } = await searchParams;
  const awardOption = award ? getAwardOption(award) : undefined;

  // ① awardが未指定(または不正な値)の場合: 選択フォームだけを表示して終わり。
  if (!awardOption) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">🏆 受賞作品を探す</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          アカデミー賞やカンヌ国際映画祭など、名だたる映画賞の受賞作品を探せます。
        </p>
        <form
          action="/awards"
          method="GET"
          className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900"
        >
          <label className="flex flex-col gap-1">
            賞(必須)
            <select
              name="award"
              required
              defaultValue=""
              className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
            >
              <option value="" disabled>
                選んでください
              </option>
              {AWARD_OPTIONS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            年代(任意)
            <select
              name="era"
              defaultValue=""
              className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
            >
              {ERA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-full bg-black px-6 py-2 text-white dark:bg-white dark:text-black"
          >
            検索する
          </button>
        </form>
      </div>
    );
  }

  // ② ここから先はawardOptionが必ず存在する状態 = 実際に受賞作品を調べる処理。

  const [winners, genres] = await Promise.all([
    getAwardWinners(awardOption.wikidataId),
    getGenres(),
  ]);

  // eraが指定されていれば "開始年-終了年" を分解して、その範囲内の受賞年だけに絞り込む
  const [eraMinStr, eraMaxStr] = era ? era.split("-") : [undefined, undefined];
  const eraMin = eraMinStr ? Number(eraMinStr) : undefined;
  const eraMax = eraMaxStr ? Number(eraMaxStr) : undefined;
  const filteredWinners = winners.filter((w) => {
    if (w.year === null) return false;
    if (eraMin !== undefined && w.year < eraMin) return false;
    if (eraMax !== undefined && w.year > eraMax) return false;
    return true;
  });

  // WikidataのIMDb IDを、1件ずつTMDbの映画データに変換する。
  // Promise.allで全部同時にリクエストすることで、1件ずつ順番に待つより大幅に速くなる。
  // IMDb IDが無い(Wikidata側にデータが無い)受賞作品はTMDbで調べようが無いのでスキップする。
  const resolvedMovies = await Promise.all(
    filteredWinners
      .filter((w) => w.imdbId)
      .map((w) => findMovieByImdbId(w.imdbId as string))
  );
  // findMovieByImdbIdは見つからなかった場合nullを返すので、それを取り除く。
  // TypeScriptの型ガード(movie is MovieSummary)を書くことで、
  // filter後の配列が (MovieSummary | null)[] ではなく MovieSummary[] だと伝えられる。
  const movies = resolvedMovies.filter(
    (movie): movie is MovieSummary => movie !== null
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">🏆 {awardOption.label}</h1>
        <Link href="/awards" className="text-sm text-zinc-500 hover:underline">
          条件を選び直す
        </Link>
      </div>
      <p className="text-sm text-zinc-500">{movies.length}作品</p>

      <MovieGrid movies={movies} genres={genres} />
    </div>
  );
}
