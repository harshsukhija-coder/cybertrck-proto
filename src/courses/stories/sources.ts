import type { InterestId } from "../prefs";

export type Slide = {
  /** Changes whenever the content changes, so new facts show up as unseen */
  id: string;
  kicker: string;
  title: string;
  body?: string;
  stat?: { value: string; label: string };
  list?: { label: string; value: string }[];
  /** A real photo, shown large */
  image?: { src: string; credit?: string };
  /** A small logo or avatar, shown next to the text */
  icon?: string;
  trivia?: { options: string[]; answer: number };
  link?: { href: string; label: string };
  source: string;
  /** When the fact happened or was published (ms) */
  at?: number;
};

export type StoryId = "today" | "tech" | "money" | "marketing" | "data" | "security" | "space" | "fun";

export type Story = {
  id: StoryId;
  label: string;
  color: string;
  glyph: string;
  interests: InterestId[];
  slides: Slide[];
};

type Sector = Omit<Story, "slides">;

export const SECTORS: Sector[] = [
  { id: "today", label: "on this day", color: "#ffd166", glyph: "1d", interests: [] },
  { id: "tech", label: "tech", color: "#4f8cff", glyph: "</>", interests: ["internet", "web", "gaming"] },
  { id: "money", label: "money", color: "#2ee6a6", glyph: "$", interests: ["money"] },
  { id: "marketing", label: "marketing", color: "#ff5fa2", glyph: "#1", interests: ["marketing", "streaming"] },
  { id: "data", label: "data", color: "#38bdf8", glyph: "db", interests: ["data"] },
  { id: "security", label: "security", color: "#ff4d6d", glyph: "!", interests: ["security", "privacy", "home"] },
  { id: "space", label: "space", color: "#b49bff", glyph: "↑", interests: [] },
  { id: "fun", label: "fun facts", color: "#ff8a3d", glyph: "?", interests: [] },
];

const getJson = async <T>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
};

const pad = (n: number) => String(n).padStart(2, "0");
const isoDay = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const full = (n: number) => n.toLocaleString("en-US");
const plain = (html: string) => (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim();
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

// ---------- Wikipedia: on this day, picture of the day, most read, did you know ----------

type WikiPage = {
  titles: { normalized: string };
  extract?: string;
  thumbnail?: { source: string };
  content_urls: { mobile: { page: string } };
  views?: number;
};
type WikiFeed = {
  mostread?: { date: string; articles: WikiPage[] };
  image?: { title: string; thumbnail: { source: string }; description?: { text: string }; artist?: { text: string }; file_page: string };
  onthisday?: { text: string; year: number; pages: WikiPage[] }[];
  dyk?: { text: string; html: string }[];
};

const wikiFeed = (signal: AbortSignal) => {
  const now = new Date();
  return getJson<WikiFeed>(`https://en.wikipedia.org/api/rest_v1/feed/featured/${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())}`, signal);
};

const todaySlides = (feed: WikiFeed): Slide[] => {
  const day = isoDay(new Date());
  const year = new Date().getFullYear();
  const events = (feed.onthisday ?? []).filter(e => e.pages[0]?.thumbnail).slice(0, 2);
  const slides: Slide[] = events.map((e, i) => ({
    id: `otd-${day}-${e.year}-${i}`,
    kicker: `on this day in ${e.year} · ${year - e.year} years ago`,
    title: e.text.replace(/\s*\((pictured|shown)[^)]*\)/gi, ""),
    image: { src: e.pages[0].thumbnail!.source },
    link: { href: e.pages[0].content_urls.mobile.page, label: "read the full story" },
    source: "Wikipedia",
  }));
  const pic = feed.image;
  if (pic) {
    const name = pic.title.replace(/^File:/, "").replace(/\.\w+$/, "").replace(/_/g, " ");
    slides.push({
      id: `potd-${day}`,
      kicker: "picture of the day",
      title: clip(plain(pic.description?.text ?? "") || name, 140),
      image: { src: pic.thumbnail.source, credit: pic.artist ? `photo: ${plain(pic.artist.text)}` : undefined },
      link: { href: pic.file_page, label: "see full size" },
      source: "Wikimedia Commons",
    });
  }
  return slides;
};

const marketingSlides = (feed: WikiFeed): Slide[] => {
  const read = feed.mostread;
  if (!read) return [];
  const articles = read.articles.filter(
    a => a.views && !/^(Special|Wikipedia|File|Portal|Help|Category|Template|Talk|User):/.test(a.titles.normalized) && a.titles.normalized !== "Main Page",
  );
  const top = articles[0];
  if (!top) return [];
  const day = read.date.slice(0, 10);
  return [
    {
      id: `mostread-${day}-${top.titles.normalized}`,
      kicker: "the internet's attention, yesterday",
      stat: { value: compact(top.views!), label: "people looked this up" },
      title: top.titles.normalized,
      body: top.extract ? clip(top.extract, 150) : undefined,
      image: top.thumbnail ? { src: top.thumbnail.source } : undefined,
      link: { href: top.content_urls.mobile.page, label: "why is everyone reading this?" },
      source: "Wikipedia",
    },
    {
      id: `leaderboard-${day}`,
      kicker: "attention leaderboard",
      title: "what the whole world was curious about yesterday",
      body: "marketers watch lists like this to spot what's trending before it peaks.",
      list: articles.slice(0, 5).map(a => ({ label: a.titles.normalized, value: compact(a.views!) })),
      source: "Wikipedia",
    },
  ];
};

const funWikiSlides = (feed: WikiFeed): Slide[] =>
  (feed.dyk ?? []).slice(0, 2).map((fact, i) => ({
    id: `dyk-${isoDay(new Date())}-${i}`,
    kicker: "did you know",
    title: plain(fact.html).replace(/^\.\.\.\s*that\s*/i, "").replace(/\?$/, "").replace(/^./, c => c.toUpperCase()),
    body: "fresh from Wikipedia's front page today.",
    source: "Wikipedia",
  }));

// ---------- tech: Hacker News + GitHub ----------

const techSlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const [hn, gh] = await Promise.allSettled([
    getJson<{ hits: { objectID: string; title: string; url: string | null; points: number; num_comments: number; created_at_i: number }[] }>(
      "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=1",
      signal,
    ),
    getJson<{ items: { full_name: string; description: string | null; stargazers_count: number; language: string | null; html_url: string; owner: { avatar_url: string } }[] }>(
      `https://api.github.com/search/repositories?q=created:>${isoDay(daysAgo(7))}&sort=stars&order=desc&per_page=1`,
      signal,
    ),
  ]);
  const slides: Slide[] = [];
  const story = hn.status === "fulfilled" ? hn.value.hits[0] : undefined;
  if (story) {
    const href = story.url ?? `https://news.ycombinator.com/item?id=${story.objectID}`;
    slides.push({
      id: `hn-${story.objectID}`,
      kicker: "#1 on hacker news right now",
      title: story.title,
      stat: { value: full(story.points), label: `upvotes · ${full(story.num_comments)} comments` },
      body: hostOf(href) ? `from ${hostOf(href)}` : undefined,
      link: { href, label: "read it" },
      source: "Hacker News",
      at: story.created_at_i * 1000,
    });
  }
  const repo = gh.status === "fulfilled" ? gh.value.items[0] : undefined;
  if (repo) {
    slides.push({
      id: `gh-${repo.full_name}-${isoDay(new Date())}`,
      kicker: "fastest-growing new project on github",
      stat: { value: `${compact(repo.stargazers_count)} ★`, label: "stars in under a week" },
      title: repo.full_name,
      body: [repo.description, repo.language && `written in ${repo.language}`].filter(Boolean).join(" · "),
      icon: repo.owner.avatar_url,
      link: { href: repo.html_url, label: "see the code" },
      source: "GitHub",
    });
  }
  return slides;
};

// ---------- money: Frankfurter (central bank rates) + CoinGecko ----------

const moneySlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const [fx, coins] = await Promise.allSettled([
    getJson<{ rates: Record<string, Record<string, number>> }>(`https://api.frankfurter.dev/v1/${isoDay(daysAgo(30))}..?base=USD&symbols=INR,EUR,GBP,JPY`, signal),
    getJson<{ coins: { item: { id: string; name: string; symbol: string; market_cap_rank: number | null; large: string; data?: { price_change_percentage_24h?: { usd?: number } } } }[] }>(
      "https://api.coingecko.com/api/v3/search/trending",
      signal,
    ),
  ]);
  const slides: Slide[] = [];
  if (fx.status === "fulfilled") {
    const days = Object.keys(fx.value.rates).sort();
    const first = fx.value.rates[days[0]];
    const last = fx.value.rates[days[days.length - 1]];
    if (first?.INR && last?.INR) {
      const change = ((last.INR - first.INR) / first.INR) * 100;
      const direction = Math.abs(change) < 0.2 ? "barely moved" : change > 0 ? `got ${Math.abs(change).toFixed(1)}% weaker` : `got ${Math.abs(change).toFixed(1)}% stronger`;
      slides.push({
        id: `fx-${days[days.length - 1]}`,
        kicker: "1 US dollar today",
        stat: { value: `₹${last.INR.toFixed(2)}`, label: "indian rupees" },
        title: `a month ago it was ₹${first.INR.toFixed(2)}. the rupee ${direction}.`,
        body: "a weaker rupee makes imports (phones, petrol) cost more.",
        list: [
          { label: "1 USD in euros", value: `€${last.EUR?.toFixed(2)}` },
          { label: "1 USD in pounds", value: `£${last.GBP?.toFixed(2)}` },
          { label: "1 USD in yen", value: `¥${last.JPY?.toFixed(0)}` },
        ],
        source: "European Central Bank",
      });
    }
  }
  const coin = coins.status === "fulfilled" ? coins.value.coins[0]?.item : undefined;
  if (coin) {
    const change = coin.data?.price_change_percentage_24h?.usd;
    slides.push({
      id: `coin-${isoDay(new Date())}-${coin.id}`,
      kicker: "most searched crypto right now",
      title: `${coin.name} (${coin.symbol})`,
      stat: change !== undefined ? { value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`, label: "price change in 24 hours" } : undefined,
      body: `${coin.market_cap_rank ? `ranked #${coin.market_cap_rank} by size. ` : ""}trending just means lots of people are searching. it's not a tip to buy.`,
      icon: coin.large,
      link: { href: `https://www.coingecko.com/en/coins/${coin.id}`, label: "see the chart" },
      source: "CoinGecko",
    });
  }
  return slides;
};

// ---------- data: Stack Overflow ----------

const dataSlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const week = Math.floor(daysAgo(7).getTime() / 1000);
  const [info, top] = await Promise.allSettled([
    getJson<{ items: { total_questions: number; total_answers: number; total_users: number; total_unanswered: number; questions_per_minute: number }[] }>(
      "https://api.stackexchange.com/2.3/info?site=stackoverflow",
      signal,
    ),
    getJson<{ items: { question_id: number; title: string; view_count: number; answer_count: number; score: number; link: string; creation_date: number }[] }>(
      `https://api.stackexchange.com/2.3/questions?order=desc&sort=votes&tagged=sql&site=stackoverflow&pagesize=1&fromdate=${week}`,
      signal,
    ),
  ]);
  const slides: Slide[] = [];
  const stats = info.status === "fulfilled" ? info.value.items[0] : undefined;
  if (stats) {
    slides.push({
      id: `so-info-${isoDay(new Date())}`,
      kicker: "stack overflow is one giant database",
      stat: { value: compact(stats.total_questions), label: "questions stored" },
      title: `${stats.questions_per_minute.toFixed(1)} new questions arrive every minute`,
      body: "each one is a row in a database table, found in milliseconds thanks to indexes.",
      list: [
        { label: "answers", value: compact(stats.total_answers) },
        { label: "users", value: compact(stats.total_users) },
        { label: "still unanswered", value: compact(stats.total_unanswered) },
      ],
      source: "Stack Exchange",
    });
  }
  const question = top.status === "fulfilled" ? top.value.items[0] : undefined;
  if (question) {
    slides.push({
      id: `so-q-${question.question_id}`,
      kicker: "top SQL question this week",
      title: plain(question.title),
      stat: { value: full(question.view_count), label: `views · ${question.answer_count} answers` },
      body: "even pros get stuck. that's what this site is for.",
      link: { href: question.link, label: "see the answers" },
      source: "Stack Overflow",
      at: question.creation_date * 1000,
    });
  }
  return slides;
};

// ---------- security: Have I Been Pwned + SANS Internet Storm Center ----------

const PORT_NAMES: Record<number, string> = {
  21: "FTP, old-school file transfer",
  22: "SSH, remote login for servers",
  23: "Telnet, remote login with no encryption",
  25: "SMTP, email delivery",
  53: "DNS, the internet's phone book",
  80: "HTTP, plain websites",
  443: "HTTPS, secure websites",
  445: "SMB, Windows file sharing",
  1433: "Microsoft SQL Server databases",
  3306: "MySQL databases",
  3389: "RDP, Windows remote desktop",
  5900: "VNC, remote screen sharing",
  8080: "HTTP on a backup port",
};

const securitySlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const [breach, ports, level] = await Promise.allSettled([
    getJson<{ Name: string; Title: string; Domain: string; BreachDate: string; PwnCount: number; DataClasses: string[]; LogoPath: string }>(
      "https://haveibeenpwned.com/api/v3/latestbreach",
      signal,
    ),
    getJson<Record<string, { targetport: number; records: number; sources: number } | string | number>>("https://isc.sans.edu/api/topports/records/1?json", signal),
    getJson<{ status: string }>("https://isc.sans.edu/api/infocon?json", signal),
  ]);
  const slides: Slide[] = [];
  if (breach.status === "fulfilled") {
    const b = breach.value;
    slides.push({
      id: `hibp-${b.Name}`,
      kicker: "newest data breach",
      stat: { value: compact(b.PwnCount), label: "accounts leaked" },
      title: `${b.Title} got breached`,
      body: `leaked: ${b.DataClasses.slice(0, 4).join(", ").toLowerCase()}. you can check if your email is in it, for free.`,
      icon: b.LogoPath,
      link: { href: "https://haveibeenpwned.com", label: "check my email" },
      source: "Have I Been Pwned",
      at: new Date(b.BreachDate).getTime(),
    });
  }
  if (ports.status === "fulfilled") {
    const row = Object.values(ports.value).find((r): r is { targetport: number; records: number; sources: number } => typeof r === "object");
    if (row) {
      const threat = level.status === "fulfilled" ? level.value.status : undefined;
      slides.push({
        id: `isc-${isoDay(new Date())}-${row.targetport}`,
        kicker: "most attacked port today",
        stat: { value: String(row.targetport), label: PORT_NAMES[row.targetport] ?? "network port" },
        title: `${full(row.records)} attack attempts from ${full(row.sources)} different computers, so far today`,
        body: threat ? `internet threat level right now: ${threat}.` : undefined,
        source: "SANS Internet Storm Center",
      });
    }
  }
  return slides;
};

// ---------- space: Launch Library, Where the ISS at, USGS ----------

const spaceSlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const [launch, iss, quakes] = await Promise.allSettled([
    getJson<{ results: { slug: string; name: string; net: string; image: string | null; location: string; lsp_name: string; status: { name: string } }[] }>(
      "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1&mode=list",
      signal,
    ),
    getJson<{ latitude: number; longitude: number; altitude: number; velocity: number }>("https://api.wheretheiss.at/v1/satellites/25544", signal),
    getJson<{ features: { id: string; properties: { mag: number; place: string; time: number; url: string } }[] }>(
      "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson",
      signal,
    ),
  ]);
  const slides: Slide[] = [];
  const next = launch.status === "fulfilled" ? launch.value.results[0] : undefined;
  if (next) {
    const [rocket, mission] = next.name.split(" | ");
    slides.push({
      id: `launch-${next.slug}`,
      kicker: `next rocket launch · ${next.status.name.toLowerCase()}`,
      title: mission ? `${rocket} carrying ${mission.toLowerCase() === "unknown payload" ? "a secret payload" : mission}` : next.name,
      body: `${next.lsp_name} · ${next.location}`,
      image: next.image ? { src: next.image } : undefined,
      source: "The Space Devs",
      at: new Date(next.net).getTime(),
    });
  }
  if (iss.status === "fulfilled") {
    const { latitude, longitude, altitude, velocity } = iss.value;
    let where = "the ocean";
    try {
      const spot = await getJson<{ country_code: string }>(`https://api.wheretheiss.at/v1/coordinates/${latitude.toFixed(3)},${longitude.toFixed(3)}`, signal);
      const name = /^[A-Z]{2}$/.test(spot.country_code) ? new Intl.DisplayNames(["en"], { type: "region" }).of(spot.country_code) : undefined;
      if (name) where = name;
    } catch {
      /* no country under the station, so it's over water */
    }
    slides.push({
      id: `iss-${isoDay(new Date())}`,
      kicker: "the space station, right now",
      title: `flying over ${where}`,
      stat: { value: `${full(Math.round(velocity))} km/h`, label: `${Math.round(altitude)} km above the ground` },
      body: "fast enough to go around the whole Earth every 90 minutes. the crew sees 16 sunrises a day.",
      source: "Where the ISS at?",
    });
  }
  if (quakes.status === "fulfilled" && quakes.value.features.length) {
    const list = quakes.value.features;
    const biggest = [...list].sort((a, b) => b.properties.mag - a.properties.mag)[0];
    slides.push({
      id: `quake-${biggest.id}`,
      kicker: "our planet, last 24 hours",
      stat: { value: String(list.length), label: `earthquake${list.length === 1 ? "" : "s"} stronger than 4.5` },
      title: `the biggest: magnitude ${biggest.properties.mag.toFixed(1)}, ${biggest.properties.place}`,
      body: "seismometers around the world report these within minutes.",
      link: { href: biggest.properties.url, label: "see the map" },
      source: "USGS",
      at: biggest.properties.time,
    });
  }
  return slides;
};

// ---------- fun: useless facts + Open Trivia DB ----------

const shuffle = <T>(list: T[]) => list.map(x => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

type TriviaResponse = { response_code: number; results: { category: string; question: string; correct_answer: string; incorrect_answers: string[] }[] };

/** Open Trivia DB allows one call every 5 seconds and answers 429 when you're too quick */
const loadTrivia = async (signal: AbortSignal): Promise<TriviaResponse> => {
  const url = "https://opentdb.com/api.php?amount=1&type=multiple&category=18";
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, { signal });
    if (response.status !== 429 || attempt === 1) {
      if (!response.ok) throw new Error(`${response.status} ${url}`);
      return response.json() as Promise<TriviaResponse>;
    }
    await new Promise(resolve => setTimeout(resolve, 5500));
  }
};

const funSlides = async (signal: AbortSignal): Promise<Slide[]> => {
  const [fact, quiz] = await Promise.allSettled([
    getJson<{ id: string; text: string }>("https://uselessfacts.jsph.pl/api/v2/facts/today?language=en", signal),
    loadTrivia(signal),
  ]);
  const slides: Slide[] = [];
  if (fact.status === "fulfilled") {
    slides.push({ id: `useless-${fact.value.id}`, kicker: "useless fact of the day", title: fact.value.text.replace(/`/g, ""), source: "uselessfacts" });
  }
  const q = quiz.status === "fulfilled" ? quiz.value.results[0] : undefined;
  if (q) {
    const correct = plain(q.correct_answer);
    const options = shuffle([correct, ...q.incorrect_answers.map(plain)]);
    slides.push({
      id: `trivia-${plain(q.question).slice(0, 60)}`,
      kicker: "quick trivia · tap your answer",
      title: plain(q.question),
      trivia: { options, answer: options.indexOf(correct) },
      source: "Open Trivia DB",
    });
  }
  return slides;
};

/** Every source is fetched on its own, so one broken API only hides its own slides */
export const loadStories = async (signal: AbortSignal): Promise<Story[]> => {
  const wiki = wikiFeed(signal).catch(() => null);
  const fromWiki = (pick: (feed: WikiFeed) => Slide[]) => wiki.then(feed => (feed ? pick(feed) : []));

  const loaders: Record<StoryId, Promise<Slide[]>> = {
    today: fromWiki(todaySlides),
    tech: techSlides(signal),
    money: moneySlides(signal),
    marketing: fromWiki(marketingSlides),
    data: dataSlides(signal),
    security: securitySlides(signal),
    space: spaceSlides(signal),
    fun: Promise.all([funSlides(signal), fromWiki(funWikiSlides)]).then(([a, b]) => [...a, ...b]),
  };

  const results = await Promise.all(SECTORS.map(sector => loaders[sector.id].catch(() => [] as Slide[])));
  return SECTORS.map((sector, i) => ({ ...sector, slides: results[i] })).filter(story => story.slides.length);
};
