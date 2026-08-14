"use client";

import { useState } from "react";
import type { Review } from "@/types/tmdb";

// ファイル冒頭の "use client" は、このコンポーネントを「クライアントコンポーネント」に
// する宣言。これが無いと、Next.jsのApp Routerではデフォルトで全て「サーバーコンポーネント」
// (サーバー側だけで実行され、ブラウザにJSが送られない)として扱われる。
// このコンポーネントは「ボタンを押したら状態が変わる」という
// ブラウザ側のインタラクション(useStateやonClick)が必要なので、"use client"が必須になる。
// このファイル以外(app/以下のpage.tsxなど)は基本的にサーバーコンポーネントのまま。

// 口コミ1件分を表示するカード。「日本語に翻訳」ボタンを押すと、
// ページ遷移せずにその場で表示内容を翻訳結果に差し替える。
export default function ReviewCard({ review }: { review: Review }) {
  // useStateはReactの「状態(state)」を管理するための仕組み。
  // 値が変わると、Reactが自動的に画面を再描画してくれる。
  // [現在の値, 値を更新するための関数] のペアが返ってくる、というのがuseStateの決まった形。
  const [translated, setTranslated] = useState<string | null>(null); // 翻訳結果(まだ翻訳してなければnull)
  const [loading, setLoading] = useState(false); // 翻訳API呼び出し中かどうか
  const [error, setError] = useState<string | null>(null); // エラーメッセージ

  // 「日本語に翻訳」ボタンが押された時に実行される関数。
  // 自分のサーバーの /api/translate (app/api/translate/route.ts)にレビュー本文を送り、
  // 翻訳結果を受け取ってstateにセットする。
  async function handleTranslate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: review.content }),
      });
      if (!res.ok) throw new Error("translate failed");
      const data = (await res.json()) as { translated: string };
      // ここでsetTranslatedを呼ぶと、translatedの値が変わり、
      // Reactが自動的にこのコンポーネントを再描画して翻訳結果を画面に反映してくれる。
      setTranslated(data.translated);
    } catch {
      setError("翻訳に失敗しました");
    } finally {
      // 成功しても失敗しても、最後は必ずloadingをfalseに戻す
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{review.author}</span>
        {/* != null は「nullでもundefinedでもない」ことをチェックする書き方。
            rating(点数)が0点の場合、!ratingだと0がfalsy扱いされて消えてしまうため
            != nullを使って区別している */}
        {review.author_details.rating != null && (
          <span className="text-xs text-zinc-500">
            ★ {review.author_details.rating}/10
          </span>
        )}
      </div>
      {/* translatedがnullでなければ(=翻訳済みなら)翻訳結果を、そうでなければ原文(英語)を表示する。
          ?? は「左側がnull/undefinedだったら右側を使う」というNull合体演算子 */}
      <p className="whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300">
        {translated ?? review.content}
      </p>
      <div className="mt-2 flex items-center gap-3 text-xs">
        {/* 翻訳済みかどうかでボタンの表示・動作を切り替える */}
        {translated ? (
          <button
            type="button"
            onClick={() => setTranslated(null)}
            className="text-blue-600 hover:underline dark:text-blue-400"
          >
            原文を表示
          </button>
        ) : (
          <button
            type="button"
            onClick={handleTranslate}
            disabled={loading}
            className="text-blue-600 hover:underline disabled:opacity-50 dark:text-blue-400"
          >
            {loading ? "翻訳中..." : "日本語に翻訳"}
          </button>
        )}
        {error && <span className="text-red-500">{error}</span>}
      </div>
    </div>
  );
}
