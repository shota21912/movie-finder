import Image from "next/image";
import Link from "next/link";
import MovieGrid from "@/components/MovieGrid";
import MovieListButtons from "@/components/MovieListButtons";
import ReviewCard from "@/components/ReviewCard";
import { CURATED_PROVIDER_NAMES } from "@/lib/providers";
import {
  getGenres,
  getMovieDetail,
  getMovieReviews,
  getWatchProviders,
  tmdbImageUrl,
} from "@/lib/tmdb";
import type { Video } from "@/types/tmdb";

// /movie/{id} に対応する、映画1本ぶんの詳細ページ。
// このサイトの中で一番情報量が多いページで、ポスター・基本情報・あらすじ・予告編・
// 出演者・配信状況・口コミ・関連映画、と縦に並べて表示している。

interface MoviePageProps {
  params: Promise<{ id: string }>; // [id] = TMDbの映画ID
}

// movie.videos?.results (予告編・ティザーなど複数の動画)の中から、
// 「表示する1本」を選ぶための関数。優先順位を付けて、一番それらしい動画を選んでいる。
// ??(Null合体演算子)は「左が見つからなければ次の候補を試す」という意味なので、
// 上から順に「公式トレーラー→トレーラー→ティザー→なんでもいいので1本目」と探している。
function pickTrailer(videos?: Video[]): Video | undefined {
  const youtubeVideos = (videos ?? []).filter((v) => v.site === "YouTube");
  return (
    youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
    youtubeVideos.find((v) => v.type === "Trailer") ??
    youtubeVideos.find((v) => v.type === "Teaser") ??
    youtubeVideos[0]
  );
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  // 映画の詳細情報・ジャンル一覧・口コミ・配信サービス一覧、の4つを同時に取得する。
  // getMovieReviewsだけ別のPromiseになっているのは、lib/tmdb.tsのコメントにある通り
  // language指定の都合でgetMovieDetailとは別リクエストにする必要があったため。
  const [movie, genres, reviewsData, providers] = await Promise.all([
    getMovieDetail(Number(id)),
    getGenres(),
    getMovieReviews(Number(id)),
    getWatchProviders(), // 「視聴可能なサービス」のサービス名をリンク化するために provider_id が必要
  ]);

  const posterUrl = tmdbImageUrl(movie.poster_path, "w500");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "----";
  // キャストは人数が多いことがあるので、表示は上位10人までに絞る
  const cast = movie.credits?.cast.slice(0, 10) ?? [];
  // movie["watch/providers"]?.results?.JP で「日本での配信状況」だけを取り出す。
  // TMDbのレスポンスキーが "watch/providers" とスラッシュ入りなので
  // ドット記法(movie.watchProviders)ではなくブラケット記法でアクセスしている
  // (詳しくはtypes/tmdb.tsのコメント参照)。
  const jpProviders = movie["watch/providers"]?.results?.JP;
  // Setを使うと「このサービス名が配信サービス一覧の中にあるかどうか」を
  // .has()で高速にチェックできる(配列の.includes()より効率がよい)。
  const flatrateNames = new Set(
    (jpProviders?.flatrate ?? []).map((p) => p.provider_name)
  );
  // サービス名(文字列)からTMDbのprovider_id(数値)を引くための対応表。
  // /provider/{id} へのリンクを組み立てるのに必要。
  const providerIdByName = new Map(providers.map((p) => [p.provider_name, p.provider_id]));
  const trailer = pickTrailer(movie.videos?.results);
  const recommendations = movie.recommendations?.results ?? [];
  const reviews = reviewsData.results;
  // MovieListButtons(「後で見る」「観た映画」ボタン)に渡すためのMovieSummary。
  // 注意: movieの型(MovieDetail)はgenre_idsではなくgenres(名前付きの配列)を持っているので、
  // ここで明示的にIDだけを取り出して詰め替えている。movieをそのまま渡すと、
  // 一覧ページでgenre_idsを読もうとした時にundefinedになってしまう。
  const movieSummary = {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    genre_ids: movie.genres.map((g) => g.id),
    vote_average: movie.vote_average,
    overview: movie.overview,
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 上段: ポスター(左)と基本情報(右)を横並びにするエリア。
          md:flex-row でスマホでは縦積み、PC(md以上)では横並びに切り替わる */}
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full shrink-0 md:w-64">
          <div className="relative aspect-2/3 w-full overflow-hidden rounded-lg bg-zinc-200 dark:bg-zinc-800">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="256px"
                className="object-cover"
                priority // このページで一番最初に表示させたい画像なのでpriority(優先読み込み)を付けている
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4">
          <h1 className="text-2xl font-bold">{movie.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <span>公開年: {year}</span>
            <span>上映時間: {movie.runtime ? `${movie.runtime}分` : "不明"}</span>
            <span>評価: ★ {movie.vote_average.toFixed(1)}</span>
          </div>
          {/* ジャンルバッジ。押すとそのジャンルの一覧ページ(/genre/[id])に飛べる */}
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Link
                key={g.id}
                href={`/genre/${g.id}?name=${encodeURIComponent(g.name)}`}
                className="rounded-full border border-black/10 px-3 py-1 text-xs hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                {g.name}
              </Link>
            ))}
          </div>

          {/* 「後で見る」「観た映画」の登録ボタン。localStorageに保存するだけの機能なので、
              サーバー(Server Component)であるこのページ自体には状態を持たせず、
              クライアントコンポーネントのMovieListButtonsに丸ごと処理を任せている */}
          <MovieListButtons movie={movieSummary} />

          <section>
            <h2 className="mb-2 text-lg font-semibold">あらすじ</h2>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {movie.overview || "あらすじ情報がありません"}
            </p>
          </section>

          {/* trailerが見つかった場合だけ予告編セクションを表示する(見つからない映画もある) */}
          {trailer && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">予告編</h2>
              {/* aspect-videoで16:9の比率を保ちつつ、YouTubeの埋め込みプレーヤーをiframeで表示 */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={trailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </section>
          )}

          {cast.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">出演者</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {cast.map((c) => {
                  const photoUrl = tmdbImageUrl(c.profile_path, "w200");
                  return (
                    // 俳優の顔写真をクリックすると俳優詳細ページ(/person/[id])に飛べる
                    <Link
                      key={c.id}
                      href={`/person/${c.id}`}
                      className="w-24 shrink-0 text-center text-xs"
                    >
                      <div className="relative mb-1 h-24 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                        {photoUrl && (
                          <Image
                            src={photoUrl}
                            alt={c.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <p className="line-clamp-1 font-medium">{c.name}</p>
                      <p className="line-clamp-1 text-zinc-500">{c.character}</p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-lg font-semibold">視聴可能なサービス</h2>
            <ul className="flex flex-col gap-1 text-sm">
              {/* 主要サービス名(CURATED_PROVIDER_NAMES)を1つずつ、
                  「このサービスの見放題ラインナップに含まれているか」を○×で表示する。
                  サービス名自体は、そのサービスの一覧ページ(/provider/[id])へのリンクにもなっている
                  (○×どちらでも押せる。×の作品でも「他に何があるか」を見に行けるようにするため)。 */}
              {CURATED_PROVIDER_NAMES.map((name) => {
                const providerId = providerIdByName.get(name);
                return (
                  <li
                    key={name}
                    className="flex items-center justify-between border-b border-black/5 py-1 dark:border-white/10"
                  >
                    {providerId ? (
                      <Link
                        href={`/provider/${providerId}?name=${encodeURIComponent(name)}`}
                        className="hover:underline"
                      >
                        {name}
                      </Link>
                    ) : (
                      <span>{name}</span>
                    )}
                    <span>{flatrateNames.has(name) ? "○" : "×"}</span>
                  </li>
                );
              })}
            </ul>
            {/* TMDb(JustWatch)には日本語字幕/吹き替えの有無というデータが無いため、
                実際の配信ページに飛んで確認してもらうための外部リンクを用意している */}
            {jpProviders?.link && (
              <a
                href={jpProviders.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-blue-600 hover:underline dark:text-blue-400"
              >
                配信ページで字幕/吹き替えの有無を確認する →
              </a>
            )}
          </section>
        </div>
      </div>

      {/* 口コミセクション。ページ上段の横並びレイアウトの外に出して、
          幅いっぱいを使って表示している。reviewsが1件も無い映画では非表示になる。 */}
      {reviews.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">口コミ</h2>
          <div className="flex flex-col gap-3">
            {reviews.slice(0, 10).map((review) => (
              // 1件ごとの表示・翻訳ボタンの処理はReviewCard(クライアントコンポーネント)に任せている
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {/* 関連映画セクション。TMDbのrecommendations(おすすめアルゴリズム)をそのまま使っている */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="mb-4 text-lg font-semibold">
            この映画を観た人はこんな映画も観ています
          </h2>
          <MovieGrid movies={recommendations.slice(0, 10)} genres={genres} />
        </section>
      )}
    </div>
  );
}
