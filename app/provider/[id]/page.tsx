import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { getMoodOption, MOOD_OPTIONS } from "@/lib/moodMap";
import { SORT_OPTIONS } from "@/lib/sortOptions";
import { discoverMovies, getGenres } from "@/lib/tmdb";

// /provider/{配信サービスID} に対応するページ(例: /provider/8 は Netflix)。
// 「サブスクから探す」機能に加えて、気分・ジャンル・並び替えによる絞り込みフォームも付けている。

interface ProviderPageProps {
  params: Promise<{ id: string }>; // [id] = 配信サービスのID(TMDbのprovider_id)
  searchParams: Promise<{
    name?: string; // サービス名(トップページから渡ってくる。見出し表示用)
    mood?: string; // 絞り込みフォームで選んだ気分のkey
    genre?: string; // 絞り込みフォームで選んだジャンルID
    sort?: string; // 絞り込みフォームで選んだ並び順
    page?: string;
  }>;
}

export default async function ProviderPage({
  params,
  searchParams,
}: ProviderPageProps) {
  const { id } = await params;
  const { name, mood, genre, sort, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;
  // moodが指定されていれば、lib/moodMap.tsの対応表からMoodOption(ジャンルIDなど)を取得する
  const moodOption = mood ? getMoodOption(mood) : undefined;

  // ジャンル指定があればそちらを優先し、なければ選んだ気分に紐づくジャンルで絞り込む
  // (例: 気分=泣きたい かつ ジャンル指定なし → 気分に紐づくドラマジャンルで絞り込み
  //      気分=泣きたい かつ ジャンル=コメディ → ユーザーが明示的に選んだコメディを優先)
  const withGenres = genre ? genre : moodOption?.genreIds.join(",");
  // 並び順も同じ考え方: ユーザーが明示的に選んでいればそちらを優先し、
  // 選んでいなければ気分に紐づくおすすめの並び順(あれば)を使う
  const sortBy = sort ?? moodOption?.sortBy;

  const [movies, genres] = await Promise.all([
    discoverMovies({
      withWatchProviders: id, // このサービスで配信されている映画に絞る
      withGenres,
      sortBy,
      page: currentPage,
    }),
    getGenres(), // 絞り込みフォームのジャンル選択肢、及びカードのジャンル名表示に使う
  ]);

  const title = name ?? "配信サービス";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold">{title}で見られる映画</h1>

      {/* 絞り込みフォーム。SearchBarと同じ考え方で、素のHTMLフォーム(GET送信)だけで
          実装している。送信すると /provider/{id}?mood=xxx&genre=yyy&sort=zzz のようなURLに
          遷移し、そのクエリパラメータをこのページ自身が上のロジックで読み取る。 */}
      <form
        action={`/provider/${id}`}
        method="GET"
        className="flex flex-wrap items-end gap-4 rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900"
      >
        {/* nameは画面には表示しないが、フォーム送信後もサービス名の表示を保つために
            hidden inputとして一緒に送信している */}
        {name && <input type="hidden" name="name" value={name} />}

        <label className="flex flex-col gap-1">
          気分
          <select
            name="mood"
            defaultValue={mood ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            <option value="">指定なし</option>
            {MOOD_OPTIONS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.emoji} {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          ジャンル
          <select
            name="genre"
            defaultValue={genre ?? ""}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            <option value="">指定なし</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          並び替え
          <select
            name="sort"
            defaultValue={sort ?? SORT_OPTIONS[0].value}
            className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="rounded bg-black px-4 py-1.5 text-white dark:bg-white dark:text-black"
        >
          絞り込む
        </button>
      </form>

      <MovieGrid movies={movies.results} genres={genres} />
      {/* ページ送りしても mood・genre・sort・サービス名の条件が消えないように、
          Paginationにも同じ検索条件を渡している */}
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/provider/${id}`}
        searchParams={{ name: title, mood, genre, sort }}
      />
    </div>
  );
}
