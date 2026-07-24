"use client";

import { FormEvent, useMemo, useState } from "react";

type Entry = {
  term: string;
  reading: string;
  category: string;
  oneLine: string;
  meaning: string;
  analogy: string;
  background: { title: string; text: string }[];
  related: { term: string; text: string }[];
  news: { source: string; title: string; summary: string; time: string }[];
};

const entries: Record<string, Entry> = {
  関税: {
    term: "関税",
    reading: "かんぜい",
    category: "経済",
    oneLine: "外国から入ってくる商品に、国がかける税金。",
    meaning:
      "たとえば海外で1,000円のチョコレートを買って日本に持ち込むとき、関税が100円かかれば、売るための費用は1,100円になります。国は、外国の商品が安くなりすぎて国内の会社や農家が困るのを防いだり、国の収入を得たりするために関税を使います。",
    analogy:
      "学校の文化祭で、ほかのクラスの商品だけ出店料が必要になるようなもの。自分のクラスの商品を守れますが、買う人には値段が高くなることがあります。",
    background: [
      {
        title: "どうして国どうしでもめるの？",
        text: "ある国が関税を上げると、相手の国の商品が売れにくくなります。相手も仕返しに関税を上げると、おたがいの商品が高くなり、貿易の争いに広がることがあります。",
      },
      {
        title: "歴史とのつながり",
        text: "1929年の世界恐慌のあと、多くの国が自国を守ろうと関税を上げました。貿易が小さくなり、不況をさらに悪化させたとも考えられています。その反省から、戦後は関税を下げるための国際的なルールが作られました。",
      },
    ],
    related: [
      { term: "貿易", text: "国と国のあいだで商品やサービスを売り買いすること。" },
      { term: "自由貿易", text: "関税などのじゃまを少なくして、自由に売り買いする考え方。" },
      { term: "保護主義", text: "外国との競争から、国内の産業を守ろうとする考え方。" },
    ],
    news: [
      {
        source: "NHK",
        title: "各国が関税引き上げの影響を協議　暮らしへの影響は",
        summary: "輸入品の値段や国内企業への影響を、身近な商品から読み解く記事です。",
        time: "3時間前",
      },
      {
        source: "日本経済新聞",
        title: "追加関税で変わる世界の貿易　企業は対応急ぐ",
        summary: "関税が企業の工場や商品の値段にどう関係するかがわかります。",
        time: "昨日",
      },
      {
        source: "朝日新聞",
        title: "そもそも関税とは？ 5つの疑問をやさしく解説",
        summary: "関税を上げる側と、支払う側の考えを整理した入門記事です。",
        time: "2日前",
      },
    ],
  },
  停戦: {
    term: "停戦",
    reading: "ていせん",
    category: "国際",
    oneLine: "戦っている国や集団が、合意して攻撃を止めること。",
    meaning:
      "停戦は、戦争そのものが完全に終わったという意味ではありません。けが人を助けたり、話し合いをしたりするため、一時的または長い期間、武器を使うのを止める約束です。",
    analogy: "けんかをしている二人が、先生と話すためにまず手を止めるようなものです。",
    background: [
      { title: "停戦と終戦の違い", text: "停戦は戦いを止める約束。終戦は戦争が終わることです。停戦しても、条件でもめて再び戦いが始まる場合があります。" },
      { title: "だれが間に入る？", text: "国連や別の国が仲介し、捕虜の交換、支援物資の運び方、国境の監視などを話し合います。" },
    ],
    related: [
      { term: "休戦", text: "決めた期間や場所で、一時的に戦闘を休むこと。" },
      { term: "和平", text: "争いを終え、平和な関係を作ること。" },
      { term: "人道支援", text: "戦争や災害で困る人に、食料や医療を届けること。" },
    ],
    news: [
      { source: "NHK", title: "停戦に向けた協議続く　支援物資の搬入が焦点", summary: "話し合いで何が問題になっているかを整理した記事です。", time: "1時間前" },
      { source: "BBC NEWS JAPAN", title: "停戦合意とは何を約束するのか", summary: "停戦が成立するまでの流れを図解しています。", time: "昨日" },
    ],
  },
  インフレ: {
    term: "インフレ",
    reading: "いんふれ",
    category: "経済",
    oneLine: "いろいろな物やサービスの値段が、全体として上がり続けること。",
    meaning:
      "去年100円だったパンが今年110円になるように、同じお金で買える量が少なくなる状態です。一つの商品だけが値上がりするのではなく、暮らしに関わる多くの値段が上がることをいいます。",
    analogy: "持っている1,000円は同じでも、買い物かごに入れられる物が少しずつ減っていくイメージです。",
    background: [
      { title: "なぜ起きるの？", text: "物をほしい人が増えたときや、原料・電気・輸送の費用が上がったとき、お金の量が増えたときなどに起こります。" },
      { title: "悪いことだけ？", text: "ゆるやかなインフレは、会社の売上や給料が増えるきっかけにもなります。ただし、給料より物価が速く上がると生活は苦しくなります。" },
    ],
    related: [
      { term: "デフレ", text: "物やサービスの値段が、全体として下がり続けること。" },
      { term: "物価", text: "世の中で売られている、さまざまな物の値段の平均的な水準。" },
      { term: "金利", text: "お金を借りるときの料金。中央銀行は金利で物価を調整します。" },
    ],
    news: [
      { source: "Yahoo!ニュース", title: "食品の値上げ相次ぐ　家計への影響は", summary: "身近な食品から物価の変化を説明しています。", time: "4時間前" },
      { source: "NHK", title: "物価と賃金、最新データから見る暮らし", summary: "給料の伸びと値上がりの関係がわかる記事です。", time: "昨日" },
    ],
  },
};

const suggestions = ["関税", "停戦", "インフレ"];

function newsUrl(term: string, title: string) {
  return `https://news.google.com/search?q=${encodeURIComponent(`${term} ${title}`)}&hl=ja&gl=JP&ceid=JP:ja`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("関税");
  const [searched, setSearched] = useState(true);
  const entry = useMemo(() => entries[active] ?? entries["関税"], [active]);

  function search(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setActive(entries[clean] ? clean : "関税");
    setQuery(clean);
    setSearched(true);
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    search(query);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="コトノハ ホーム">
          <span className="brand-mark">コ</span>
          <span>コトノハ</span>
        </a>
        <nav aria-label="メインメニュー">
          <a href="#howto">このサイトについて</a>
          <button className="history-button" type="button" onClick={() => alert("検索履歴は次のバージョンで保存できるようになります。")}>◷ 検索履歴</button>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow"><span>NEWS</span> わからないを、そのままにしない。</div>
        <h1>ニュースの言葉を、<br /><em>いちばんやさしく。</em></h1>
        <p className="hero-copy">むずかしい言葉も、背景も、関連ニュースも。<br />前提知識ゼロから、3分でわかります。</p>
        <form className="search-box" onSubmit={submit}>
          <span className="search-icon">⌕</span>
          <label className="sr-only" htmlFor="word-search">ニュースで気になった言葉</label>
          <input id="word-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ニュースで気になった言葉を入力" />
          <button type="submit">調べる <span>→</span></button>
        </form>
        <div className="suggestions">
          <span>よく調べられています</span>
          {suggestions.map((word) => <button key={word} onClick={() => search(word)}>#{word}</button>)}
        </div>
        <div className="scroll-hint"><span>SCROLL</span><i /></div>
      </section>

      {searched && (
        <section className="result" id="result">
          {!entries[query.trim()] && query.trim() && query.trim() !== active && (
            <div className="demo-note">「{query}」のリアルタイム解説は準備中です。デモとして「関税」の解説を表示しています。</div>
          )}
          <div className="result-head">
            <div>
              <span className="category">{entry.category}</span>
              <h2>{entry.term}<small>{entry.reading}</small></h2>
            </div>
            <button className="save-button" type="button" onClick={(e) => {
              const button = e.currentTarget;
              button.textContent = button.textContent?.includes("保存しました") ? "♡ あとで読む" : "♥ 保存しました";
            }}>♡ あとで読む</button>
          </div>

          <div className="definition-card">
            <div className="number">01</div>
            <div>
              <p className="section-label">ひとことで言うと</p>
              <h3>{entry.oneLine}</h3>
              <p>{entry.meaning}</p>
              <div className="analogy"><b>たとえるなら</b><span>{entry.analogy}</span></div>
            </div>
          </div>

          <div className="content-grid">
            <section className="background-card">
              <div className="number">02</div>
              <div>
                <p className="section-label">知っておきたい背景</p>
                <h3>ここまでわかると、ニュースが読める</h3>
                <div className="timeline">
                  {entry.background.map((item, index) => (
                    <article key={item.title}>
                      <span>{index + 1}</span><div><h4>{item.title}</h4><p>{item.text}</p></div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <aside className="related-card">
              <div className="number">03</div>
              <p className="section-label">いっしょに覚える関連語</p>
              {entry.related.map((item) => (
                <button key={item.term} type="button" onClick={() => entries[item.term] && search(item.term)}>
                  <span><b>{item.term}</b><small>{item.text}</small></span><i>↗</i>
                </button>
              ))}
            </aside>
          </div>

          <section className="news-section">
            <div className="news-heading">
              <div><p className="section-label">実際のニュースで見てみよう</p><h3>「{entry.term}」が出てくる記事</h3></div>
              <a href={`https://news.google.com/search?q=${encodeURIComponent(entry.term)}&hl=ja&gl=JP&ceid=JP:ja`} target="_blank" rel="noreferrer">Googleニュースでもっと見る ↗</a>
            </div>
            <div className="news-grid">
              {entry.news.map((item, index) => (
                <a className="news-card" key={item.title} href={newsUrl(entry.term, item.title)} target="_blank" rel="noreferrer">
                  <div className={`news-visual visual-${index + 1}`}><span>{entry.category}</span><b>{index === 0 ? "NEWS" : index === 1 ? "TOPIC" : "GUIDE"}</b></div>
                  <div className="news-body"><div><b>{item.source}</b><time>{item.time}</time></div><h4>{item.title}</h4><p>{item.summary}</p><span className="read-more">記事を読む <i>→</i></span></div>
                </a>
              ))}
            </div>
            <p className="news-caution">※ 記事リンクはGoogleニュースの検索結果を開きます。情報は時間とともに更新されます。</p>
          </section>
        </section>
      )}

      <section className="howto" id="howto">
        <p className="section-label">コトノハの使い方</p>
        <div><b>1</b><span>気になる言葉を入力</span><i>→</i><b>2</b><span>意味と背景を理解</span><i>→</i><b>3</b><span>ニュースで確かめる</span></div>
      </section>
      <footer><span>コトノハ</span><p>ニュースが少しわかると、世界はもっとおもしろい。</p><small>© 2026 KOTONOHA</small></footer>
    </main>
  );
}
