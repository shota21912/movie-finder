import Link from "next/link";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-black/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🎬 Movie Finder
          </Link>
          <nav className="flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/mood" className="hover:text-black dark:hover:text-white">
              気分から探す
            </Link>
          </nav>
        </div>
        <SearchBar />
      </div>
    </header>
  );
}
