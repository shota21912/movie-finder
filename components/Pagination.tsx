import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  // TMDbのsearch/discover系エンドポイントはpage=500が上限
  const maxPage = Math.min(totalPages, 500);
  if (maxPage <= 1) return null;

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav className="flex items-center justify-center gap-4 py-8 text-sm">
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
