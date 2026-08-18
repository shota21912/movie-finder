// 「受賞作品を探す」機能で選べる賞の一覧。
// TMDb自体には受賞データが無いので、各賞をWikidata(Wikipediaの構造化データ版)上の
// QID(Wikidataでの識別番号)と結びつけておき、lib/wikidata.tsで実際の受賞作品リストを
// 問い合わせる時に使う。新しい賞を追加したい時は、Wikidataで該当ページのQIDを調べて
// この配列に1項目足すだけでよい。
export interface AwardOption {
  key: string; // URLの?award=xxxに使う内部的な識別子
  label: string; // 画面に表示する日本語ラベル
  wikidataId: string; // Wikidata上のQID(例: "Q102427" = アカデミー賞作品賞)
}

export const AWARD_OPTIONS: AwardOption[] = [
  { key: "oscar-picture", label: "アカデミー賞 作品賞", wikidataId: "Q102427" },
  { key: "cannes-palme", label: "カンヌ国際映画祭 パルム・ドール", wikidataId: "Q179808" },
  { key: "berlin-bear", label: "ベルリン国際映画祭 金熊賞", wikidataId: "Q154590" },
  { key: "venice-lion", label: "ヴェネツィア国際映画祭 金獅子賞", wikidataId: "Q209459" },
];

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
