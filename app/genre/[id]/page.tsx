import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
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
  searchParams: Promise<{ name?: string; page?: string }>;
}

export default async function GenrePage({
  params,
  searchParams,
}: GenrePageProps) {
  const { id } = await params;
  const { name, page = "1" } = await searchParams;
  const currentPage = Number(page) || 1;

  const [movies, genres] = await Promise.all([
    // discoverMoviesはlib/tmdb.tsの汎用検索関数。withGenresにジャンルIDを渡すと
    // 「そのジャンルの映画一覧」を取得できる。
    discoverMovies({ withGenres: id, page: currentPage }),
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
      <h1 className="text-xl font-bold">{title}の映画</h1>
      <MovieGrid movies={movies.results} genres={genres} />
      <Pagination
        currentPage={currentPage}
        totalPages={movies.total_pages}
        basePath={`/genre/${id}`}
        searchParams={{ name: title }}
      />
    </div>
  );
}
