"use client";

import { useCallback, useEffect, useState } from "react";
import { loadMovieList, saveMovieList, type MovieListKind } from "@/lib/movieList";

// このファイルは「フック(hook)」と呼ばれる、Reactのuseで始まる特別な関数を定義している。
// フックにすることで、「観た映画/後で見るリストを画面に表示したいコンポーネント」ならどこからでも
// useMovieList("watchlist") のように呼び出すだけで、リストの中身と操作関数一式が手に入る。
// (MovieListButtons.tsxとapp/mylist/page.tsxの両方から使われている)
//
// このフックが扱うのは映画ID(number)の配列だけで、タイトルやポスターなどは持たない。
// 理由はlib/movieList.tsのコメントを参照(TMDb API利用規約の6ヶ月キャッシュ制限のため)。

export function useMovieList(kind: MovieListKind) {
  const [ids, setIds] = useState<number[]>([]);
  // localStorageから読み込みが完了したかどうかのフラグ。
  // 最初の描画時点(ids=[])と「本当に0件だった場合」を区別するために必要
  // (区別しないと、まだ読み込み中なだけなのに「リストは空です」と一瞬表示されてしまう)。
  const [loaded, setLoaded] = useState(false);

  // useEffectは「画面が表示された後に1回だけ実行したい処理」を書くためのReactの仕組み。
  // ここでは「コンポーネントが画面に出た直後に、localStorageから保存済みのリストを読み込む」
  // という処理をしている。第2引数の[kind]は「kindの値が変わった時だけ再実行する」という指定
  // (例えばwatchlist用とwatched用の2つでこのフックを別々に使う場合に必要)。
  //
  // あえてuseEffectの中でsetIds(setState)を呼んでいる理由:
  // 「use client」なコンポーネントも、最初の1回はサーバー側でHTMLを生成するために実行される。
  // その時点ではlocalStorageが存在しない(常に空)ので、もしuseStateの初期値として
  // 直接loadMovieList(kind)を使ってしまうと、サーバーで作られたHTML(空リスト)と
  // ブラウザ側の実際の中身(保存済みのリスト)が食い違い、Reactの
  // 「hydration mismatch(サーバーとクライアントの表示が一致しない)」エラーになってしまう。
  // useEffectはブラウザ側でしか実行されないので、ここで読み込むことでその問題を避けている。
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 上のコメント参照: hydration mismatch回避のため意図的
    setIds(loadMovieList(kind));
    setLoaded(true);
  }, [kind]);

  // 「このIDの映画は既にリストに入っているか」を調べる関数。
  // useCallbackで関数自体をキャッシュしているのは、ids配列が変わるたびに
  // 無駄に新しい関数を作り直さないようにするための最適化(無くても動作は変わらない)。
  const has = useCallback((id: number) => ids.includes(id), [ids]);

  // リストに映画IDを追加する関数。
  const add = useCallback(
    (id: number) => {
      setIds((prev) => {
        // 既に入っている場合は何もしない(重複追加を防ぐ)
        if (prev.includes(id)) return prev;
        const next = [id, ...prev]; // 新しく追加したIDをリストの先頭に置く
        saveMovieList(kind, next); // Reactのstateだけでなく、localStorageにも書き込んで永続化する
        return next;
      });
    },
    [kind]
  );

  // リストから映画IDを取り除く関数。
  const remove = useCallback(
    (id: number) => {
      setIds((prev) => {
        const next = prev.filter((existingId) => existingId !== id);
        saveMovieList(kind, next);
        return next;
      });
    },
    [kind]
  );

  return { ids, loaded, has, add, remove };
}
