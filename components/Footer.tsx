// 全ページ共通のフッター。TMDb API利用規約で義務付けられているクレジット表記
// (ロゴ+指定の文言)と、配信サービス情報の提供元であるJustWatchへのクレジットを表示する。
//
// TMDb API利用規約(https://www.themoviedb.org/documentation/api/terms-of-use)の要点:
// ・TMDbのロゴを使って、TMDbを利用していることを示さなければならない
// ・そのロゴは、自分のサービスのロゴより目立たない扱いにする
// ・「This website uses TMDB and the TMDB APIs but is not endorsed, certified,
//   or otherwise approved by TMDB.」という趣旨の文言を、目立つ場所に掲載する
// これを満たすため、README(開発者向け)だけでなく、サイトを実際に見る人の目にも
// 触れるようこのフッターを全ページ共通で表示している(app/layout.tsxから呼び出し)。
//
// また、配信サービス(視聴可能なサービス)のデータはTMDb自身のデータではなく、
// TMDbが提携しているJustWatch社から提供されているものなので、
// 「In order to use this data you must attribute the source of the data as JustWatch」
// という別のルールに従い、こちらもあわせてクレジット表記している。
export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-4 py-6 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-80 hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 単なる静的ロゴ表示のためnext/imageの最適化は不要 */}
          <img src="/tmdb-logo.svg" alt="The Movie Database" className="h-4 w-auto" />
        </a>
        <p>
          This website uses TMDB and the TMDB APIs but is not endorsed, certified, or
          otherwise approved by TMDB.
        </p>
        <p>
          配信サービス(視聴可能なサービス)のデータは{" "}
          <a
            href="https://www.justwatch.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            JustWatch
          </a>{" "}
          の提供によるものです。
        </p>
      </div>
    </footer>
  );
}
