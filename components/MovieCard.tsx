import Image from "next/image";
import Link from "next/link";
import { tmdbImageUrl } from "@/lib/tmdb";
import type { MovieSummary } from "@/types/tmdb";

// このコンポーネントが受け取るpropsの型。
// movieは必須、genreNames(ジャンル名のリスト)は無くても表示できるので?を付けて任意にしている。
interface MovieCardProps {
  movie: MovieSummary;
  genreNames?: string[];
}

// 映画1本分のカードUI。人気映画一覧・検索結果・ジャンル検索結果など、
// 「映画を並べて表示する」ほぼ全てのページでこのコンポーネントを使い回している。
// こうやって共通部品にしておくと、カードのデザインを直したい時に1箇所直すだけで
// サイト全体に反映される。
export default function MovieCard({ movie, genreNames }: MovieCardProps) {
  // TMDbが返してくるのは画像のファイル名だけなので、表示できるURLに変換する。
  const posterUrl = tmdbImageUrl(movie.poster_path, "w342");
  // release_dateは"2024-05-01"のような文字列。先頭4文字を切り出せば公開年になる。
  // slice(0, 4) は文字列の0〜3文字目(=最初の4文字)を取り出す標準のJSメソッド。
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "----";

  return (
    // カード全体を<Link>で囲んでいるので、カードのどこをクリックしても
    // /movie/{id} (この映画の詳細ページ)に遷移する。
    <Link
      href={`/movie/${movie.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-zinc-900"
    >
      {/* aspect-2/3 は「縦横比2:3」を強制するTailwindのクラス。
          映画ポスターはだいたいこの比率なので、画像が届く前でも枠の形が崩れない */}
      <div className="relative aspect-2/3 w-full bg-zinc-200 dark:bg-zinc-800">
        {posterUrl ? (
          // next/imageのImageコンポーネントは、画像の遅延読み込みやサイズ最適化を
          // 自動でやってくれるNext.js標準の仕組み。<img>タグの代わりに使う。
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          // ポスター画像が無い映画のためのフォールバック表示
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No Image
          </div>
        )}
        {/* 評価バッジ。toFixed(1)で小数点1桁までに揃える(例: 7 → "7.0") */}
        <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">
          ★ {movie.vote_average.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* line-clamp-2は「2行を超えたら…で省略する」Tailwindのクラス。
            タイトルが長い映画でもカードの高さが揃うようにしている */}
        <h3 className="line-clamp-2 text-sm font-semibold">{movie.title}</h3>
        <p className="text-xs text-zinc-500">{year}</p>
        {/* genreNamesが渡されていて、かつ中身が1件以上ある時だけジャンルを表示する */}
        {genreNames && genreNames.length > 0 && (
          <p className="line-clamp-1 text-xs text-zinc-500">
            {genreNames.join(" / ")}
          </p>
        )}
        <p className="line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">
          {movie.overview || "あらすじ情報がありません"}
        </p>
      </div>
    </Link>
  );
}
