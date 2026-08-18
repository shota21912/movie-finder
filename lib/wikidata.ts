// TMDbには映画の受賞歴データが無いため、「受賞作品を探す」機能だけは
// Wikidata(Wikipediaの中身を構造化データとして誰でも自由に問い合わせられるサービス)から
// 受賞作品の一覧を取得している。Wikidataへの問い合わせには「SPARQL」という
// データベース検索専用の言語を使う(SQLのWikidata版、というイメージ)。

const WIKIDATA_SPARQL_URL = "https://query.wikidata.org/sparql";
// Wikidata側のガイドラインで「何のアプリからのアクセスか分かるUser-Agentを付けること」が
// 強く推奨されている(無いとレート制限されやすい)。
const USER_AGENT = "MovieFinderLearningProject/1.0 (personal learning project)";

export interface AwardWinner {
  title: string; // 映画タイトル(英語。TMDb側の検索に使うだけなので画面には出さない)
  year: number | null; // 受賞年
  imdbId: string | null; // IMDbの作品ID。TMDb側の映画と紐付けるために使う
}

// 指定した賞(WikidataのQID)を受賞した映画の一覧を取得する。
//
// SPARQLクエリの読み方:
// ・?film wdt:P166 wd:{wikidataId}  → 「?filmが、この賞(P166=受賞歴)を受けている」
// ・?film wdt:P31 wd:Q11424         → 「?filmが、Q11424(=映画というクラス)のインスタンスである」
//   (これが無いと、同じ賞を受けた監督やプロデューサー個人まで結果に混ざってしまう)
// ・OPTIONAL { ?film wdt:P345 ?imdbId. } → IMDb IDがあれば一緒に取得する(無い映画もある)
// ・p:P166/ps:P166/pq:P585 の3行 → 「いつ受賞したか」という年の情報を取り出すための
//   Wikidata特有の書き方(1つの受賞記録に対して、年月日などの付加情報が別に紐づいている)
export async function getAwardWinners(wikidataId: string): Promise<AwardWinner[]> {
  const query = `
    SELECT ?film ?filmLabel ?year ?imdbId WHERE {
      ?film wdt:P166 wd:${wikidataId}.
      ?film wdt:P31 wd:Q11424.
      OPTIONAL { ?film wdt:P345 ?imdbId. }
      OPTIONAL {
        ?film p:P166 ?awardStatement.
        ?awardStatement ps:P166 wd:${wikidataId}.
        ?awardStatement pq:P585 ?pointInTime.
      }
      BIND(YEAR(?pointInTime) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    ORDER BY DESC(?year)
  `;

  const url = new URL(WIKIDATA_SPARQL_URL);
  url.searchParams.set("query", query);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
    // 受賞リストは年に1回程度しか更新されないので、24時間キャッシュしてWikidataへの
    // 問い合わせ回数を減らす(lib/tmdb.tsのtmdbFetchと同じNext.jsのキャッシュ機能)。
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Wikidata APIエラー: ${res.status}`);
  }

  // SPARQLの結果は data.results.bindings という配列に、
  // 1件ごとに { filmLabel: { value: "..." }, year: { value: "..." }, ... } という形で入っている。
  const data = (await res.json()) as {
    results: { bindings: Array<Record<string, { value: string }>> };
  };

  return data.results.bindings.map((binding) => ({
    title: binding.filmLabel?.value ?? "",
    year: binding.year?.value ? Number(binding.year.value) : null,
    imdbId: binding.imdbId?.value ?? null,
  }));
}
