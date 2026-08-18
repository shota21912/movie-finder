import Link from "next/link";
import FormSelect from "@/components/FormSelect";
import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { getMoodOption, MOOD_OPTIONS } from "@/lib/moodMap";
import { SORT_OPTIONS } from "@/lib/sortOptions";
import { BUTTON_CLASS, FORM_PANEL_CLASS, SUBTLE_LINK_CLASS } from "@/lib/styles";
import { discoverMovies, getGenres } from "@/lib/tmdb";

// /mood に対応するページ。このサイトの目玉機能「気分から探す」の本体。
// このページは2つの状態を持っている:
//   ① mood未指定 → 「今日はどんな気分？」の選択画面を表示
//   ② mood指定あり → その気分に合う映画一覧+絞り込みフォームを表示
// 別々のページファイルに分けず、同じ/moodというURLの中でmoodパラメータの有無によって
// 表示を出し分けている。

interface MoodPageProps {
  searchParams: Promise<{
    mood?: string; // lib/moodMap.tsのMoodOption.key(例: "cry")
    genre?: string; // 絞り込みフォームで選んだジャンルID(気分のおすすめより優先)
    runtime?: string; // 絞り込みフォームで選んだ上映時間の上限(分)
    year?: string; // 絞り込みフォームで選んだ「この年以降」
    sort?: string; // 絞り込みフォームで選んだ並び順(気分ごとのおすすめより優先)
    page?: string;
  }>;
}

// 上映時間の絞り込み選択肢。value(URLに乗る値)とlabel(画面表示)のペアを配列で持っておき、
// 下のJSXで.map()して<option>タグを生成している(選択肢を1つ増やしたい時もここに足すだけでよい)。
const RUNTIME_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "90", label: "90分以内" },
  { value: "120", label: "120分以内" },
  { value: "150", label: "150分以内" },
];

// 公開年の絞り込み選択肢
const YEAR_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "2020", label: "2020年以降" },
  { value: "2015", label: "2015年以降" },
  { value: "2000", label: "2000年以降" },
];

export default async function MoodPage({ searchParams }: MoodPageProps) {
  const { mood, genre, runtime, year, sort, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  const moodOption = mood ? getMoodOption(mood) : undefined;

  const genres = await getGenres();

  // ① mood未指定(または不正な値)の場合: 気分を選ぶボタン一覧だけを表示して終わり。
  // ここでreturnして関数を抜けるので、この下の「映画を検索する処理」は実行されない。
  if (!moodOption) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">今日はどんな気分？</h1>
        <div className="flex flex-wrap gap-3">
          {MOOD_OPTIONS.map((m) => (
            <Link
              key={m.key}
              href={`/mood?mood=${m.key}`}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-base hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {m.emoji} {m.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ② ここから先はmoodOptionが必ず存在する状態(①でreturnしなかった場合のみ到達する)。

  // 絞り込みフォームでジャンルを明示的に選んでいればそちらを、
  // 選んでいなければ気分に対応する「おすすめジャンル」を使う。
  const withGenres = genre ? genre : moodOption.genreIds.join(",");
  // 並び順も同じ考え方: ユーザーが明示的に選んでいればそちらを、
  // 選んでいなければ気分ごとのおすすめの並び順(設定されていれば)を使う。
  const sortBy = sort ?? moodOption.sortBy;

  const movies = await discoverMovies({
    withGenres,
    // runtimeは文字列("120")で来るのでNumber()で数値に変換。未指定ならundefined(絞り込みなし)
    withRuntimeLte: runtime ? Number(runtime) : undefined,
    // yearは"2020"のような年だけの文字列なので、TMDbが求める日付形式(YYYY-MM-DD)に変換
    primaryReleaseDateGte: year ? `${year}-01-01` : undefined,
    sortBy,
    page: currentPage,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">
          {moodOption.emoji} {moodOption.label}
        </h1>
        {/* ?mood=無しの/moodに戻ることで、①の気分選択画面に戻れるようにしている */}
        <Link href="/mood" className={SUBTLE_LINK_CLASS}>
          気分を選び直す
        </Link>
      </div>

      {/* 絞り込みフォーム。SearchBarと同じ、素のHTMLフォーム(GET送信)による実装。
          hidden inputで現在の気分(mood)を必ず一緒に送信することで、
          「ジャンルだけ変えて絞り込む」時も気分の選択状態を保持できる。 */}
      <form
        action="/mood"
        method="GET"
        className={`flex flex-wrap items-end gap-4 ${FORM_PANEL_CLASS}`}
      >
        <input type="hidden" name="mood" value={moodOption.key} />

        <FormSelect
          label="ジャンル"
          name="genre"
          defaultValue={genre ?? ""}
          placeholder={`おすすめ（${moodOption.label}に合うジャンル）`}
          options={genres.map((g) => ({ value: String(g.id), label: g.name }))}
        />

        <FormSelect
          label="上映時間"
          name="runtime"
          defaultValue={runtime ?? ""}
          options={RUNTIME_OPTIONS}
        />

        <FormSelect
          label="公開年"
          name="year"
          defaultValue={year ?? ""}
          options={YEAR_OPTIONS}
        />

        <FormSelect
          label="並び替え"
          name="sort"
          defaultValue={sort ?? moodOption.sortBy ?? SORT_OPTIONS[0].value}
          options={SORT_OPTIONS}
        />

        <button type="submit" className={BUTTON_CLASS}>
          絞り込む
        </button>
      </form>

      <MovieGrid movies={movies.results} genres={genres} />
      {/* ページ送りしても mood・genre・runtime・year・sort の条件が消えないように、
          今の検索条件を全部Paginationに渡している */}
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath="/mood"
        searchParams={{ mood, genre, runtime, year, sort }}
      />
    </div>
  );
}
