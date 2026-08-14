// ヘッダーに常時表示している検索ボックス。
// ポイントは、Reactのstateやイベントハンドラ(onSubmitなど)を一切使っていないこと。
// action="/search" method="GET" という、素のHTMLフォームの仕組みだけで動いている。
//
// 仕組み: このフォームを送信すると、ブラウザが自動的に
// /search?q=入力した文字列  というURLに遷移してくれる(HTMLの標準機能)。
// そのURLはapp/search/page.tsxが受け取り、そこでTMDb検索を実行して結果を表示する。
// JavaScriptを一切書かずに検索機能が実現できる、というのがこの作り方のポイント
// (JSが無効な環境でも動くし、コードもシンプルになる)。
export default function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  return (
    <form
      action="/search"
      method="GET"
      className="flex w-full max-w-md items-center gap-2"
    >
      {/* name="q" が付いているので、送信時にURLは /search?q=入力値 になる。
          defaultValueは「検索結果ページを開いた時、さっき検索した言葉を入力欄に残す」ためのもの */}
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder="映画タイトル・俳優名で検索"
        className="w-full rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none focus:border-black/30 dark:border-white/20 dark:bg-zinc-900 dark:focus:border-white/40"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        検索
      </button>
    </form>
  );
}
