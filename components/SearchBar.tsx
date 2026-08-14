export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="GET"
      className="flex w-full max-w-md items-center gap-2"
    >
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="映画タイトル・俳優名で検索"
        className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/20 dark:bg-zinc-900 dark:focus:border-white/40"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        検索
      </button>
    </form>
  );
}
