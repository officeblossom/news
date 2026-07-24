"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Entry = {
  term: string;
  reading: string;
  category: string;
  oneLine: string;
  meaning: string;
  analogy: string;
  background: { title: string; text: string }[];
  related: { term: string; text: string }[];
  news: { source: string; title: string; summary: string; time: string; url?: string }[];
  sources?: { title: string; url: string }[];
  generatedBy?: "gemini" | "wikipedia";
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

function makeEntry(
  term: string,
  reading: string,
  category: string,
  oneLine: string,
  meaning: string,
  analogy: string,
  background: { title: string; text: string }[],
  related: { term: string; text: string }[],
): Entry {
  return {
    term,
    reading,
    category,
    oneLine,
    meaning,
    analogy,
    background,
    related,
    news: [
      {
        source: "Googleニュース",
        title: `${term}をめぐる最近の動きをわかりやすく`,
        summary: `直近のニュースで「${term}」がどのように使われているか確認できます。`,
        time: "最新",
      },
      {
        source: "ニュース解説",
        title: `いま知っておきたい「${term}」のポイント`,
        summary: "複数の報道を見比べて、出来事の背景まで理解するための記事を探せます。",
        time: "1か月以内",
      },
    ],
  };
}

Object.assign(entries, {
  "骨太の方針": makeEntry(
    "骨太の方針", "ほねぶとのほうしん", "政治",
    "政府が来年度以降のお金の使い方や政策の方向を示す、大きな設計図。",
    "正式には「経済財政運営と改革の基本方針」といいます。景気、社会保障、子育て、防衛、デジタル化など、国がこれから何を重視するかを毎年まとめます。これをもとに各省庁が予算案を作るため、暮らしに関わる政策の出発点になります。",
    "家を建てる前に作る全体の設計図です。まだ細かな材料費までは決まっていませんが、どんな家にするかという方向が決まります。",
    [
      { title: "法律や予算そのものではない", text: "方針を発表しただけで、すぐ制度が変わるわけではありません。その後、予算案や法律案に具体化され、国会で議論されます。" },
      { title: "なぜ毎年ニュースになる？", text: "限られた税金をどこに多く使うかで、世代や地域、産業への影響が変わるからです。" },
    ],
    [{ term: "予算案", text: "国が1年間に集めるお金と使うお金の計画。" }, { term: "閣議決定", text: "内閣として方針を正式に決めること。" }, { term: "社会保障", text: "年金、医療、介護など生活を支える制度。" }],
  ),
  "熱中症警戒アラート": makeEntry(
    "熱中症警戒アラート", "ねっちゅうしょうけいかいあらーと", "社会",
    "暑さで健康を害する危険がとても高い日に、国が出す注意情報。",
    "気温だけでなく、湿度や日差しを合わせた「暑さ指数」が基準を超えると予想される地域に発表されます。発表された日は、外出や運動をできるだけ避け、冷房を使い、のどが渇く前に水分を取ることが大切です。",
    "大雨警報の暑さ版に近いものです。「少し暑い」ではなく、いつもの生活を変えて命を守る行動が必要という合図です。",
    [
      { title: "暑さ指数とは", text: "気温、湿度、日差しや地面からの熱をまとめて、体への負担を表す数字です。" },
      { title: "特別警戒アラートとの違い", text: "さらに広い地域で過去に例のない危険な暑さが予想される場合は、より強い「熱中症特別警戒アラート」が出ます。" },
    ],
    [{ term: "暑さ指数", text: "人の体が感じる暑さの危険度を示す指数。" }, { term: "猛暑日", text: "最高気温が35度以上の日。" }, { term: "クーリングシェルター", text: "暑さから一時的に避難できる冷房のある施設。" }],
  ),
  "弾道ミサイル": makeEntry(
    "弾道ミサイル", "だんどうみさいる", "安全保障",
    "ロケットのように高く上がり、弧を描いて目標へ落ちる兵器。",
    "発射後に大気圏の高いところまで上がり、重力を利用して非常に速い速度で落下します。飛ぶ距離によって短距離・中距離・大陸間弾道ミサイルなどに分けられます。核兵器などを運べるものもあるため、発射や実験は国際的な緊張につながります。",
    "遠くへ投げたボールが山なりに飛ぶ動きを、はるかに大きく速くしたような軌道です。",
    [
      { title: "なぜ迎撃が難しい？", text: "高速で飛び、発見してから到達までの時間が短いからです。途中で軌道を変えるタイプもあります。" },
      { title: "Jアラートとは", text: "日本に飛来する可能性があるとき、国が携帯電話や防災無線で避難を呼びかける仕組みです。" },
    ],
    [{ term: "Jアラート", text: "緊急情報を国から住民へすばやく伝える仕組み。" }, { term: "迎撃", text: "飛んでくるミサイルを別のミサイルなどで撃ち落とすこと。" }, { term: "抑止力", text: "反撃されると思わせ、攻撃を思いとどまらせる力。" }],
  ),
  "皇室典範": makeEntry(
    "皇室典範", "こうしつてんぱん", "政治",
    "天皇や皇族に関する基本的な決まりを定めた法律。",
    "天皇の地位をだれがどの順番で受け継ぐか、皇族の身分や結婚、摂政などについて定めています。日本国憲法は天皇を「日本国と日本国民統合の象徴」としており、皇室典範はその制度を具体的に支える法律です。",
    "学校全体の理念が憲法だとすれば、皇室典範は皇室制度についての詳しい校則にあたります。",
    [
      { title: "なぜ改正が議論される？", text: "皇族の人数が減っていることや、将来にわたり皇位継承を安定させる方法を考える必要があるためです。" },
      { title: "歴史との関係", text: "現在の皇室典範は日本国憲法と同じ1947年に施行され、国会で改正できる法律になりました。" },
    ],
    [{ term: "皇位継承", text: "天皇の地位を次の人が受け継ぐこと。" }, { term: "象徴天皇制", text: "天皇が政治を行わず、国と国民統合の象徴である制度。" }, { term: "摂政", text: "天皇が務めを行えないときに代わって国事行為を行う人。" }],
  ),
  "サプライチェーン": makeEntry(
    "サプライチェーン", "さぷらいちぇーん", "経済",
    "原料の調達から商品が消費者に届くまでの、企業や物流のつながり。",
    "一つの商品も、原料、部品、組み立て、輸送、販売という多くの段階を通ります。そのどこかが戦争、災害、感染症、輸出規制などで止まると、遠い国の商品まで不足したり値上がりしたりします。",
    "給食が、農家・食品工場・配送トラック・調理室というリレーで届くようなものです。一か所が止まると給食を出せません。",
    [
      { title: "強靱化とは", text: "調達先を一つの国や会社だけに頼らず、別の入手先や在庫を用意して止まりにくくすることです。" },
      { title: "安全保障との関係", text: "半導体や医薬品など、国の安全や生活に欠かせない物を安定して確保することが重要になっています。" },
    ],
    [{ term: "輸出規制", text: "特定の商品を外国へ売ることを制限する政策。" }, { term: "物流", text: "物を保管し、必要な場所へ運ぶ仕組み。" }, { term: "経済安全保障", text: "経済の仕組みを通じて国の安全や暮らしを守る考え方。" }],
  ),
  "重要鉱物": makeEntry(
    "重要鉱物", "じゅうようこうぶつ", "経済",
    "産業や安全保障に欠かせないのに、手に入りにくくなる心配がある鉱物。",
    "レアアース、リチウム、コバルトなどが代表例です。スマートフォン、電気自動車、半導体、再生可能エネルギー設備などに使われます。産地や精製する国が偏っているため、国際関係が悪化すると供給が止まるおそれがあります。",
    "料理に欠かせない特別な調味料を、一軒のお店からしか買えない状態に似ています。",
    [
      { title: "なぜ国が確保する？", text: "企業だけでは対応しにくい長期的な供給リスクがあり、備蓄や海外鉱山への投資、リサイクルを支援するためです。" },
      { title: "レアアースとの違い", text: "レアアースは17種類の元素の総称。重要鉱物は、希少性だけでなく産業上の重要性も含めた広い呼び方です。" },
    ],
    [{ term: "レアアース", text: "磁石や電子部品に使われる17種類の元素の総称。" }, { term: "備蓄", text: "不足に備えてあらかじめためておくこと。" }, { term: "都市鉱山", text: "使用済み製品を資源として回収する考え方。" }],
  ),
  "短観": makeEntry(
    "短観", "たんかん", "経済",
    "日本銀行が企業に景気の感じ方を聞く、大規模なアンケート調査。",
    "正式には「全国企業短期経済観測調査」。約1万社に、景気が良いか悪いか、売上や設備投資をどう見ているかなどを聞きます。企業の生の感覚を早く知れるため、景気や金利の先行きを考える材料になります。",
    "全国の会社に取る『景気の健康診断アンケート』です。",
    [
      { title: "業況判断DIとは", text: "「良い」と答えた企業の割合から「悪い」の割合を引いた数字。プラスが大きいほど景気が良いと感じる企業が多いことを示します。" },
      { title: "だれが注目する？", text: "政府、投資家、企業、日銀が政策や投資を考えるために注目します。" },
    ],
    [{ term: "日本銀行", text: "お札を発行し、物価や金融の安定を担う日本の中央銀行。" }, { term: "景気", text: "社会全体のお金の動きや経済活動の状態。" }, { term: "DI", text: "良いと答えた割合と悪いと答えた割合の差。" }],
  ),
  "世界遺産委員会": makeEntry(
    "世界遺産委員会", "せかいいさんいいんかい", "国際",
    "世界遺産への登録や保全状況を話し合う、ユネスコの委員会。",
    "21の国からなる委員会が毎年集まり、候補地を世界遺産に登録するか、すでに登録された場所がきちんと守られているかを審査します。価値が失われる危険が高い場所は「危機遺産」に指定されることもあります。",
    "世界の大切な宝物を、新しくリストに加えるか、きちんと守れているかを確認する会議です。",
    [
      { title: "登録されれば終わりではない", text: "開発や観光客の増加で価値を損なわないよう、登録後も国は保全状況を報告します。" },
      { title: "ユネスコとは", text: "教育、科学、文化を通じて平和を目指す国連の専門機関です。" },
    ],
    [{ term: "ユネスコ", text: "教育・科学・文化を担当する国連の専門機関。" }, { term: "顕著な普遍的価値", text: "国境を越えて人類全体にとって大切だと認められる価値。" }, { term: "危機遺産", text: "戦争や災害、開発などで価値が危ぶまれる世界遺産。" }],
  ),
});

const trendingTerms = [
  "骨太の方針",
  "熱中症警戒アラート",
  "弾道ミサイル",
  "皇室典範",
  "停戦",
  "関税",
  "サプライチェーン",
  "重要鉱物",
  "短観",
  "世界遺産委員会",
];

const suggestions = ["骨太の方針", "熱中症警戒アラート", "関税"];

type QuizQuestion = {
  term: string;
  choices: string[];
  correct: number;
};

function shuffled<T>(values: T[]) {
  return [...values].sort(() => Math.random() - 0.5);
}

function makeQuizQuestion(term: string, availableEntries: Record<string, Entry>): QuizQuestion {
  const correctText = availableEntries[term].oneLine;
  const wrong = shuffled(
    trendingTerms.filter((candidate) => candidate !== term).map((candidate) => entries[candidate].oneLine),
  ).slice(0, 3);
  const choices = shuffled([correctText, ...wrong]);
  return { term, choices, correct: choices.indexOf(correctText) };
}

function newsUrl(term: string, title: string) {
  return `https://news.google.com/search?q=${encodeURIComponent(`${term} ${title}`)}&hl=ja&gl=JP&ceid=JP:ja`;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("関税");
  const [searched, setSearched] = useState(true);
  const [dynamicEntries, setDynamicEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [fallbackUsed, setFallbackUsed] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [quizTerms, setQuizTerms] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const availableEntries = useMemo(() => ({ ...entries, ...dynamicEntries }), [dynamicEntries]);
  const entry = useMemo(() => availableEntries[active] ?? entries["関税"], [active, availableEntries]);

  useEffect(() => {
    let savedHistory: string[] = [];
    let restoredEntries: Record<string, Entry> = {};
    try {
      const saved = JSON.parse(localStorage.getItem("kotonoha-history") ?? "[]");
      if (Array.isArray(saved)) savedHistory = saved.filter((word) => typeof word === "string").slice(0, 10);
      const cached = JSON.parse(localStorage.getItem("kotonoha-cache") ?? "{}");
      if (cached && typeof cached === "object") {
        const now = Date.now();
        restoredEntries = Object.fromEntries(
          Object.entries(cached)
            .filter(([, value]) => {
              const item = value as { savedAt?: number; entry?: Entry };
              return item?.entry && item.savedAt && now - item.savedAt < 7 * 24 * 60 * 60 * 1000;
            })
            .map(([term, value]) => [term, (value as { entry: Entry }).entry]),
        );
      }
    } catch {}
    const timer = window.setTimeout(() => {
      setHistory(savedHistory);
      setDynamicEntries(restoredEntries);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function search(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setQuery(clean);
    setSearched(true);
    setSearchError("");
    setFallbackUsed(false);
    if (availableEntries[clean]) {
      setActive(clean);
    } else {
      setLoading(true);
      setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term: clean }),
        });
        const data = await response.json();
        if (!response.ok || !data.entry) throw new Error(data.error || "検索できませんでした。");
        setDynamicEntries((current) => {
          const next = { ...current, [clean]: data.entry as Entry };
          try {
            const stored = JSON.parse(localStorage.getItem("kotonoha-cache") ?? "{}");
            stored[clean] = { entry: data.entry, savedAt: Date.now() };
            localStorage.setItem("kotonoha-cache", JSON.stringify(stored));
          } catch {}
          return next;
        });
        setFallbackUsed(Boolean(data.fallback));
        setActive(clean);
      } catch (error) {
        setSearchError(error instanceof Error ? error.message : "検索できませんでした。");
      } finally {
        setLoading(false);
      }
    }
    setHistory((current) => {
      const next = [clean, ...current.filter((word) => word !== clean)].slice(0, 10);
      localStorage.setItem("kotonoha-history", JSON.stringify(next));
      return next;
    });
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void search(query);
  }

  function startQuiz() {
    const source = Array.from(new Set([...history, ...trendingTerms])).filter((term) => availableEntries[term]);
    const selected = shuffled(source).slice(0, 10);
    setQuizTerms(selected);
    setQuizIndex(0);
    setQuizQuestion(makeQuizQuestion(selected[0], availableEntries));
    setQuizAnswer(null);
    setQuizScore(0);
    setQuizFinished(false);
    setTimeout(() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }

  function answerQuiz(index: number) {
    if (!quizQuestion || quizAnswer !== null) return;
    setQuizAnswer(index);
    if (index === quizQuestion.correct) setQuizScore((score) => score + 1);
  }

  function nextQuiz() {
    const nextIndex = quizIndex + 1;
    if (nextIndex >= quizTerms.length) {
      setQuizFinished(true);
      setQuizQuestion(null);
      return;
    }
    setQuizIndex(nextIndex);
    setQuizQuestion(makeQuizQuestion(quizTerms[nextIndex], availableEntries));
    setQuizAnswer(null);
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="コトノハ ホーム">
          <span className="brand-mark">コ</span>
          <span>コトノハ</span>
        </a>
        <nav aria-label="メインメニュー">
          <a href="#monthly">今月の10語</a>
          <a href="#quiz">10問クイズ</a>
          <a href="#howto">このサイトについて</a>
          <button className="history-button" type="button" onClick={() => {
            if (!history.length) return alert("検索履歴はまだありません。気になる言葉を調べてみましょう。");
            search(history[0]);
          }}>◷ 検索履歴 {history.length ? `(${history.length})` : ""}</button>
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
          {suggestions.map((word) => <button key={word} onClick={() => void search(word)}>#{word}</button>)}
        </div>
        <div className="scroll-hint"><span>SCROLL</span><i /></div>
      </section>

      <section className="monthly" id="monthly">
        <div className="monthly-heading">
          <div>
            <p className="section-label">MONTHLY KEYWORDS · 2026.06.24—07.24</p>
            <h2>最近1か月のニュースがわかる<br /><em>10のことば</em></h2>
          </div>
          <p>政治・国際・経済・社会の主要な報道から、<br />背景を知るとニュースが読みやすくなる言葉を選びました。</p>
        </div>
        <div className="monthly-grid">
          {trendingTerms.map((word, index) => (
            <button key={word} type="button" onClick={() => void search(word)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{entries[word].category}</small><b>{word}</b><p>{entries[word].oneLine}</p></div>
              <i>→</i>
            </button>
          ))}
        </div>
        <p className="selection-note">選定期間：2026年6月24日〜7月24日。首相官邸、政府機関、主要報道の公開情報をもとに選定。</p>
      </section>

      {searched && (
        <section className="result" id="result">
          {loading && <div className="search-status" role="status"><span className="loading-dot" />「{query}」をWikipediaと最近のニュースから調べています…</div>}
          {searchError && <div className="search-error" role="alert">{searchError} <a href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer">Googleで調べる ↗</a></div>}
          {!loading && !searchError && entry.generatedBy && (
            <div className="source-note">
              <b>{entry.generatedBy === "gemini" ? "AIと公開情報で解説しました" : "無料の公開情報で解説しました"}</b>
              <span>{fallbackUsed || entry.generatedBy === "wikipedia" ? "AI無料枠を使えない場合も、Wikipediaと最新ニュースから回答を表示しています。" : "Wikipediaと直近30日のニュースをもとにしています。"}</span>
            </div>
          )}
          {!loading && !searchError && (
          <>
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
                <button key={item.term} type="button" onClick={() => void search(item.term)}>
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
                <a className="news-card" key={item.title} href={item.url || newsUrl(entry.term, item.title)} target="_blank" rel="noreferrer">
                  <div className={`news-visual visual-${index + 1}`}><span>{entry.category}</span><b>{index === 0 ? "NEWS" : index === 1 ? "TOPIC" : "GUIDE"}</b></div>
                  <div className="news-body"><div><b>{item.source}</b><time>{item.time}</time></div><h4>{item.title}</h4><p>{item.summary}</p><span className="read-more">記事を読む <i>→</i></span></div>
                </a>
              ))}
            </div>
            <p className="news-caution">※ 記事リンクはGoogleニュースの検索結果を開きます。情報は時間とともに更新されます。</p>
            {entry.sources?.length ? <div className="sources"><b>解説の参考資料</b>{entry.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div> : null}
          </section>
          </>
          )}
        </section>
      )}

      <section className="quiz-section" id="quiz">
        <div className="quiz-intro">
          <div>
            <p className="section-label">NEWS WORD QUIZ</p>
            <h2>ニュース単語<br /><em>10問クイズ</em></h2>
            <p>最近1か月の10語と、あなたが過去に検索した言葉からランダムに出題。4つの選択肢から、いちばん近い意味を選びましょう。</p>
          </div>
          {!quizQuestion && !quizFinished && (
            <button className="quiz-start" type="button" onClick={startQuiz}>クイズをはじめる <span>→</span></button>
          )}
        </div>

        {quizQuestion && (
          <div className="quiz-card">
            <div className="quiz-progress">
              <span>QUESTION {quizIndex + 1} / {quizTerms.length}</span>
              <div><i style={{ width: `${((quizIndex + 1) / quizTerms.length) * 100}%` }} /></div>
              <b>{quizScore} pt</b>
            </div>
            <p className="quiz-prompt">「{quizQuestion.term}」の意味として、もっとも近いものは？</p>
            <div className="quiz-choices">
              {quizQuestion.choices.map((choice, index) => {
                const isCorrect = index === quizQuestion.correct;
                const isSelected = index === quizAnswer;
                const state = quizAnswer === null ? "" : isCorrect ? "correct" : isSelected ? "wrong" : "muted";
                return (
                  <button key={choice} className={state} type="button" onClick={() => answerQuiz(index)}>
                    <span>{String.fromCharCode(65 + index)}</span><p>{choice}</p>
                    {quizAnswer !== null && isCorrect && <b>✓</b>}
                    {quizAnswer !== null && isSelected && !isCorrect && <b>×</b>}
                  </button>
                );
              })}
            </div>
            {quizAnswer !== null && (
              <div className="quiz-explanation" aria-live="polite">
                <div className={quizAnswer === quizQuestion.correct ? "good" : "try"}>
                  {quizAnswer === quizQuestion.correct ? "正解！" : "おしい！"}
                </div>
                <div>
                  <h3>{quizQuestion.term}<small>{availableEntries[quizQuestion.term].reading}</small></h3>
                  <p>{availableEntries[quizQuestion.term].meaning}</p>
                </div>
                <button type="button" onClick={nextQuiz}>{quizIndex + 1 === quizTerms.length ? "結果を見る" : "次の問題"} →</button>
              </div>
            )}
          </div>
        )}

        {quizFinished && (
          <div className="quiz-result">
            <span>YOUR SCORE</span>
            <strong>{quizScore}<small>/ 10</small></strong>
            <h3>{quizScore >= 8 ? "ニュース博士です！" : quizScore >= 5 ? "いい調子です！" : "ここから伸びます！"}</h3>
            <p>{quizScore >= 8 ? "言葉の意味と背景がしっかり身についています。" : "解説を読み直して、もう一度挑戦してみましょう。"}</p>
            <button type="button" onClick={startQuiz}>もう一度挑戦する ↻</button>
          </div>
        )}
      </section>

      <section className="howto" id="howto">
        <p className="section-label">コトノハの使い方</p>
        <div><b>1</b><span>気になる言葉を入力</span><i>→</i><b>2</b><span>意味と背景を理解</span><i>→</i><b>3</b><span>ニュースで確かめる</span></div>
        <p className="privacy-note">入力内容は解説のため外部サービスへ送信される場合があります。氏名・住所・電話番号などの個人情報は入力しないでください。AIの回答には誤りが含まれることがあるため、重要な判断ではリンク先の一次情報もご確認ください。</p>
      </section>
      <footer><span>コトノハ</span><p>ニュースが少しわかると、世界はもっとおもしろい。</p><small>© 2026 KOTONOHA</small></footer>
    </main>
  );
}
