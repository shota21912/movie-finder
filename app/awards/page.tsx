import Link from "next/link";
import FormSelect from "@/components/FormSelect";
import MovieGrid from "@/components/MovieGrid";
import { AWARD_SHOWS, ERA_OPTIONS, getAwardOption, STATUS_OPTIONS } from "@/lib/awards";
import { BUTTON_FULL_CLASS, FORM_PANEL_CLASS, SUBTLE_LINK_CLASS } from "@/lib/styles";
import { findMovieByImdbId, getGenres } from "@/lib/tmdb";
import { getAwardFilms, type AwardStatus } from "@/lib/wikidata";
import type { MovieSummary } from "@/types/tmdb";

// /awards に対応するページ。「受賞作品を探す」機能。
// TMDbには受賞データが無いため、lib/wikidata.tsを使ってWikidataから受賞/ノミネート作品の
// 一覧(タイトル・年・IMDb ID)を取得し、IMDb IDをTMDbの映画データに変換して表示する。
//
// /mood や /gacha と同じく、クエリパラメータの有無で状態を出し分けている:
//   ① award未指定 → 映画祭/部門・受賞orノミネート・年代を選ぶフォームを表示
//   ② award指定あり → 該当する作品一覧を表示

interface AwardsPageProps {
  searchParams: Promise<{
    award?: string; // lib/awards.tsのAwardOption.key(例: "oscar-picture")
    status?: string; // "winner" | "nominee"
    era?: string; // ERA_OPTIONSのvalue("開始年-終了年"形式)
  }>;
}

export default async function AwardsPage({ searchParams }: AwardsPageProps) {
  const { award, status, era } = await searchParams;
  const awardOption = award ? getAwardOption(award) : undefined;
  // statusはURLの文字列(string)として渡ってくるが、lib/wikidata.tsのgetAwardFilmsは
  // "winner"か"nominee"のどちらかしか受け付けないので、不正な値なら"winner"にフォールバックする。
  const awardStatus: AwardStatus = status === "nominee" ? "nominee" : "winner";

  // ① awardが未指定(または不正な値)の場合: 選択フォームだけを表示して終わり。
  if (!awardOption) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">🏆 受賞作品を探す</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          アカデミー賞・カンヌ国際映画祭・英国アカデミー賞など、名だたる映画賞の
          受賞/ノミネート作品を、部門ごとに探せます。
        </p>
        <form action="/awards" method="GET" className={`flex flex-col gap-4 ${FORM_PANEL_CLASS}`}>
          {/* <optgroup>はHTML標準のタグで、JS無しで<select>の選択肢を
              「アカデミー賞」「カンヌ国際映画祭」…とグループ分けして見やすくできる。
              FormSelectはoptionsの代わりにgroupsを渡すと、内部で<optgroup>にして描画してくれる。 */}
          <FormSelect
            label="映画祭/部門(必須)"
            name="award"
            required
            defaultValue=""
            placeholder="選んでください"
            groups={AWARD_SHOWS.map((show) => ({
              groupLabel: show.showLabel,
              options: show.categories.map((c) => ({ value: c.key, label: c.categoryLabel })),
            }))}
          />

          <FormSelect label="種別" name="status" defaultValue="winner" options={STATUS_OPTIONS} />

          <FormSelect label="年代(任意)" name="era" defaultValue="" options={ERA_OPTIONS} />

          <button type="submit" className={BUTTON_FULL_CLASS}>
            検索する
          </button>
        </form>
      </div>
    );
  }

  // ② ここから先はawardOptionが必ず存在する状態 = 実際に作品を調べる処理。

  const [films, genres] = await Promise.all([
    getAwardFilms(awardOption.wikidataId, awardStatus),
    getGenres(),
  ]);

  // eraが指定されていれば "開始年-終了年" を分解して、その範囲内の年だけに絞り込む。
  // era未指定の場合は年でのフィルタをせず全件対象にする
  // (Wikidata側で受賞年のデータが欠けている作品も、絞り込みをしていないなら除外しない)。
  const [eraMinStr, eraMaxStr] = era ? era.split("-") : [undefined, undefined];
  const eraMin = eraMinStr ? Number(eraMinStr) : undefined;
  const eraMax = eraMaxStr ? Number(eraMaxStr) : undefined;
  const filteredFilms =
    eraMin === undefined && eraMax === undefined
      ? films
      : films.filter((f) => {
          if (f.year === null) return false;
          if (eraMin !== undefined && f.year < eraMin) return false;
          if (eraMax !== undefined && f.year > eraMax) return false;
          return true;
        });

  // WikidataのIMDb IDを、1件ずつTMDbの映画データに変換する。
  // Promise.allで全部同時にリクエストすることで、1件ずつ順番に待つより大幅に速くなる。
  // IMDb IDが無い(Wikidata側にデータが無い)作品はTMDbで調べようが無いのでスキップする。
  const resolvedMovies = await Promise.all(
    filteredFilms.filter((f) => f.imdbId).map((f) => findMovieByImdbId(f.imdbId as string))
  );
  // findMovieByImdbIdは見つからなかった場合nullを返すので、それを取り除く。
  // TypeScriptの型ガード(movie is MovieSummary)を書くことで、
  // filter後の配列が (MovieSummary | null)[] ではなく MovieSummary[] だと伝えられる。
  const movies = resolvedMovies.filter(
    (movie): movie is MovieSummary => movie !== null
  );

  const statusLabel = awardStatus === "nominee" ? "ノミネート" : "受賞";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">
          🏆 {awardOption.showLabel} {awardOption.categoryLabel}
        </h1>
        <Link href="/awards" className={SUBTLE_LINK_CLASS}>
          条件を選び直す
        </Link>
      </div>
      <p className="text-sm text-zinc-500">
        {statusLabel} {movies.length}作品
      </p>

      <MovieGrid movies={movies} genres={genres} />
    </div>
  );
}
