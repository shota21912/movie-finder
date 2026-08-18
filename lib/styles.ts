// 検索結果ページ(mood, gacha, provider, genre, awards)は見た目がとても似ているため、
// フォーム部品のTailwindクラス文字列がどのファイルにもほぼ同じ形でコピペされていた。
// 同じ見た目を変えたくなった時に5箇所も書き換えるのは大変なので、ここに1箇所だけ定義しておき、
// 各ページはこの定数をimportして使う(DRY = Don't Repeat Yourselfという考え方)。

// <select>や<input>など、フォーム部品1つ分の見た目
export const FORM_FIELD_CLASS =
  "rounded border border-black/10 bg-white px-2 py-1 dark:border-white/20 dark:bg-zinc-800";

// フォーム全体を囲む、角丸+枠線+背景付きのパネル(mood/provider/gacha/awardsページで使用)
export const FORM_PANEL_CLASS =
  "rounded-lg border border-black/10 bg-white p-4 text-sm dark:border-white/10 dark:bg-zinc-900";

// 「絞り込む」「適用」など、控えめなサイズの送信ボタン
export const BUTTON_CLASS =
  "rounded bg-black px-4 py-1.5 text-white dark:bg-white dark:text-black";

// 「🎲 ガチャを回す」「検索する」など、目立たせたい大きめの丸い送信ボタン
export const BUTTON_FULL_CLASS =
  "rounded-full bg-black px-6 py-2 text-white dark:bg-white dark:text-black";

// 「気分を選び直す」「条件を選び直す」など、見出し横に添える控えめなリンク
export const SUBTLE_LINK_CLASS = "text-sm text-zinc-500 hover:underline";
