// TMDbの/watch/providers/movieを呼ぶと、日本だけでも数十〜百件近い配信サービスが
// 返ってくる(マイナーなサービスも全部含まれる)。全部表示すると見づらいので、
// このサイトでは「よく使われる主要サービスだけ」に絞って表示している。
//
// 名前は必ずTMDb側が使っている表記(provider_name)と完全に一致させる必要がある
// (大文字小文字や表記ゆれがあると一致せず表示されなくなるので注意)。
export const CURATED_PROVIDER_NAMES = [
  "Netflix",
  "Amazon Prime Video",
  "Disney Plus",
  "U-NEXT",
  "Hulu",
  // TMDb側の表記は "Apple TV Plus" ではなく "Apple TV"(provider_id: 350)。
  // "Apple TV Plus"のまま書いていたためどこにも一致せず、Apple TV+が
  // サイトのどこにも表示されていなかった不具合を修正した。
  "Apple TV",
];
