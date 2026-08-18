import Image from "next/image";
import Link from "next/link";
import { getMoodOption, MOOD_OPTIONS } from "@/lib/moodMap";
import { CURATED_PROVIDER_NAMES } from "@/lib/providers";
import {
  discoverMovies,
  getGenres,
  getWatchProviders,
  tmdbImageUrl,
} from "@/lib/tmdb";

// /gacha に対応するページ。「映画ガチャ」機能。
// このページも/moodと同じく、URLのクエリパラメータの有無で2つの状態を出し分けている:
//   ① provider未指定 → サブスク・ジャンル・気分を選ぶフォームだけを表示
//   ② provider指定あり → 条件に合う映画の中からランダムに1本選んで結果を表示

interface GachaPageProps {
  searchParams: Promise<{
    provider?: string; // 選択したサブスクの配信サービスID(必須項目)
    genre?: string; // 任意で選んだジャンルID
    mood?: string; // 任意で選んだ気分のkey
  }>;
}

export default async function GachaPage({ searchParams }: GachaPageProps) {
  const { provider, genre, mood } = await searchParams;
  const moodOption = mood ? getMoodOption(mood) : undefined;

  const [genres, providers] = await Promise.all([getGenres(), getWatchProviders()]);
  const curatedProviders = CURATED_PROVIDER_NAMES.map((name) =>
    providers.find((p) => p.provider_name === name)
  ).filter((p): p is NonNullable<typeof p> => Boolean(p));

  // ① providerが選ばれていない場合は、条件を選ぶフォームだけを表示して終わり。
  if (!provider) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">🎰 映画ガチャ</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          サブスクを選んでガチャを回すと、条件に合う映画をランダムに1本引き当てます。
          ジャンル・気分は任意です(絞り込むほどガチャの母数は減ります)。
        </p>
        <form
          action="/gacha"
          method="GET"
          className="flex flex-col gap-4 rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900"
        >
          <label className="flex flex-col gap-1">
            サブスク(必須)
            <select
              name="provider"
              required
              defaultValue=""
              className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
            >
              <option value="" disabled>
                選んでください
              </option>
              {curatedProviders.map((p) => (
                <option key={p.provider_id} value={p.provider_id}>
                  {p.provider_name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            気分(任意)
            <select
              name="mood"
              defaultValue=""
              className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
            >
              <option value="">指定なし</option>
              {MOOD_OPTIONS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            ジャンル(任意)
            <select
              name="genre"
              defaultValue=""
              className="rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800"
            >
              <option value="">指定なし</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="rounded-full bg-black px-6 py-2 text-white dark:bg-white dark:text-black"
          >
            🎰 ガチャを回す
          </button>
        </form>
      </div>
    );
  }

  // ② ここから先はprovider指定ありのモード = 実際にガチャを引く処理。

  // ジャンル指定があればそちらを優先し、なければ気分に紐づくジャンルで絞り込む
  // (provider/[id]ページと同じ考え方)。
  const withGenres = genre ? genre : moodOption?.genreIds.join(",");

  // ガチャの手順:
  // 1. まず1ページ目を取得して、条件に合う映画が全部で何ページ分あるか(total_pages)を調べる。
  const firstPage = await discoverMovies({
    withWatchProviders: provider,
    withGenres,
    page: 1,
  });

  const providerLabel =
    curatedProviders.find((p) => String(p.provider_id) === provider)?.provider_name ??
    "選択中のサービス";

  // 条件に合う映画が1本も無かった場合は、ガチャを実行せずに案内だけ表示する。
  if (firstPage.total_results === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-bold">🎰 映画ガチャ</h1>
        <p className="text-zinc-500">
          条件に合う映画が見つかりませんでした。条件を変えてもう一度試してください。
        </p>
        <Link href="/gacha" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
          条件を選び直す
        </Link>
      </div>
    );
  }

  // 2. 何ページ目を見るかをランダムに決める(TMDbはpage=500が上限)。
  //    Math.random()は0以上1未満の乱数を返すので、
  //    それにページ数を掛けてMath.floor()で切り捨てると「0〜(ページ数-1)」の整数になり、
  //    +1することで「1〜ページ数」の範囲に収まる。
  //
  // ESLintの新しいReact Hooksルールは「レンダー中にMath.random()のような
  // 非純粋(呼ぶたびに結果が変わる)な関数を呼ぶな」と警告してくる。これは通常、
  // 同じ画面を何度も描画し直すクライアント側のコンポーネントで、描画のたびに
  // 結果が変わってチラつく事故を防ぐためのルール。
  // しかしこのファイルはServer Component で、リクエスト(ページ読み込み)ごとに
  // 1回だけ実行される。「毎回ランダムに選ぶ」こと自体がこのガチャ機能の目的なので、
  // ここでは意図的にルールを無効化している。
  const maxPage = Math.min(firstPage.total_pages, 500);
  // eslint-disable-next-line react-hooks/purity -- Server Componentでリクエスト毎に1回だけ実行される。ランダム抽選が本機能の目的
  const randomPage = Math.floor(Math.random() * maxPage) + 1;

  // 3. 選んだページを実際に取得する(たまたま1ページ目が選ばれた場合は再利用してリクエストを省く)。
  const pageResult =
    randomPage === 1
      ? firstPage
      : await discoverMovies({ withWatchProviders: provider, withGenres, page: randomPage });

  // 4. そのページの中(最大20件)から、さらにランダムに1本選ぶ。
  //    こうして「全候補の中からのランダムなページ」×「そのページ内でのランダムな1件」の
  //    2段階抽選にすることで、TMDbの何千件もある結果を全部ダウンロードせずに
  //    ある程度公平にランダム抽選ができる。
  const picked =
    // eslint-disable-next-line react-hooks/purity -- 上と同じ理由でランダム抽選が意図的
    pageResult.results[Math.floor(Math.random() * pageResult.results.length)];

  const posterUrl = tmdbImageUrl(picked.poster_path, "w500");
  const year = picked.release_date ? picked.release_date.slice(0, 4) : "----";
  const genreLabel = genre ? genres.find((g) => String(g.id) === genre)?.name : undefined;

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-xl font-bold">🎰 映画ガチャ結果</h1>
      <p className="text-sm text-zinc-500">
        {providerLabel}
        {moodOption && ` / ${moodOption.emoji}${moodOption.label}`}
        {genreLabel && ` / ${genreLabel}`}
        {" "}から抽選しました
      </p>

      {/* 抽選結果カード。映画詳細ページのポスター表示と似た作りだが、
          このページ専用に1本だけを大きく見せるレイアウトにしている */}
      <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-zinc-900">
        <div className="relative aspect-2/3 w-full bg-zinc-200 dark:bg-zinc-800">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={picked.title}
              fill
              sizes="384px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
              No Image
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h2 className="text-lg font-bold">{picked.title}</h2>
          <p className="text-sm text-zinc-500">
            {year} / ★ {picked.vote_average.toFixed(1)}
          </p>
          <p className="line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            {picked.overview || "あらすじ情報がありません"}
          </p>
          <Link
            href={`/movie/${picked.id}`}
            className="mt-2 rounded-full bg-black px-4 py-2 text-center text-sm text-white dark:bg-white dark:text-black"
          >
            詳細を見る
          </Link>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        {/* 「もう一度回す」は今と同じ条件(provider/genre/mood)をhidden inputで
            もう一度送信しているだけ。GETフォームなのでブラウザが実際にページを
            再読み込みしてくれて、その結果このページ関数がもう一度実行され、
            Math.random()が呼び直されて別の映画が選ばれる、という仕組み。 */}
        <form action="/gacha" method="GET">
          <input type="hidden" name="provider" value={provider} />
          {genre && <input type="hidden" name="genre" value={genre} />}
          {mood && <input type="hidden" name="mood" value={mood} />}
          <button
            type="submit"
            className="rounded-full border border-black/20 px-4 py-2 hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
          >
            🎲 もう一度回す
          </button>
        </form>
        <Link
          href="/gacha"
          className="rounded-full border border-black/20 px-4 py-2 hover:bg-black/5 dark:border-white/30 dark:hover:bg-white/10"
        >
          条件を選び直す
        </Link>
      </div>
    </div>
  );
}
