"use client";

import { useState } from "react";
import type { Review } from "@/types/tmdb";

export default function ReviewCard({ review }: { review: Review }) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setTranslated(data.translated);
    } catch {
      setError("翻訳に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">{review.author}</span>
        {review.author_details.rating != null && (
          <span className="text-xs text-zinc-500">
            ★ {review.author_details.rating}/10
          </span>
        )}
      </div>
      <p className="whitespace-pre-line leading-relaxed text-zinc-700 dark:text-zinc-300">
        {translated ?? review.content}
      </p>
      <div className="mt-2 flex items-center gap-3 text-xs">
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
