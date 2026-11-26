import type { InterestId } from "../prefs";

/** A post pulled from a public API, shown between our own posts in the feed */
export type LivePost = {
  id: string;
  sourceId: string;
  /** Where it came from, shown like an account name, e.g. "dev.to" */
  source: string;
  /** Brand colour of the source, for its avatar */
  color: string;
  tags: InterestId[];
  kicker: string;
  title: string;
  body?: string;
  /** A real photo or cover from the source */
  image?: string;
  /** A small logo or avatar next to the text */
  icon?: string;
  stat?: { value: string; label: string };
  author?: string;
  likes?: number;
  comments?: number;
  /** Published time (ms) */
  at?: number;
  link: string;
  linkLabel: string;
  hashtags: string[];
};

export type Source = {
  id: string;
  interests: InterestId[];
  load: (signal: AbortSignal) => Promise<LivePost[]>;
};

const PER_SOURCE = 6;

const getJson = async <T>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
};

const DAY = 86_400_000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);
const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const compact = (n: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
const plain = (html: string) => (new DOMParser().parseFromString(html, "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim();
const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

// ---------- dev.to: top articles of the week for a tag ----------

type DevArticle = {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string | null;
  tag_list: string[];
  public_reactions_count: number;
  comments_count: number;
  reading_time_minutes: number;
  published_at: string;
  user: { name: string; profile_image_90: string };
};

const devto = (tag: string, interests: InterestId[]): Source => ({
  id: `devto-${tag}`,
  interests,
  load: async signal => {
    const articles = await getJson<DevArticle[]>(`https://dev.to/api/articles?tag=${tag}&top=7&per_page=${PER_SOURCE}`, signal);
    return articles.map(a => ({
      id: `devto-${a.id}`,
      sourceId: `devto-${tag}`,
      source: "dev.to",
      color: "#e8e8e8",
      tags: interests,
      kicker: `top in #${tag} this week · ${a.reading_time_minutes} min read`,
      title: a.title,
      body: a.description ? clip(a.description, 180) : undefined,
      image: a.cover_image ?? undefined,
      icon: a.user.profile_image_90,
      author: a.user.name,
      likes: a.public_reactions_count,
      comments: a.comments_count,
      at: new Date(a.published_at).getTime(),
      link: a.url,
      linkLabel: "read on dev.to",
      hashtags: a.tag_list.slice(0, 3),
    }));
  },
});

// ---------- Hacker News: popular stories this week about a topic ----------

type HnHit = { objectID: string; title: string; url: string | null; points: number; num_comments: number; author: string; created_at_i: number };

const hn = (query: string, interests: InterestId[]): Source => ({
  id: `hn-${query}`,
  interests,
  load: async signal => {
    const since = Math.floor(daysAgo(7).getTime() / 1000);
    const { hits } = await getJson<{ hits: HnHit[] }>(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${since},points>40&hitsPerPage=${PER_SOURCE}`,
      signal,
    );
    return hits.map(h => {
      const link = h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`;
      return {
        id: `hn-${h.objectID}`,
        sourceId: `hn-${query}`,
        source: "hacker news",
        color: "#ff6600",
        tags: interests,
        kicker: `trending with engineers${hostOf(link) ? ` · ${hostOf(link)}` : ""}`,
        title: h.title,
        stat: { value: compact(h.points), label: `upvotes · ${compact(h.num_comments)} comments` },
        author: h.author,
        likes: h.points,
        comments: h.num_comments,
        at: h.created_at_i * 1000,
        link,
        linkLabel: "read it",
        hashtags: [query.replace(/\s+/g, "")],
      };
    });
  },
});

// ---------- Stack Exchange: hot questions people are asking right now ----------

type SeQuestion = {
  question_id: number;
  title: string;
  link: string;
  view_count: number;
  answer_count: number;
  score: number;
  tags: string[];
  creation_date: number;
  owner: { display_name?: string; profile_image?: string };
};

const SE_NAMES: Record<string, string> = {
  networkengineering: "network engineering",
  superuser: "super user",
  security: "infosec",
  stackoverflow: "stack overflow",
  money: "personal finance",
};

const stackExchange = (site: string, tag: string | undefined, interests: InterestId[]): Source => ({
  id: `se-${site}${tag ? `-${tag}` : ""}`,
  interests,
  load: async signal => {
    const tagged = tag ? `&tagged=${tag}` : "";
    const { items } = await getJson<{ items: SeQuestion[] }>(
      `https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=${site}${tagged}&pagesize=${PER_SOURCE}`,
      signal,
    );
    return items.map(q => ({
      id: `se-${site}-${q.question_id}`,
      sourceId: `se-${site}${tag ? `-${tag}` : ""}`,
      source: SE_NAMES[site] ?? site,
      color: "#f48024",
      tags: interests,
      kicker: "people are asking",
      title: plain(q.title),
      stat: { value: compact(q.view_count), label: `views · ${q.answer_count} answer${q.answer_count === 1 ? "" : "s"}` },
      author: q.owner.display_name ? plain(q.owner.display_name) : undefined,
      icon: q.owner.profile_image,
      likes: Math.max(0, q.score),
      comments: q.answer_count,
      at: q.creation_date * 1000,
      link: q.link,
      linkLabel: "see the answers",
      hashtags: q.tags.slice(0, 3),
    }));
  },
});

// ---------- GitHub: fastest-growing new projects for a topic ----------

type Repo = { id: number; full_name: string; description: string | null; stargazers_count: number; language: string | null; html_url: string; created_at: string; owner: { avatar_url: string } };

const github = (topic: string, interests: InterestId[]): Source => ({
  id: `gh-${topic}`,
  interests,
  load: async signal => {
    const { items } = await getJson<{ items: Repo[] }>(
      `https://api.github.com/search/repositories?q=topic:${topic}+created:>${isoDay(daysAgo(30))}&sort=stars&order=desc&per_page=${PER_SOURCE}`,
      signal,
    );
    return items.map(r => ({
      id: `gh-${r.id}`,
      sourceId: `gh-${topic}`,
      source: "github",
      color: "#f0f6fc",
      tags: interests,
      kicker: "new project blowing up on github",
      title: r.full_name,
      body: [r.description && clip(r.description, 160), r.language && `written in ${r.language}`].filter(Boolean).join(" · ") || undefined,
      icon: r.owner.avatar_url,
      stat: { value: `${compact(r.stargazers_count)} ★`, label: "stars this month" },
      likes: r.stargazers_count,
      at: new Date(r.created_at).getTime(),
      link: r.html_url,
      linkLabel: "see the code",
      hashtags: [topic, ...(r.language ? [r.language.toLowerCase()] : [])],
    }));
  },
});

// ---------- CoinGecko: biggest movers among the top coins ----------

type Coin = { id: string; name: string; symbol: string; image: string; current_price: number; market_cap_rank: number; price_change_percentage_24h: number | null };

const coins: Source = {
  id: "coins",
  interests: ["money"],
  load: async signal => {
    const list = await getJson<Coin[]>("https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&order=market_cap_desc&per_page=25", signal);
    const movers = list.filter(c => c.price_change_percentage_24h !== null).sort((a, b) => Math.abs(b.price_change_percentage_24h!) - Math.abs(a.price_change_percentage_24h!));
    const hour = new Date().toISOString().slice(0, 13);
    return movers.slice(0, 3).map(c => {
      const change = c.price_change_percentage_24h!;
      return {
        id: `coin-${c.id}-${hour}`,
        sourceId: "coins",
        source: "coingecko",
        color: "#8dc63f",
        tags: ["money"],
        kicker: `crypto mover · ranked #${c.market_cap_rank}`,
        title: `${c.name} ${change > 0 ? "jumped" : "fell"} ${Math.abs(change).toFixed(1)}% in a day`,
        body: `1 ${c.symbol.toUpperCase()} = ₹${c.current_price.toLocaleString("en-IN")}. big daily swings like this are why crypto is called risky. not a tip to buy.`,
        icon: c.image,
        stat: { value: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`, label: "in 24 hours" },
        link: `https://www.coingecko.com/en/coins/${c.id}`,
        linkLabel: "see the chart",
        hashtags: [c.symbol, "crypto"],
      };
    });
  },
};

// ---------- TVmaze: shows dropping on streaming apps today ----------

type Episode = {
  id: number;
  name: string;
  season: number;
  number: number | null;
  airdate: string;
  _embedded: { show: { id: number; name: string; url: string; genres: string[]; summary: string | null; image: { medium: string; original: string } | null; rating: { average: number | null }; webChannel: { name: string } | null; language: string | null } };
};

const shows: Source = {
  id: "tvmaze",
  interests: ["streaming"],
  load: async signal => {
    const episodes = await getJson<Episode[]>(`https://api.tvmaze.com/schedule/web?date=${isoDay(new Date())}`, signal);
    const seen = new Set<number>();
    return episodes
      .filter(e => {
        const show = e._embedded.show;
        if (!show.image || seen.has(show.id) || show.language !== "English") return false;
        seen.add(show.id);
        return true;
      })
      .sort((a, b) => (b._embedded.show.rating.average ?? 0) - (a._embedded.show.rating.average ?? 0))
      .slice(0, PER_SOURCE)
      .map(e => {
        const show = e._embedded.show;
        const app = show.webChannel?.name;
        return {
          id: `tv-${e.id}`,
          sourceId: "tvmaze",
          source: "tvmaze",
          color: "#3c948b",
          tags: ["streaming"],
          kicker: `new today${app ? ` on ${app}` : ""}`,
          title: `${show.name}: season ${e.season}${e.number ? `, episode ${e.number}` : ""}`,
          body: show.summary ? clip(plain(show.summary), 170) : undefined,
          image: show.image!.original,
          stat: show.rating.average ? { value: `${show.rating.average}/10`, label: "viewer rating" } : undefined,
          at: new Date(e.airdate).getTime(),
          link: show.url,
          linkLabel: "about the show",
          hashtags: show.genres.slice(0, 2).map(g => g.toLowerCase().replace(/\s+/g, "")),
        };
      });
  },
};

// ---------- CheapShark: best game deals right now ----------

type Deal = { dealID: string; title: string; salePrice: string; normalPrice: string; savings: string; steamAppID: string | null; steamRatingPercent: string; steamRatingText: string | null; thumb: string; lastChange: number };

const deals: Source = {
  id: "deals",
  interests: ["gaming"],
  load: async signal => {
    const list = await getJson<Deal[]>("https://www.cheapshark.com/api/1.0/deals?pageSize=12&sortBy=Deal%20Rating&steamRating=75", signal);
    return list
      .filter(d => d.steamAppID && d.thumb.includes("capsule_231x87"))
      .slice(0, PER_SOURCE)
      .map(d => ({
        id: `deal-${d.dealID}`,
        sourceId: "deals",
        source: "cheapshark",
        color: "#4fa3d1",
        tags: ["gaming"],
        kicker: "game deal right now",
        title: `${d.title} is ${Math.round(Number(d.savings))}% off`,
        body: `$${d.normalPrice} → $${d.salePrice}.${d.steamRatingText ? ` steam players rate it "${d.steamRatingText.toLowerCase()}".` : ""}`,
        image: d.thumb.replace("capsule_231x87", "header"),
        stat: { value: `$${d.salePrice}`, label: `was $${d.normalPrice}` },
        likes: Number(d.steamRatingPercent) || undefined,
        at: d.lastChange * 1000,
        link: `https://www.cheapshark.com/redirect?dealID=${d.dealID}`,
        linkLabel: "see the deal",
        hashtags: ["gaming", "deal"],
      }));
  },
};

/** Every place live posts come from, and which interests each one feeds */
export const SOURCES: Source[] = [
  devto("networking", ["internet", "home"]),
  devto("webdev", ["web"]),
  devto("security", ["security"]),
  devto("privacy", ["privacy"]),
  devto("gamedev", ["gaming"]),
  devto("database", ["data"]),
  devto("startup", ["business"]),
  devto("marketing", ["marketing"]),
  hn("internet", ["internet"]),
  hn("wifi", ["home"]),
  hn("browser", ["web"]),
  hn("security", ["security"]),
  hn("privacy", ["privacy"]),
  hn("gaming", ["gaming"]),
  hn("streaming", ["streaming"]),
  hn("database", ["data"]),
  hn("startup", ["business"]),
  hn("marketing", ["marketing"]),
  hn("investing", ["money"]),
  stackExchange("networkengineering", undefined, ["internet"]),
  stackExchange("superuser", "wireless-networking", ["home"]),
  stackExchange("security", undefined, ["security", "privacy"]),
  stackExchange("stackoverflow", "sql", ["data"]),
  stackExchange("money", undefined, ["money", "business"]),
  github("security", ["security"]),
  github("database", ["data"]),
  coins,
  shows,
  deals,
];

export const sourcesFor = (interests: InterestId[]) => SOURCES.filter(s => s.interests.some(i => interests.includes(i)));
