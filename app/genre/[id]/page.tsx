import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import { SORT_OPTIONS } from "@/lib/sortOptions";
import { discoverMovies, getGenres } from "@/lib/tmdb";

// フォルダ名の [id] は Next.js の「動的ルート(Dynamic Route)」という機能。
// [id]という角括弧のフォルダ名にすると、/genre/27 や /genre/35 のように
// 数字部分が何であってもこのファイルにルーティングされ、その数字(27や35)を
// params.id として受け取れるようになる。

interface GenrePageProps {
  // 動的ルートの値([id]の部分)は params として渡ってくる。
  params: Promise<{ id: string }>;
  // トップページからのリンクで ?name=ホラー のようにジャンル名も一緒に渡しているので、
  // ここでもう一度TMDbに問い合わせなくても見出しに使えるようになっている。
  searchParams: Promise<{ name?: string; sort?: string; page?: string }>;
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { id } = await params;
  const { name, sort, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;

  const [movies, genres] = await Promise.all([
    // discoverMoviesはlib/tmdb.tsの汎用検索関数。withGenresにジャンルIDを渡すと
    // 「そのジャンルの映画一覧」を取得できる。sortByを渡すと並び順を変えられる。
    discoverMovies({ withGenres: id, sortBy: sort, page: currentPage }),
    getGenres(),
  ]);

  // 見出しに使うジャンル名の決め方(優先順位):
  // ① URLの?nameパラメータがあればそれを使う(トップページ経由ならほぼ常にこちら)
  // ② 無ければ、取得したジャンル一覧からIDが一致するものを探して名前を使う
  //    (直接URLを打って開いた場合など、?nameが無いケースのフォールバック)
  // ③ それも見つからなければ「ジャンル」という汎用的な文字列で表示する
  const title = name ?? genres.find((g) => String(g.id) === id)?.name ?? "ジャンル";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{title}の映画</h1>

        {/* 並び替えフォーム。他ページと同じく、素のHTMLフォーム(GET送信)だけで実装している */}
        <form
          action={`/genre/${id}`}
          method="GET"
          className="flex items-center gap-2 text-sm"
        >
          {name && <input type="hidden" name="name" value={name} />}
          <label className="flex items-center gap-2">
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
            className="rounded bg-black px-3 py-1.5 text-white dark:bg-white dark:text-black"
          >
            適用
          </button>
        </form>
      </div>

      <MovieGrid movies={movies.results} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/genre/${id}`}
        searchParams={{ name: title, sort }}
      />
    </div>
  );
}
