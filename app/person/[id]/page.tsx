import Image from "next/image";
import MovieGrid from "@/components/MovieGrid";
import {
  getGenres,
  getPersonDetail,
  getPersonMovieCredits,
  tmdbImageUrl,
} from "@/lib/tmdb";

// /person/{id} に対応する、俳優1人分の詳細ページ。

interface PersonPageProps {
  params: Promise<{ id: string }>; // [id] = TMDbの人物ID
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const personId = Number(id);

  // プロフィール・出演作品一覧・ジャンル名解決用の一覧を同時に取得
  const [person, credits, genres] = await Promise.all([
    getPersonDetail(personId),
    getPersonMovieCredits(personId),
    getGenres(),
  ]);

  const photoUrl = tmdbImageUrl(person.profile_path, "w342");
  // TMDbから返ってくる出演作品の並び順はバラバラなので、公開日が新しい順に並び替えている。
  // [...credits.cast] は配列をコピーしてからsortしている(元の配列を直接書き換えないため)。
  // sortの比較関数は「マイナスを返すとa,bの順のまま、プラスを返すとb,aの順に入れ替える」という
  // 決まりなので、b.localeCompare(a) と逆にすることで新しい日付が先に来るようにしている。
  const movies = [...credits.cast].sort((a, b) =>
    (b.release_date ?? "").localeCompare(a.release_date ?? "")
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="w-40 shrink-0">
          <div className="relative aspect-square w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            {photoUrl && (
              <Image
                src={photoUrl}
                alt={person.name}
                fill
                sizes="160px"
                className="object-cover"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{person.name}</h1>
          {/* 生年月日・出身地・経歴はTMDbにデータが無い人物もいるので、
              あるものだけを表示する(&&は左がtrueの時だけ右を表示するReactの定番パターン) */}
          {person.birthday && (
            <p className="text-sm text-zinc-500">生年月日: {person.birthday}</p>
          )}
          {person.place_of_birth && (
            <p className="text-sm text-zinc-500">出身: {person.place_of_birth}</p>
          )}
          {person.biography && (
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">出演作品</h2>
        <MovieGrid movies={movies} genres={genres} />
      </section>
    </div>
  );
}
