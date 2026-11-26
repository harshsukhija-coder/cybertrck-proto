import { lessonHash } from "../data";
import { gameHash, type GameId } from "../games/games";
import type { InterestId } from "../prefs";

/**
 * Something to do on a path. Chapters tick themselves when you finish them;
 * everything else you tick yourself.
 */
export type Step = { id: string; label: string; why: string; minutes: number } & (
  | { kind: "chapter"; course: string; chapter: string }
  | { kind: "game"; game: GameId }
  | { kind: "academy"; href: string }
  | { kind: "web"; href: string; site: string }
  | { kind: "do" }
);

/** One question per stage. Answering it right means you already know that stage. */
export type Check = { q: string; options: string[]; answer: number; why: string };

export type Stage = {
  name: string;
  /** What you can do once you finish this stage */
  can: string;
  steps: Step[];
  check: Check;
};

export type LearningPath = {
  id: string;
  title: string;
  /** Short name for chips, stories and the terminal */
  label: string;
  tagline: string;
  color: string;
  glyph: string;
  interests: InterestId[];
  stages: Stage[];
  /** Where this path can take you */
  careers: { role: string; does: string }[];
};

export const STAGE_NAMES = ["curious", "basics", "hands-on", "builder", "pro"] as const;

const chapter = (id: string, course: string, chapterId: string, label: string, why: string, minutes = 4): Step => ({
  id,
  kind: "chapter",
  course,
  chapter: chapterId,
  label,
  why,
  minutes,
});
const game = (id: string, gameId: GameId, label: string, why: string): Step => ({ id, kind: "game", game: gameId, label, why, minutes: 3 });
const web = (id: string, href: string, site: string, label: string, why: string, minutes: number): Step => ({ id, kind: "web", href, site, label, why, minutes });
const task = (id: string, label: string, why: string, minutes: number): Step => ({ id, kind: "do", label, why, minutes });

const WRITTEN: LearningPath[] = [
  {
    id: "network",
    title: "networking",
    label: "networking",
    tagline: "from \"what is wifi\" to running real networks",
    color: "#4f8cff",
    glyph: "⇄",
    interests: ["internet", "home", "web", "gaming", "streaming"],
    stages: [
      {
        name: "curious",
        can: "explain what a network is and what an ip address does",
        steps: [
          chapter("net-1a", "networking", "what-is-a-network", "read: networks", "the big picture in 4 minutes"),
          chapter("net-1b", "networking", "ip-addresses", "read: ip addresses", "every device's home address"),
          game("net-1c", "packet-puzzle", "play: packet puzzle", "see how a message gets split up and put back together"),
        ],
        check: {
          q: "what does an ip address do?",
          options: ["makes your wifi faster", "tells data which device to go to", "stores your passwords", "blocks viruses"],
          answer: 1,
          why: "it's an address. without it, data wouldn't know where to go.",
        },
      },
      {
        name: "basics",
        can: "follow a message from your phone to a website and back",
        steps: [
          chapter("net-2a", "networking", "packets", "read: packets", "why data travels in small pieces"),
          chapter("net-2b", "networking", "routers-switches", "read: routers", "the box that decides where data goes"),
          chapter("net-2c", "networking", "dns", "read: dns", "how names like google.com become numbers"),
          task("net-2d", "try it: run \"tracert google.com\" (windows) or \"traceroute google.com\" (mac) and count the hops", "each line is a router your data passed through", 5),
        ],
        check: {
          q: "you type youtube.com. what happens first?",
          options: ["the video starts loading", "dns looks up youtube's ip address", "your router restarts", "youtube sends you a cookie"],
          answer: 1,
          why: "computers need the number, not the name. dns finds it first.",
        },
      },
      {
        name: "hands-on",
        can: "pick the right protocol and port for a job, and fix basic home wifi problems",
        steps: [
          chapter("net-3a", "networking", "tcp-vs-udp", "read: tcp vs udp", "why games and calls use a different protocol"),
          chapter("net-3b", "networking", "ports", "read: ports", "the numbered doors on every device"),
          game("net-3c", "port-rush", "play: port rush", "learn the common port numbers by heart"),
          game("net-3d", "tcp-or-udp", "play: tcp or udp?", "test if you can pick the right one"),
        ],
        check: {
          q: "a video call keeps going even when a few packets get lost. it most likely uses…",
          options: ["tcp", "udp", "ftp", "smtp"],
          answer: 1,
          why: "udp doesn't wait for lost packets. for live video, late is worse than missing.",
        },
      },
      {
        name: "builder",
        can: "design and build a small network with routers, switches and subnets",
        steps: [
          chapter("net-4a", "networking", "osi-model", "read: the osi model", "the map every network engineer uses"),
          { id: "net-4b", kind: "academy", href: "#/academy", label: "do the networking academy labs", why: "build real networks in cisco packet tracer", minutes: 60 },
          web("net-4c", "https://www.netacad.com/cisco-packet-tracer", "netacad.com", "get cisco packet tracer (free)", "the network simulator the labs use", 15),
        ],
        check: {
          q: "how many usable host addresses are in a /24 subnet?",
          options: ["24", "254", "256", "1024"],
          answer: 1,
          why: "256 addresses, minus the network address and the broadcast address.",
        },
      },
      {
        name: "pro",
        can: "pass an entry-level network certification and run networks for a living",
        steps: [
          web("net-5a", "https://www.professormesser.com/", "professormesser.com", "watch professor messer's free network+ course", "a full certification course, free on youtube", 600),
          web("net-5b", "https://www.comptia.org/certifications/network", "comptia.org", "read about the comptia network+ exam", "the most common first networking certificate", 10),
          web("net-5c", "https://www.netacad.com/", "netacad.com", "start cisco's ccna course on netacad", "the certificate most network jobs ask for", 600),
        ],
        check: {
          q: "a router gets a packet for an address it has no route for, and has no default route. what does it do?",
          options: ["sends it to every port", "drops it", "sends it back to the sender unchanged", "waits until a route appears"],
          answer: 1,
          why: "no matching route and no default route means the packet is dropped (usually with an icmp 'unreachable').",
        },
      },
    ],
    careers: [
      { role: "it support", does: "fixes wifi, laptops and accounts for a company. the usual first job." },
      { role: "network engineer", does: "designs and runs the networks inside companies and isps." },
      { role: "cloud engineer", does: "builds networks and servers on aws, azure or google cloud." },
    ],
  },
  {
    id: "security",
    title: "cybersecurity",
    label: "security",
    tagline: "spot scams first, then learn how real attacks work",
    color: "#ff4d6d",
    glyph: "!",
    interests: ["security", "privacy", "home"],
    stages: [
      {
        name: "curious",
        can: "spot a phishing message and keep your own accounts safe",
        steps: [
          game("sec-1a", "real-or-phish", "play: real or phish?", "train your eye on real scam messages"),
          game("sec-1b", "scam-or-legit", "play: scam or legit?", "money scams use the same tricks"),
          web("sec-1c", "https://haveibeenpwned.com/", "haveibeenpwned.com", "check if your email was in a data leak", "most people find at least one", 2),
          task("sec-1d", "turn on two-step login for your main email", "it stops most account takeovers", 5),
        ],
        check: {
          q: "an email says \"your account will be closed in 24 hours, click here\". the biggest red flag is…",
          options: ["it has a link", "it rushes you", "it's in english", "it came in the morning"],
          answer: 1,
          why: "scammers make you hurry so you don't stop and think.",
        },
      },
      {
        name: "basics",
        can: "explain how devices find each other and where attackers get in",
        steps: [
          chapter("sec-2a", "networking", "ip-addresses", "read: ip addresses", "what an attacker sees about you"),
          chapter("sec-2b", "networking", "dns", "read: dns", "fake dns is a classic trick"),
          chapter("sec-2c", "networking", "ports", "read: ports", "open ports are open doors"),
        ],
        check: {
          q: "why is an open port on your router risky?",
          options: ["it slows the internet", "anyone online can try to connect to it", "it uses more electricity", "it changes your ip"],
          answer: 1,
          why: "an open port is a door to the internet. if the thing behind it is weak, attackers walk in.",
        },
      },
      {
        name: "hands-on",
        can: "use the command line and find weak spots in practice labs",
        steps: [
          chapter("sec-3a", "databases", "sql-injection", "read: sql injection", "one of the most common website attacks"),
          game("sec-3b", "port-rush", "play: port rush", "know which service lives on which port"),
          web("sec-3c", "https://overthewire.org/wargames/bandit/", "overthewire.org", "play overthewire: bandit", "a free game that teaches the linux command line", 120),
          web("sec-3d", "https://tryhackme.com/", "tryhackme.com", "do tryhackme's free beginner rooms", "guided hacking labs in your browser", 120),
        ],
        check: {
          q: "a login form runs: select * from users where name = '<what you typed>'. what's the danger?",
          options: ["it's slow", "typed text can change the query itself", "it shows passwords on screen", "nothing, sql is safe"],
          answer: 1,
          why: "that's sql injection. user input must never be pasted straight into a query.",
        },
      },
      {
        name: "builder",
        can: "find and fix real web vulnerabilities and play capture-the-flag events",
        steps: [
          web("sec-4a", "https://owasp.org/www-project-top-ten/", "owasp.org", "read the owasp top 10", "the 10 most common web security problems", 30),
          web("sec-4b", "https://portswigger.net/web-security", "portswigger.net", "do the web security academy labs", "free, hands-on, made by the burp suite team", 300),
          web("sec-4c", "https://picoctf.org/", "picoctf.org", "play picoctf", "a free beginner capture-the-flag", 180),
        ],
        check: {
          q: "a site shows your search term back on the page without cleaning it. what attack does that allow?",
          options: ["ddos", "cross-site scripting (xss)", "phishing", "brute force"],
          answer: 1,
          why: "if the page prints your text as html, someone can make it run their javascript.",
        },
      },
      {
        name: "pro",
        can: "work in a security team or earn from bug bounties",
        steps: [
          web("sec-5a", "https://www.comptia.org/certifications/security", "comptia.org", "read about comptia security+", "the most asked-for entry security certificate", 10),
          web("sec-5b", "https://www.hackerone.com/", "hackerone.com", "look at public bug bounty programs", "companies pay you to find real bugs, legally", 20),
          task("sec-5c", "write up one lab you solved, as a short blog post", "a public write-up is the best proof of skill", 60),
        ],
        check: {
          q: "you find a serious bug in a company's site. what's the right move?",
          options: ["post it online", "report it through their disclosure or bug bounty program", "use it to prove a point", "sell it"],
          answer: 1,
          why: "responsible disclosure keeps you legal and gets the bug fixed. many companies pay for it.",
        },
      },
    ],
    careers: [
      { role: "soc analyst", does: "watches alerts and stops attacks as they happen. a common first security job." },
      { role: "penetration tester", does: "is paid to hack companies (with permission) and report the holes." },
      { role: "bug bounty hunter", does: "finds bugs in public programs and gets paid per bug." },
    ],
  },
  {
    id: "data",
    title: "data & databases",
    label: "data",
    tagline: "ask questions of data and get real answers",
    color: "#38bdf8",
    glyph: "db",
    interests: ["data", "web"],
    stages: [
      {
        name: "curious",
        can: "explain what a database is and why every app has one",
        steps: [
          chapter("data-1a", "databases", "what-is-a-database", "read: databases", "where apps keep their stuff"),
          game("data-1b", "query-builder", "play: query builder", "build your first query by tapping"),
        ],
        check: {
          q: "in a table of users, what is one row?",
          options: ["one column name", "one user", "the whole database", "a password"],
          answer: 1,
          why: "each row is one thing (one user), each column is one fact about it.",
        },
      },
      {
        name: "basics",
        can: "write simple sql queries to find and sort data",
        steps: [
          chapter("data-2a", "databases", "sql", "read: sql", "the language for talking to databases"),
          web("data-2b", "https://sqlbolt.com/", "sqlbolt.com", "do the sqlbolt lessons", "short, free, interactive sql practice", 60),
        ],
        check: {
          q: "which query gets every user older than 18?",
          options: ["get users > 18", "select * from users where age > 18", "find age 18 in users", "users.filter(18)"],
          answer: 1,
          why: "select picks columns, from picks the table, where filters the rows.",
        },
      },
      {
        name: "hands-on",
        can: "join tables, group results and keep queries fast",
        steps: [
          chapter("data-3a", "databases", "indexes", "read: indexes", "why some queries take 1 ms and others 10 seconds"),
          web("data-3b", "https://mystery.knightlab.com/", "knightlab.com", "solve the sql murder mystery", "a crime story you solve with sql", 45),
        ],
        check: {
          q: "a query searching users by email is slow on 10 million rows. the usual fix is…",
          options: ["buy a bigger screen", "add an index on email", "delete old users", "use select * instead"],
          answer: 1,
          why: "an index lets the database jump to the row instead of reading every row.",
        },
      },
      {
        name: "builder",
        can: "design a database for a real app and keep it safe",
        steps: [
          chapter("data-4a", "databases", "sql-injection", "read: sql injection", "the attack every database builder must stop"),
          task("data-4b", "build a tiny database of your own expenses and answer: where did most money go?", "real data you care about sticks better", 45),
          web("data-4c", "https://www.kaggle.com/learn", "kaggle.com", "take kaggle's free sql and pandas courses", "short courses with real datasets", 240),
        ],
        check: {
          q: "how do you stop sql injection?",
          options: ["hide the database", "use parameterised queries", "use longer table names", "only allow logged-in users"],
          answer: 1,
          why: "parameters keep user input as data, so it can never become part of the query.",
        },
      },
      {
        name: "pro",
        can: "work as a data analyst: clean data, find patterns and present them",
        steps: [
          web("data-5a", "https://www.kaggle.com/competitions", "kaggle.com", "join a beginner kaggle competition", "practice on real problems and see other people's solutions", 300),
          task("data-5b", "publish one analysis with a chart and 3 findings", "a portfolio piece beats a certificate", 120),
        ],
        check: {
          q: "your sales chart jumps 10x on one day. what do you do first?",
          options: ["celebrate", "check if the data is wrong (duplicates, test orders)", "delete that day", "post it on linkedin"],
          answer: 1,
          why: "weird numbers are usually bad data first. analysts check before they conclude.",
        },
      },
    ],
    careers: [
      { role: "data analyst", does: "turns data into charts and answers for a business." },
      { role: "backend developer", does: "builds the servers and databases behind apps." },
      { role: "data engineer", does: "builds the pipelines that move and clean data at scale." },
    ],
  },
  {
    id: "money",
    title: "money & investing",
    label: "money",
    tagline: "make your money work, without getting scammed",
    color: "#2ee6a6",
    glyph: "₹",
    interests: ["money"],
    stages: [
      {
        name: "curious",
        can: "explain why money grows over time, and why it also shrinks",
        steps: [
          chapter("money-1a", "money", "compound-interest", "read: compound interest", "the reason starting early wins"),
          chapter("money-1b", "money", "inflation", "read: inflation", "why ₹100 buys less every year"),
        ],
        check: {
          q: "you invest ₹1,000 at 10% a year and never touch it. after 2 years you have…",
          options: ["₹1,200", "₹1,210", "₹1,100", "₹2,000"],
          answer: 1,
          why: "year 2 earns interest on the interest too. that's compounding.",
        },
      },
      {
        name: "basics",
        can: "track where your money goes and protect your credit score",
        steps: [
          task("money-2a", "write down everything you spent last month, in 5 groups", "you can't plan money you can't see", 20),
          chapter("money-2b", "money", "credit-score", "read: credit score", "the number banks judge you by"),
          game("money-2c", "scam-or-legit", "play: scam or legit?", "most money lost online is lost to scams"),
        ],
        check: {
          q: "what hurts your credit score the most?",
          options: ["checking your own score", "missing loan or card payments", "having a savings account", "paying bills early"],
          answer: 1,
          why: "payment history is the biggest part of the score. checking your own score doesn't hurt it.",
        },
      },
      {
        name: "hands-on",
        can: "understand stocks, mutual funds and index funds",
        steps: [
          chapter("money-3a", "money", "stocks", "read: stocks", "what you actually own when you buy a share"),
          web("money-3b", "https://zerodha.com/varsity/", "zerodha.com/varsity", "read zerodha varsity's first module", "free, simple lessons on how markets work", 90),
        ],
        check: {
          q: "an index fund is…",
          options: ["a fund that picks one hot stock", "a fund that buys every company in an index, like the nifty 50", "a fixed deposit", "a type of loan"],
          answer: 1,
          why: "it copies the whole index, so you get the market's return with low fees.",
        },
      },
      {
        name: "builder",
        can: "build an emergency fund and start investing every month",
        steps: [
          task("money-4a", "set aside 3 months of expenses as an emergency fund", "so a surprise bill doesn't force you to sell investments", 30),
          web("money-4b", "https://investor.sebi.gov.in/", "investor.sebi.gov.in", "read sebi's investor guides", "the regulator's own free guides, no selling", 30),
          task("money-4c", "learn how a monthly sip works before you start one (this isn't advice, just how it works)", "small amounts every month beat timing the market", 20),
        ],
        check: {
          q: "the market drops 20% in a month. if you invest every month for 20 years, the usual best move is…",
          options: ["sell everything", "keep investing as planned", "stop and wait for news", "move it all to one stock"],
          answer: 1,
          why: "drops mean you buy more units cheaply. selling locks in the loss.",
        },
      },
      {
        name: "pro",
        can: "read a company's numbers and help others plan their money",
        steps: [
          task("money-5a", "read one listed company's annual report summary and note 3 numbers", "pros read the source, not the headlines", 60),
          web("money-5b", "https://www.nism.ac.in/", "nism.ac.in", "see nism's certifications", "the certificates you need to give financial advice in india", 10),
        ],
        check: {
          q: "a company's profit went up but its cash went down. that can happen when…",
          options: ["it's always fraud", "customers haven't paid yet", "profit and cash are the same thing", "it never happens"],
          answer: 1,
          why: "profit counts sales when they happen. cash only counts money actually received.",
        },
      },
    ],
    careers: [
      { role: "financial planner", does: "helps people plan saving, investing and insurance." },
      { role: "equity research analyst", does: "studies companies and says whether to buy or sell." },
      { role: "fintech product person", does: "builds the money apps everyone uses." },
    ],
  },
  {
    id: "business",
    title: "accounting & business",
    label: "accounting",
    tagline: "read the numbers that run every business",
    color: "#ffb547",
    glyph: "Σ",
    interests: ["business", "money"],
    stages: [
      {
        name: "curious",
        can: "explain what accountants do and what a business owns and owes",
        steps: [
          chapter("biz-1a", "accounting", "why-accounting", "read: why accounting?", "the story behind every business's numbers"),
          chapter("biz-1b", "accounting", "assets-liabilities", "read: assets, liabilities & equity", "what you own, what you owe, what's left"),
          game("biz-1c", "asset-or-liability", "play: asset or liability?", "sort things fast until it's automatic"),
        ],
        check: {
          q: "a bank loan your business took is a…",
          options: ["asset", "liability", "income", "expense"],
          answer: 1,
          why: "you owe it back, so it's a liability.",
        },
      },
      {
        name: "basics",
        can: "record transactions with debits and credits",
        steps: [
          chapter("biz-2a", "accounting", "debit-credit", "read: debit & credit", "the two sides of every entry"),
          game("biz-2b", "debit-or-credit", "play: debit or credit?", "drill it until it's easy"),
        ],
        check: {
          q: "you buy a laptop for the business with cash. what happens?",
          options: ["assets go up and liabilities go up", "one asset goes up (laptop), another goes down (cash)", "income goes up", "nothing changes"],
          answer: 1,
          why: "you swapped one asset for another. total assets stay the same.",
        },
      },
      {
        name: "hands-on",
        can: "build a simple profit & loss statement and balance sheet",
        steps: [
          chapter("biz-3a", "accounting", "income-expenses", "read: income, expenses & profit", "how profit is really worked out"),
          chapter("biz-3b", "accounting", "balance-sheet", "read: the balance sheet", "the snapshot of a business"),
          game("biz-3c", "balance-it", "play: balance it", "make both sides match"),
        ],
        check: {
          q: "on a balance sheet, assets always equal…",
          options: ["income", "liabilities + equity", "cash", "expenses + profit"],
          answer: 1,
          why: "everything a business owns came from either borrowing or the owners.",
        },
      },
      {
        name: "builder",
        can: "keep the books for a small business and spot cash problems early",
        steps: [
          chapter("biz-4a", "accounting", "cash-vs-profit", "read: cash vs profit", "why profitable businesses still go bust"),
          web("biz-4b", "https://www.accountingcoach.com/", "accountingcoach.com", "work through accountingcoach's free topics", "clear explanations with quizzes", 120),
          web("biz-4c", "https://www.gnucash.org/", "gnucash.org", "keep a month of your own books in gnucash (free)", "real bookkeeping software, on your own numbers", 60),
        ],
        check: {
          q: "a business is profitable but can't pay salaries this month. the most likely reason is…",
          options: ["the accountant made a typo", "customers owe it money that hasn't come in yet", "profit is always fake", "it has too much cash"],
          answer: 1,
          why: "profit isn't cash. unpaid invoices look good on paper but can't pay salaries.",
        },
      },
      {
        name: "pro",
        can: "read any company's financial statements and plan a career in finance",
        steps: [
          task("biz-5a", "pick a listed company and compare 2 years of its profit and cash flow", "this is what analysts and auditors do every day", 60),
          web("biz-5b", "https://www.icai.org/", "icai.org", "see how to become a chartered accountant", "india's main accounting qualification", 15),
        ],
        check: {
          q: "which statement shows if a company can pay its bills in the next few months?",
          options: ["the logo", "the cash flow statement", "the share price", "the ceo's salary"],
          answer: 1,
          why: "cash flow shows money actually coming in and going out.",
        },
      },
    ],
    careers: [
      { role: "accountant", does: "keeps the books, files taxes and checks the numbers are right." },
      { role: "auditor", does: "checks other companies' books to make sure they're honest." },
      { role: "financial analyst", does: "uses the numbers to help a business decide what to do next." },
    ],
  },
  {
    id: "marketing",
    title: "marketing & social media",
    label: "marketing",
    tagline: "understand attention, then learn to earn it",
    color: "#ff5fa2",
    glyph: "#",
    interests: ["marketing", "streaming"],
    stages: [
      {
        name: "curious",
        can: "explain why some posts grab you and others don't",
        steps: [
          chapter("mkt-1a", "marketing", "hooks", "read: attention hooks", "you have about 1.5 seconds"),
          game("mkt-1b", "higher-lower", "play: bigger audience?", "get a feel for what's actually big online"),
        ],
        check: {
          q: "the first line of a short video should…",
          options: ["introduce yourself", "give a reason to keep watching", "show the logo", "thank the viewers"],
          answer: 1,
          why: "people decide in about a second. the hook comes first, the intro never.",
        },
      },
      {
        name: "basics",
        can: "explain how prices and brands change what people buy",
        steps: [
          chapter("mkt-2a", "marketing", "pricing", "read: pricing tricks", "why ₹999 beats ₹1,000"),
          chapter("mkt-2b", "marketing", "branding", "read: branding", "why people pay more for a logo"),
        ],
        check: {
          q: "a cinema sells small popcorn ₹200, medium ₹380, large ₹400. why the medium?",
          options: ["they had extra boxes", "it makes the large look like a great deal", "it's for kids", "it's a mistake"],
          answer: 1,
          why: "it's a decoy. nobody buys it; it pushes you to the large.",
        },
      },
      {
        name: "hands-on",
        can: "make content, measure it and learn from the numbers",
        steps: [
          chapter("mkt-3a", "marketing", "going-viral", "read: going viral", "what actually makes things spread"),
          task("mkt-3b", "post 3 short pieces with 3 different hooks and note the views after 2 days", "your own numbers teach more than any course", 60),
        ],
        check: {
          q: "post a got 10,000 views and 5 follows. post b got 2,000 views and 80 follows. which did better at growing the account?",
          options: ["post a", "post b", "they're the same", "you can't tell"],
          answer: 1,
          why: "views are attention, follows are results. measure the thing you actually want.",
        },
      },
      {
        name: "builder",
        can: "plan a campaign, run ads on a small budget and read the results",
        steps: [
          web("mkt-4a", "https://academy.hubspot.com/", "academy.hubspot.com", "take a free hubspot academy course", "free marketing courses with certificates", 180),
          web("mkt-4b", "https://skillshop.withgoogle.com/", "skillshop.withgoogle.com", "learn google ads on skillshop (free)", "google's own training for its ad tools", 180),
        ],
        check: {
          q: "you spend ₹1,000 on ads and get 50 clicks and 2 sales. what's your cost per sale?",
          options: ["₹20", "₹500", "₹50", "₹1,000"],
          answer: 1,
          why: "₹1,000 ÷ 2 sales = ₹500 per sale. clicks are cheap; sales are what count.",
        },
      },
      {
        name: "pro",
        can: "grow a brand or a client's account and prove it with numbers",
        steps: [
          web("mkt-5a", "https://www.facebook.com/business/learn", "facebook.com/business", "do meta's free blueprint courses", "how instagram and facebook ads really work", 180),
          task("mkt-5b", "grow one small account or page for 30 days and write up what worked", "a real case study gets you hired", 300),
        ],
        check: {
          q: "you test two ad images. a gets 3% clicks, b gets 2.5%, each from 40 views. what do you conclude?",
          options: ["a is clearly better", "too few views to tell yet", "b is better", "stop running ads"],
          answer: 1,
          why: "40 views is far too small. a difference that tiny could just be luck.",
        },
      },
    ],
    careers: [
      { role: "social media manager", does: "runs a brand's accounts, posts and community." },
      { role: "performance marketer", does: "runs paid ads and is judged on sales per rupee." },
      { role: "content creator", does: "builds their own audience and works with brands." },
    ],
  },
];

/** Questions are written with the answer second; spread the right answer across positions so it can't be guessed */
const shuffle = (check: Check, shift: number): Check => {
  const n = check.options.length;
  return { ...check, options: check.options.map((_, i) => check.options[(i + shift) % n]), answer: (check.answer - shift + n) % n };
};

export const PATHS: LearningPath[] = WRITTEN.map((path, p) => ({
  ...path,
  stages: path.stages.map((stage, s) => ({ ...stage, check: shuffle(stage.check, (p * 2 + s * 3) % stage.check.options.length) })),
}));

export const findPath = (id: string) => PATHS.find(p => p.id === id);

export const pathHash = (id?: string, check = false) => (id ? `#/feed/paths/${id}${check ? "/check" : ""}` : "#/feed/paths");

export const stepHref = (step: Step) => {
  switch (step.kind) {
    case "chapter":
      return lessonHash(step.course, step.chapter);
    case "game":
      return gameHash(step.game);
    case "academy":
    case "web":
      return step.href;
    case "do":
      return undefined;
  }
};

export const isExternal = (step: Step) => step.kind === "web";

/** Paths that match your interests, the best match first */
export const pathsFor = (interests: InterestId[]) =>
  PATHS.map(path => ({ path, score: path.interests.filter(i => interests.includes(i)).length }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.path);
