import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import { MOOD_OPTIONS } from "@/lib/moodMap";
import { CURATED_PROVIDER_NAMES } from "@/lib/providers";
import { getGenres, getPopularMovies, getWatchProviders } from "@/lib/tmdb";

// app/page.tsx は Next.js の App Router のルール上、"/" (トップページ)に対応するファイル。
// app/フォルダの中は「フォルダ構造がそのままURLの構造になる」仕組みになっていて、
// 例えば app/mood/page.tsx は /mood に、app/movie/[id]/page.tsx は /movie/123 に対応する。
//
// この関数は async(非同期)関数になっている。これは「サーバーコンポーネント」と呼ばれる
// Next.js独自の仕組みで、コンポーネントの中で直接 await を使ってデータ取得できるのが特徴。
// 従来のReactでよくある「useEffectでデータを取ってきてuseStateに入れる」という
// まわりくどい書き方が不要になる。このファイルはサーバー側だけで実行されるので、
// ここに書いたコードはブラウザには一切送られない(表示用のHTMLだけが送られる)。
export default async function Home() {
  // Promise.allで3つのAPIリクエストを同時に走らせている。
  // もし1つずつawaitで順番に取得すると合計の待ち時間が伸びてしまうので、
  // 「同時に投げて、全部終わるのを待つ」ことで表示までの時間を短くしている。
  const [popular, genres, providers] = await Promise.all([
    getPopularMovies(1),
    getGenres(),
    getWatchProviders(),
  ]);

  // getWatchProviders()は日本の配信サービスを何十件も返してくるので、
  // その中から「トップページに表示したい主要サービスだけ」を、
  // CURATED_PROVIDER_NAMES(lib/providers.ts)の順番通りに絞り込んでいる。
  const curatedProviders = CURATED_PROVIDER_NAMES.map((name) =>
    providers.find((p) => p.provider_name === name)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex flex-col gap-10">
      {/* 人気映画セクション: TMDbの人気ランキング上位10件を表示 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">🎬 人気映画</h2>
        <MovieGrid movies={popular.results.slice(0, 10)} genres={genres} />
      </section>

      {/* 気分セクション: ボタンを押すと /mood?mood=cry のようなURLに遷移し、
          そのmood値をapp/mood/page.tsxが読み取って対応するジャンルの映画を検索する */}
      <section>
        <h2 className="mb-4 text-xl font-bold">😊 今日の気分から探す</h2>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <Link
              key={mood.key}
              href={`/mood?mood=${mood.key}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {mood.emoji} {mood.label}
            </Link>
          ))}
        </div>
      </section>

      {/* サブスクセクション: /provider/{id}に遷移し、そのサービスで見られる映画一覧を表示する。
          encodeURIComponentは、サービス名に含まれる記号や日本語がURLとして壊れないように
          エスケープ(安全な文字列に変換)する標準のJS関数 */}
      <section>
        <h2 className="mb-4 text-xl font-bold">📺 サブスクから探す</h2>
        <div className="flex flex-wrap gap-2">
          {curatedProviders.map((provider) => (
            <Link
              key={provider.provider_id}
              href={`/provider/${provider.provider_id}?name=${encodeURIComponent(
                provider.provider_name
              )}`}
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {provider.provider_name}
            </Link>
          ))}
        </div>
      </section>

      {/* ジャンルセクション: TMDbが持っている全ジャンルを表示し、/genre/{id}に遷移する */}
      <section>
        <h2 className="mb-4 text-xl font-bold">🎞️ ジャンルから探す</h2>
        <div className="flex flex-wrap gap-2">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`}
              className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/20 dark:bg-zinc-900 dark:hover:bg-white/10"
            >
              {genre.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
