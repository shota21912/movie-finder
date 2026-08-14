import MovieGrid from "@/components/MovieGrid";
import Pagination from "@/components/Pagination";
import PersonCard from "@/components/PersonCard";
import { getGenres, searchMovies, searchPeople } from "@/lib/tmdb";

// このファイルは /search に対応する(app/search/page.tsx)。
// ヘッダーのSearchBarから form送信されると /search?q=xxx&page=2 のようなURLに遷移してきて、
// このページがそのクエリパラメータを読み取って検索を実行する。

interface SearchPageProps {
  // Next.jsのApp Routerでは、URLの?以降(クエリパラメータ)は
  // searchParamsという名前のpropsとして自動的に渡ってくる。
  // Promise になっているのは、Next.js 15以降の仕様変更によるもの
  // (以前はただのオブジェクトだったが、非同期で扱えるように変わった)。
  // そのため中身を使う前に必ず await する必要がある。
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // 分割代入(デストラクチャリング)で q と page を取り出しつつ、
  // 未指定だった場合のデフォルト値(空文字・"1")も同時に指定している。
  const { q = "", page = "1" } = await searchParams;
  // URLのpageは文字列("2")として渡ってくるので、Number()で数値に変換する。
  // Number("abc")のように変換できない値だった場合はNaNになるので、
  // "|| 1" でその場合は1ページ目扱いにするフォールバックを入れている。
  const currentPage = Number(page) || 1;

  // 検索キーワードが空(または空白だけ)の場合は、TMDbにリクエストを送らずに
  // 案内メッセージだけを表示して早期リターンする。
  if (!q.trim()) {
    return (
      <p className="py-12 text-center text-zinc-500">
        検索キーワードを入力してください。
      </p>
    );
  }

  // 「映画タイトル検索」「俳優名検索」「ジャンル名解決用の一覧」を同時に取得する。
  const [movies, people, genres] = await Promise.all([
    searchMovies(q, currentPage),
    searchPeople(q, 1), // 俳優は横スクロールの一覧なのでページングせず1ページ目だけ取得
    getGenres(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">「{q}」の検索結果</h1>

      {/* 俳優の検索結果が1件もない場合は、このセクションごと表示しない */}
      {people.results.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">俳優</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {people.results.slice(0, 10).map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">映画</h2>
        <MovieGrid movies={movies.results} genres={genres} />
        {/* PaginationにsearchParams={{ q }}を渡すことで、
            「次へ」を押してページ番号が変わっても検索キーワードqが消えないようにしている */}
        <Pagination
          currentPage={currentPage}
          totalPages={movies.total_pages}
          basePath="/search"
          searchParams={{ q }}
        />
      </section>
    </div>
  );
}
