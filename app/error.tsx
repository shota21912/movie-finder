"use client";

export default function Error({
  error,
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
