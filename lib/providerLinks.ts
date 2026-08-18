// 映画詳細ページの「視聴可能なサービス」で、○(そのサービスで観られる)のサービス名を
// 押した時に飛ばす先のURLを組み立てるための対応表。
//
// 本当は「この映画のこのサービスでの視聴ページ」(例: netflix.com/title/80166369)に
// 直接飛ばせるのが理想だが、あの数字はサービス内部だけが持つ作品IDであり、TMDbのAPIには
// 含まれていない。これを取得しようとすると、JustWatch社の非公式API(公開されていない、
// 彼らの収益モデルの根幹データ)を叩く必要が出てくるため、ここでは行わない
// (口コミ機能でFilmarksのスクレイピングを避けたのと同じ理由)。
//
// 代わりに、各サービス公式サイトの「タイトル検索」URLを組み立てて、検索結果から
// 選んでもらう形にしている。検索窓にタイトルを打ち込んだ状態のページを開くだけなので、
// 非公式APIへのアクセスやスクレイピングは発生しない。
const PROVIDER_SEARCH_URL: Record<string, (title: string) => string> = {
  Netflix: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  "Amazon Prime Video": (title) =>
    `https://www.amazon.co.jp/s?k=${encodeURIComponent(title)}&i=instant-video`,
  "Disney Plus": (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  "U-NEXT": (title) =>
    `https://video.unext.jp/freeword/search?word=${encodeURIComponent(title)}`,
  Hulu: (title) => `https://www.hulu.jp/search?q=${encodeURIComponent(title)}`,
  "Apple TV": (title) => `https://tv.apple.com/jp/search?term=${encodeURIComponent(title)}`,
};

// providerName(lib/providers.tsのCURATED_PROVIDER_NAMESと同じ表記)とmovieTitleから、
// そのサービスでの検索結果URLを組み立てる。対応表に無いサービス名ならundefinedを返す。
export function getProviderSearchUrl(
  providerName: string,
  movieTitle: string
): string | undefined {
  return PROVIDER_SEARCH_URL[providerName]?.(movieTitle);
}
