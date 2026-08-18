// 「受賞作品を探す」機能で選べる、映画祭/授賞式ごとの部門一覧。
// TMDb自体には受賞データが無いので、各部門をWikidata(Wikipediaの構造化データ版)上の
// QID(Wikidataでの識別番号)と結びつけておき、lib/wikidata.tsで実際の受賞/ノミネート作品を
// 問い合わせる時に使う。
//
// showLabelでグループ化しているのは、フォームの<select>を<optgroup>で
// 「アカデミー賞 > 作品賞/監督賞」のように見やすく分けて表示するため。
export interface AwardCategory {
  key: string; // URLの?award=xxxに使う内部的な識別子
  categoryLabel: string; // 部門名(例: "作品賞")
  wikidataId: string; // Wikidata上のQID(例: "Q102427")
}

export interface AwardShow {
  showLabel: string; // 映画祭/授賞式名(例: "アカデミー賞")
  categories: AwardCategory[];
}

export const AWARD_SHOWS: AwardShow[] = [
  {
    showLabel: "アカデミー賞",
    categories: [
      { key: "oscar-picture", categoryLabel: "作品賞", wikidataId: "Q102427" },
      { key: "oscar-director", categoryLabel: "監督賞", wikidataId: "Q103360" },
    ],
  },
  {
    showLabel: "カンヌ国際映画祭",
    categories: [
      { key: "cannes-palme", categoryLabel: "パルム・ドール", wikidataId: "Q179808" },
      { key: "cannes-director", categoryLabel: "監督賞", wikidataId: "Q510175" },
    ],
  },
  {
    showLabel: "ベルリン国際映画祭",
    categories: [
      { key: "berlin-bear", categoryLabel: "金熊賞", wikidataId: "Q154590" },
      { key: "berlin-director", categoryLabel: "監督賞(銀熊賞)", wikidataId: "Q706031" },
    ],
  },
  {
    showLabel: "ヴェネツィア国際映画祭",
    categories: [
      { key: "venice-lion", categoryLabel: "金獅子賞", wikidataId: "Q209459" },
      { key: "venice-director", categoryLabel: "監督賞(銀獅子賞)", wikidataId: "Q1337827" },
    ],
  },
  {
    showLabel: "英国アカデミー賞(BAFTA)",
    categories: [
      { key: "bafta-picture", categoryLabel: "作品賞", wikidataId: "Q139184" },
      { key: "bafta-director", categoryLabel: "監督賞", wikidataId: "Q787131" },
    ],
  },
  {
    showLabel: "日本アカデミー賞",
    categories: [
      { key: "japan-academy-picture", categoryLabel: "最優秀作品賞", wikidataId: "Q378567" },
      { key: "japan-academy-director", categoryLabel: "最優秀監督賞", wikidataId: "Q1387050" },
    ],
  },
  {
    showLabel: "トロント国際映画祭",
    categories: [
      // TIFFは作品賞/監督賞のような部門分けが無く、観客投票による単一の賞(観客賞)のみ
      { key: "tiff-peoples-choice", categoryLabel: "観客賞", wikidataId: "Q39087364" },
    ],
  },
];

// key(例: "oscar-picture")から映画祭名・部門名・WikidataのQIDを1回で引けるように、
// AWARD_SHOWSを平らな配列に変換したもの。フォームの選択結果を処理する時に使う。
export interface AwardOption {
  key: string;
  showLabel: string;
  categoryLabel: string;
  wikidataId: string;
}

export const AWARD_OPTIONS: AwardOption[] = AWARD_SHOWS.flatMap((show) =>
  show.categories.map((category) => ({
    key: category.key,
    showLabel: show.showLabel,
    categoryLabel: category.categoryLabel,
    wikidataId: category.wikidataId,
  }))
);

export function getAwardOption(key: string): AwardOption | undefined {
  return AWARD_OPTIONS.find((a) => a.key === key);
}

// 年代の絞り込み選択肢。value は "開始年-終了年" の形式にしておき、
// app/awards/page.tsx側でハイフンで分割して数値の範囲として使う。
export const ERA_OPTIONS = [
  { value: "", label: "指定なし" },
  { value: "2020-2029", label: "2020年代" },
  { value: "2010-2019", label: "2010年代" },
  { value: "2000-2009", label: "2000年代" },
  { value: "1990-1999", label: "1990年代" },
  { value: "1980-1989", label: "1980年代" },
  { value: "0-1979", label: "1970年代以前" },
];

// 「受賞」か「ノミネート」かの選択肢。lib/wikidata.tsのAwardStatusと対応している。
export const STATUS_OPTIONS = [
  { value: "winner", label: "受賞作品" },
  { value: "nominee", label: "ノミネート作品(受賞作含む)" },
];
