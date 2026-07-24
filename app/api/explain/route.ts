import { NextRequest, NextResponse } from "next/server";

type NewsItem = {
  source: string;
  title: string;
  summary: string;
  time: string;
  url: string;
};

type WikiData = {
  title: string;
  extract: string;
  url: string;
  related: string[];
};

const USER_AGENT = "KotonohaNewsGuide/1.0 (educational news glossary)";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function firstSentence(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^.*?[。！？]/);
  return (match?.[0] ?? (clean.slice(0, 100) || "ニュースで使われる言葉です。")).trim();
}

async function fetchWikipedia(term: string): Promise<WikiData | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    generator: "search",
    gsrsearch: term,
    gsrlimit: "1",
    prop: "extracts|info|links",
    exintro: "1",
    explaintext: "1",
    inprop: "url",
    plnamespace: "0",
    pllimit: "8",
  });

  const response = await fetch(`https://ja.wikipedia.org/w/api.php?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });
  if (!response.ok) return null;
  const data = await response.json();
  const page = data?.query?.pages?.[0];
  if (!page?.extract) return null;

  return {
    title: page.title,
    extract: String(page.extract).slice(0, 4000),
    url: page.fullurl,
    related: (page.links ?? [])
      .map((link: { title?: string }) => link.title)
      .filter((title: unknown): title is string => typeof title === "string")
      .slice(0, 5),
  };
}

async function fetchNews(term: string): Promise<NewsItem[]> {
  const query = encodeURIComponent(`${term} when:30d`);
  const response = await fetch(
    `https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`,
    { headers: { "User-Agent": USER_AGENT }, cache: "no-store" },
  );
  if (!response.ok) return [];
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 3);

  return items.map((match) => {
    const block = match[1];
    const rawTitle = decodeXml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
    const url = decodeXml(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "");
    const published = decodeXml(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "");
    const sourceMatch = rawTitle.match(/\s+-\s+([^-]+)$/);
    const source = sourceMatch?.[1]?.trim() || "Googleニュース";
    const title = sourceMatch ? rawTitle.slice(0, sourceMatch.index).trim() : rawTitle;
    const date = published ? new Date(published) : null;

    return {
      source,
      title,
      summary: `最近の報道で「${term}」がどのように使われているか確認できる記事です。`,
      time: date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" }).format(date)
        : "最近",
      url,
    };
  }).filter((item) => item.title && item.url);
}

function fallbackEntry(term: string, wiki: WikiData | null, news: NewsItem[]) {
  const extract = wiki?.extract ||
    `「${term}」について、Wikipediaに一致する解説が見つかりませんでした。下の最新ニュースを見比べながら、どのような場面で使われているか確認できます。`;
  const related = wiki?.related.length
    ? wiki.related.slice(0, 3).map((word) => ({
        term: word,
        text: `「${term}」と一緒にWikipediaで説明されている関連項目です。`,
      }))
    : [
        { term: `${term} ニュース`, text: "最近の出来事から意味や使われ方を確認できます。" },
        { term: `${term} 解説`, text: "複数の資料を見比べると理解が深まります。" },
      ];

  return {
    term,
    reading: "",
    category: "ことば",
    oneLine: firstSentence(extract),
    meaning: extract.slice(0, 1200),
    analogy: "まず上の短い説明を読み、下の記事で実際の使われ方を確かめると理解しやすくなります。",
    background: [
      {
        title: "まず押さえたいこと",
        text: wiki
          ? `この説明はWikipediaの「${wiki.title}」をもとにしています。出来事によって意味合いが変わる場合は、最新記事も確認しましょう。`
          : "同じ言葉でも分野や記事によって意味が変わることがあります。複数の記事の文脈を比べることが大切です。",
      },
      {
        title: "ニュースを読むコツ",
        text: "だれが、いつ、何の目的でこの言葉を使ったのかに注目すると、ニュースの要点をつかみやすくなります。",
      },
    ],
    related,
    news,
    sources: wiki ? [{ title: `Wikipedia「${wiki.title}」`, url: wiki.url }] : [],
    generatedBy: "wikipedia" as const,
  };
}

async function generateWithGemini(term: string, wiki: WikiData | null, news: NewsItem[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `あなたは「コトノハ」というニュース用語解説サービスの編集者です。
検索語「${term}」を、前提知識のない中学生が理解できる自然な日本語で説明してください。
Wikipedia資料と直近30日のニュース見出しだけを根拠にし、資料にない最新事実を作らないでください。
歴史・政治・宗教・戦争などの前提が必要ならbackgroundでやさしく補足してください。

Wikipedia資料:
${wiki?.extract ?? "該当資料なし"}

ニュース見出し:
${news.map((item) => `- ${item.title}（${item.source}）`).join("\n") || "該当記事なし"}

次のJSONだけを返してください。
{
  "reading": "ひらがなの読み。わからなければ空文字",
  "category": "政治・国際・経済・社会・科学・文化・ことばのいずれか",
  "oneLine": "35〜60文字程度のひとことでの説明",
  "meaning": "中学生向けの詳しい説明。250〜450文字",
  "analogy": "身近で正確なたとえ。80〜160文字",
  "background": [{"title":"短い見出し","text":"説明"}],
  "related": [{"term":"関連語","text":"その意味を一文で"}]
}
backgroundは2〜3件、relatedは3件にしてください。`;

  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 1600,
        },
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.warn("Gemini API fallback:", response.status, errorText.slice(0, 500));
    return null;
  }
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text);
    if (!parsed.oneLine || !parsed.meaning || !Array.isArray(parsed.background) || !Array.isArray(parsed.related)) {
      return null;
    }
    return {
      term,
      reading: String(parsed.reading ?? ""),
      category: String(parsed.category ?? "ことば"),
      oneLine: String(parsed.oneLine),
      meaning: String(parsed.meaning),
      analogy: String(parsed.analogy ?? ""),
      background: parsed.background.slice(0, 3),
      related: parsed.related.slice(0, 3),
      news,
      sources: wiki ? [{ title: `Wikipedia「${wiki.title}」`, url: wiki.url }] : [],
      generatedBy: "gemini" as const,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const term = String(body?.term ?? "").replace(/\s+/g, " ").trim();
    if (!term || term.length > 50) {
      return NextResponse.json({ error: "1〜50文字の言葉を入力してください。" }, { status: 400 });
    }

    const [wiki, news] = await Promise.all([
      fetchWikipedia(term).catch(() => null),
      fetchNews(term).catch(() => []),
    ]);
    const generated = await generateWithGemini(term, wiki, news).catch(() => null);
    const entry = generated ?? fallbackEntry(term, wiki, news);

    return NextResponse.json(
      { entry, fallback: !generated },
      { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
    );
  } catch {
    return NextResponse.json(
      { error: "うまく調べられませんでした。少し時間をおいて、もう一度お試しください。" },
      { status: 500 },
    );
  }
}
