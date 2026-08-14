import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string; // 「前へ/次へ」のリンク先のベースになるパス(例: "/search", "/genre/27")
  // ページ番号以外に維持したい検索条件(例: q="アベンジャーズ"、mood="cry")。
  // 「次のページへ」のリンクを踏んでも検索条件が消えないようにするために必要。
  searchParams?: Record<string, string | undefined>;
}

// 「/search?q=xxx&page=2」のような、ページ番号入りのURLを組み立てるヘルパー関数。
// URLSearchParamsは「?key=value&key2=value2」の形式を扱いやすくしてくれる標準API。
function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  // 既存の検索条件(qやmoodなど)を、値が入っているものだけコピーする
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  // 最後にページ番号をセットする
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

// 「← 前へ」「1 / 5」「次へ →」を表示する、ページ送りの共通コンポーネント。
// 検索結果・ジャンル検索・気分検索・サブスク検索など、一覧系のページはすべてこれを使っている。
export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  // TMDbのsearch/discover系エンドポイントはpage=500が上限
  // (それ以上遠いページは実際にはリクエストしてもエラーになるため、事前に制限しておく)
  const maxPage = Math.min(totalPages, 500);
  // ページが1ページしかない(=ページ送りが不要な)場合は、何も表示しない。
  // nullを返すとReactはその部分を何も描画しない。
  if (maxPage <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav className="flex items-center justify-center gap-4 py-8 text-sm">
      {/* 1ページ目にいる時は「前へ」を押せないようにする(リンクではなくただのテキストにする) */}
      {prevPage >= 1 ? (
        <Link
          href={buildHref(basePath, prevPage, searchParams)}
          className="rounded border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          ← 前へ
        </Link>
      ) : (
        <span className="rounded border border-black/5 px-3 py-1.5 text-zinc-400 dark:border-white/10">
          ← 前へ
        </span>
      )}
      <span className="text-zinc-500">
        {currentPage} / {maxPage}
      </span>
      {/* 最終ページにいる時は同様に「次へ」を無効化する */}
      {nextPage <= maxPage ? (
        <Link
          href={buildHref(basePath, nextPage, searchParams)}
          className="rounded border border-black/10 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          次へ →
        </Link>
      ) : (
        <span className="rounded border border-black/5 px-3 py-1.5 text-zinc-400 dark:border-white/10">
          次へ →
        </span>
      )}
    </nav>
  );
}
