"use client";

// app/error.tsx もNext.jsが特別扱いするファイル名。
// このファイルの下(app/以下のどこか)でエラーが投げられると(例: lib/tmdb.tsのtmdbFetchで
// TMDB_API_KEYが無い時やAPIエラーの時)、通常のページの代わりに自動的にこの画面が表示される。
// 「再試行」ボタンを押した時に画面を作り直す必要があるので、クライアントコンポーネント
// ("use client")として作る決まりになっている。
export default function Error({
  error,
  // resetはNext.jsが用意してくれる関数。呼び出すと、エラーになった部分を
  // もう一度読み込み直そうとしてくれる(ページ全体をリロードするわけではない)。
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-lg font-semibold">エラーが発生しました</p>
      <p className="max-w-md text-sm text-zinc-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        再試行
      </button>
    </div>
  );
}
