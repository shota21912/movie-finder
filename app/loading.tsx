// app/loading.tsx もNext.jsが特別扱いするファイル名。
// あるページのデータ取得(TMDbへのfetchなど)がまだ終わっていない間、
// このコンポーネントの中身が自動的にページの代わりに表示される。
// 呼び出す側で何かを書く必要は無く、ただこのファイルを置いておくだけで機能する
// (React 18のSuspenseという仕組みをNext.jsが裏側で使ってくれている)。
export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <p className="text-zinc-500">読み込み中...</p>
    </div>
  );
}
