import packetsPhoto from "../../assets/courses/packets.jpg";
import phishPhoto from "../../assets/courses/phish.jpg";
import portsPhoto from "../../assets/courses/ports.jpg";
import tcpUdpPhoto from "../../assets/courses/tcp-udp.jpg";
import creditPhoto from "../../assets/courses/credit.jpg";
import selectPhoto from "../../assets/courses/select.jpg";
import viralPhoto from "../../assets/courses/viral.jpg";
import kettlePhoto from "../../assets/courses/acc-kettle.jpg";
import ledgerPhoto from "../../assets/courses/acc-ledger.jpg";
import scalePhoto from "../../assets/courses/acc-scale.jpg";
import ipPhoto from "../../assets/courses/ip.jpg";
import injectPhoto from "../../assets/courses/inject.jpg";
import hooksPhoto from "../../assets/courses/hooks.jpg";
import routerPhoto from "../../assets/courses/router.jpg";
import osiPhoto from "../../assets/courses/osi.jpg";
import compoundPhoto from "../../assets/courses/compound.jpg";
import type { CoverArt } from "../chapter-cover";
import type { InterestId } from "../prefs";

export type GameId =
  | "tcp-or-udp"
  | "real-or-phish"
  | "port-rush"
  | "packet-puzzle"
  | "higher-lower"
  | "query-builder"
  | "scam-or-legit"
  | "debit-or-credit"
  | "asset-or-liability"
  | "balance-it"
  | "myth-or-fact"
  | "crack-it"
  | "emoji-decode"
  | "lag-test"
  | "binary-blitz"
  | "money-machine";

/** What you need to know before playing, plus the chapter that explains it properly */
export type Primer = { points: string[]; course: string; chapter: string };

export type GameMeta = CoverArt & {
  id: GameId;
  title: string;
  /** Short hook shown on the game card and feed post */
  tagline: string;
  how: string;
  caption: string;
  tags: InterestId[];
  plays: number;
  /** Course the game belongs to, for grouping */
  course: string;
  primer: Primer;
};

export const GAMES: GameMeta[] = [
  {
    id: "tcp-or-udp",
    title: "tcp or udp?",
    word: "tcp or udp",
    tagline: "swipe left for tcp, right for udp. how fast is your gut?",
    how: "swipe or use ← →",
    caption: "facetime, bank transfers, valorant. which ones care about every byte? swipe to find out 🎮",
    photo: tcpUdpPhoto,
    duo: ["#06203a", "#4cc9f0"],
    focus: "50% 50%",
    tags: ["gaming", "streaming", "internet"],
    plays: 8412,
    course: "networking",
    primer: {
      points: ["**tcp** is careful delivery: every piece arrives, in order, or it gets sent again.", "**udp** is fast delivery: no waiting around, and a few pieces may get lost.", "ask yourself: is a late piece useless (udp) or is a missing piece a disaster (tcp)?"],
      course: "networking",
      chapter: "tcp-vs-udp",
    },
  },
  {
    id: "real-or-phish",
    title: "real or phish?",
    word: "phish?",
    tagline: "one of these links steals your password. can you spot it?",
    how: "swipe or use ← →",
    caption: "90% of hacks start with a fake link. you'd never fall for one… right? prove it 🎣",
    photo: phishPhoto,
    duo: ["#3a0716", "#ff8fa3"],
    focus: "30% 50%",
    tags: ["security", "privacy", "web"],
    plays: 12930,
    course: "networking",
    primer: {
      points: ["the real website is the part just before the first `/`. in `accounts.google.com/x` that's **google.com**.", "fakes swap letters that look alike: `paypa1`, `amaz0n`, `dlscord`.", "extra words glued to a brand, like `netflix-billing-update.com`, are a red flag."],
      course: "networking",
      chapter: "dns",
    },
  },
  {
    id: "port-rush",
    title: "port rush",
    word: "port rush",
    tagline: "30 seconds. a port number. what's behind the door?",
    how: "tap the right service",
    caption: "22, 443, 25565… how many doors can you name before the timer runs out? ⏱️",
    photo: portsPhoto,
    duo: ["#2b0a1e", "#ff4d6d"],
    focus: "65% 50%",
    exposure: 1.4,
    tags: ["security", "home", "gaming"],
    plays: 5307,
    course: "networking",
    primer: {
      points: ["a **port** is a numbered door on a computer. each app listens behind its own door.", "the classics: **80** = http, **443** = https, **22** = ssh, **53** = dns.", "you get 30 seconds. tap the service that lives behind each number."],
      course: "networking",
      chapter: "ports",
    },
  },
  {
    id: "packet-puzzle",
    title: "packet puzzle",
    word: "puzzle",
    tagline: "packets arrive scrambled. put the message back together. fast.",
    how: "tap packets in order",
    caption: "the internet delivers your messages in pieces, out of order. you're the computer now 🧩",
    photo: packetsPhoto,
    duo: ["#3d0c02", "#ff8a3d"],
    focus: "50% 50%",
    tags: ["internet", "streaming", "web"],
    plays: 6648,
    course: "networking",
    primer: {
      points: ["big messages get chopped into small **packets** before they travel.", "packets can take different roads and arrive out of order.", "each one has a number. tap them in order to rebuild the message."],
      course: "networking",
      chapter: "packets",
    },
  },
  {
    id: "higher-lower",
    title: "bigger audience?",
    word: "bigger?",
    tagline: "two apps. which one has more users? keep the streak alive.",
    how: "tap the bigger one",
    caption: "is telegram bigger than snapchat? is spotify bigger than pinterest? your gut is lying to you 📊",
    photo: viralPhoto,
    duo: ["#1a0633", "#c084fc"],
    focus: "50% 50%",
    exposure: 1.3,
    tags: ["marketing", "streaming"],
    plays: 15204,
    course: "marketing",
    primer: {
      points: ["you'll see two apps. tap the one with **more monthly users**.", "monthly users = people who open the app at least once a month.", "the giants are near 2–3 billion. most apps are far smaller than they feel."],
      course: "marketing",
      chapter: "going-viral",
    },
  },
  {
    id: "query-builder",
    title: "query builder",
    word: "query",
    tagline: "build the SQL that answers the question. one tile is a trap.",
    how: "tap tiles in order",
    caption: "SQL is basically lego for data. snap the blocks together and the database obeys 🧱",
    photo: selectPhoto,
    duo: ["#001a24", "#22d3ee"],
    focus: "50% 50%",
    tags: ["data", "web"],
    plays: 4870,
    course: "databases",
    primer: {
      points: ["**SQL** is how you ask a database a question.", "`SELECT` picks columns, `FROM` picks the table, `WHERE` filters the rows.", "each round has one trap tile. don't use it."],
      course: "databases",
      chapter: "sql",
    },
  },
  {
    id: "scam-or-legit",
    title: "scam or legit?",
    word: "scam?",
    tagline: "\"guaranteed 30% a month\" — swipe before your money disappears.",
    how: "swipe or use ← →",
    caption: "someone in your family has forwarded one of these. can you spot every money scam? 💸",
    photo: creditPhoto,
    duo: ["#002814", "#4ade80"],
    focus: "50% 50%",
    tags: ["money", "security"],
    plays: 9931,
    course: "money",
    primer: {
      points: ["nothing legit **guarantees** big returns. 30% a month is a scam promise.", "you never enter your upi pin to **receive** money.", "boring, regulated options like index funds, FDs and govt bonds are usually legit."],
      course: "money",
      chapter: "stocks",
    },
  },
  {
    id: "debit-or-credit",
    title: "debit or credit?",
    word: "debit?",
    tagline: "riya's stall had a busy day. which side does each entry go on?",
    how: "swipe or use ← →",
    caption: "accountants make this look like magic. it's one rule and some practice. 10 entries, how many can you place? 📒",
    photo: ledgerPhoto,
    duo: ["#1d1000", "#ffd27a"],
    focus: "50% 50%",
    tags: ["business", "money"],
    plays: 3184,
    course: "accounting",
    primer: {
      points: ["**debit** is the left side of an account, **credit** is the right. not good or bad, just sides.", "**assets** and **expenses** go up with a debit.", "**liabilities**, **equity** and **revenue** go up with a credit. remember it as DEALER."],
      course: "accounting",
      chapter: "debit-credit",
    },
  },
  {
    id: "asset-or-liability",
    title: "asset or liability?",
    word: "own / owe",
    tagline: "does the business own it, or owe it? swipe before the chai gets cold.",
    how: "swipe or use ← →",
    caption: "your phone is an asset. your phone EMI is a liability. can you sort 10 more? ☕",
    photo: kettlePhoto,
    duo: ["#1a0f00", "#ffb547"],
    focus: "60% 45%",
    tags: ["business", "money"],
    plays: 4021,
    course: "accounting",
    primer: {
      points: ["an **asset** is something the business owns or is owed: cash, equipment, stock.", "a **liability** is something it owes someone else: loans, unpaid bills, salaries due.", "quick test: will it bring money in (asset) or take money out to someone (liability)?"],
      course: "accounting",
      chapter: "assets-liabilities",
    },
  },
  {
    id: "balance-it",
    title: "balance it",
    word: "balance",
    tagline: "one number is missing from the books. find it before the auditor does.",
    how: "tap the missing number",
    caption: "assets = liabilities + equity. sounds easy until the numbers get big. 8 rounds ⚖️",
    photo: scalePhoto,
    duo: ["#150b00", "#ffcf70"],
    focus: "50% 50%",
    tags: ["business"],
    plays: 2276,
    course: "accounting",
    primer: {
      points: ["**assets = liabilities + equity**. always, for every business.", "missing equity? it's **assets − liabilities**.", "missing assets? it's **liabilities + equity**."],
      course: "accounting",
      chapter: "balance-sheet",
    },
  },
  {
    id: "myth-or-fact",
    title: "myth or fact?",
    word: "myth?",
    tagline: "\"incognito hides you from the wifi owner.\" myth or fact? swipe.",
    how: "swipe or use ← →",
    caption: "your uncle swears more wifi bars = faster internet. time to settle it 🧐",
    photo: ipPhoto,
    duo: ["#0b1633", "#8fb4ff"],
    focus: "50% 50%",
    tags: ["privacy", "internet", "home"],
    plays: 7318,
    course: "networking",
    primer: {
      points: ["half of what people \"know\" about tech is wrong. you'll see 10 claims.", "swipe **left for myth**, **right for fact**.", "every card tells you why, so even a miss teaches you something."],
      course: "networking",
      chapter: "ip-addresses",
    },
  },
  {
    id: "crack-it",
    title: "crack it?",
    word: "crack?",
    tagline: "would a hacker crack this password in seconds? swipe before they do.",
    how: "swipe or use ← →",
    caption: "P@ssw0rd! looks clever. a cracking tool guesses it in under a second 🔓",
    photo: injectPhoto,
    duo: ["#2a0612", "#ff6b8b"],
    focus: "50% 50%",
    tags: ["security", "privacy"],
    plays: 6105,
    course: "databases",
    primer: {
      points: ["crackers try common passwords, names, dates and keyboard rows **first**.", "swapping letters for symbols (`p@ssw0rd`) doesn't fool them. they try that too.", "**length wins**: 4 random words beat 8 \"clever\" characters."],
      course: "databases",
      chapter: "sql-injection",
    },
  },
  {
    id: "emoji-decode",
    title: "emoji decode",
    word: "🔥🧱",
    tagline: "🔥🧱 = firewall. can you decode 10 more before your streak breaks?",
    how: "tap the right word",
    caption: "🐴🎁 🎣📧 🐂📈. if you can read this, you speak fluent tech. drop your score 👇",
    photo: hooksPhoto,
    duo: ["#2a0a33", "#f0abfc"],
    focus: "50% 50%",
    tags: ["marketing", "security", "money", "internet"],
    plays: 11840,
    course: "marketing",
    primer: {
      points: ["each round shows a few emojis that spell out a tech or money word.", "tap the word they mean. 10 rounds.", "say it out loud if you're stuck. 🐴🎁 = a gift horse… a **trojan**."],
      course: "marketing",
      chapter: "hooks",
    },
  },
  {
    id: "lag-test",
    title: "lag test",
    word: "lag?",
    tagline: "tap the moment it turns green. is it you or your ping?",
    how: "tap when it's green",
    caption: "blaming the wifi again? your reaction time might be worse than your ping 🎮",
    photo: routerPhoto,
    duo: ["#002a1c", "#5ff0b5"],
    focus: "50% 50%",
    exposure: 1.2,
    tags: ["gaming", "streaming", "home"],
    plays: 9402,
    course: "networking",
    primer: {
      points: ["**ping** is how long data takes to reach a server and come back, in milliseconds.", "your own **reaction time** adds delay too. most people sit around 200–300 ms.", "wait for green, then tap. 5 tries. tapping early costs you."],
      course: "networking",
      chapter: "routers-switches",
    },
  },
  {
    id: "binary-blitz",
    title: "binary blitz",
    word: "0101",
    tagline: "flip the bits to make the number. 45 seconds. go.",
    how: "tap bits to flip them",
    caption: "computers only know 0 and 1. can you think like one for 45 seconds? 🤖",
    photo: osiPhoto,
    duo: ["#00221f", "#2ee6d0"],
    focus: "50% 50%",
    tags: ["internet", "home", "web"],
    plays: 4589,
    course: "networking",
    primer: {
      points: ["8 bits, worth **128 64 32 16 8 4 2 1**.", "turn bits on so they add up to the number. `00001010` = 8 + 2 = **10**.", "ip addresses are just four of these: `192` = `11000000`."],
      course: "networking",
      chapter: "ip-addresses",
    },
  },
  {
    id: "money-machine",
    title: "money time machine",
    word: "₹ → ₹₹₹",
    tagline: "₹10,000 at 12% for 20 years. what comes out? trust maths, not vibes.",
    how: "pick the right amount",
    caption: "most people guess way too low. compounding is wilder than your gut thinks 🚀",
    photo: compoundPhoto,
    duo: ["#002914", "#4ade80"],
    focus: "50% 50%",
    tags: ["money", "business"],
    plays: 5763,
    course: "money",
    primer: {
      points: ["**compound interest**: you earn interest on your interest too.", "the **rule of 72**: divide 72 by the rate to get the years it takes to double. 12% → about 6 years.", "8 rounds. pick the amount the money grows to."],
      course: "money",
      chapter: "compound-interest",
    },
  },
];

export const gameHash = (id: GameId) => `#/feed/games/${id}`;

export const isGameId = (value: string): value is GameId => GAMES.some(g => g.id === value);

export type SwipeCard = { prompt: string; side: "left" | "right"; why: string };

export const TCP_UDP_CARDS: SwipeCard[] = [
  { prompt: "facetime call with your bestie", side: "right", why: "a frozen frame beats a 3-second delay. old video frames are useless." },
  { prompt: "sending ₹5,000 to a friend", side: "left", why: "every byte must arrive. imagine losing a zero." },
  { prompt: "your valorant movement", side: "right", why: "128 updates a second. waiting for a lost one only makes it worse." },
  { prompt: "downloading a game update", side: "left", why: "one missing byte = corrupted file. tcp re-sends anything lost." },
  { prompt: "discord voice chat", side: "right", why: "a tiny glitch is fine. a delay while talking is not." },
  { prompt: "sending an email", side: "left", why: "an email with random missing words? no thanks." },
  { prompt: "a dns lookup", side: "right", why: "one tiny question, one tiny answer. no time for handshakes." },
  { prompt: "uploading your essay to drive", side: "left", why: "you want every word of it. in the right order." },
  { prompt: "zoom screen share", side: "right", why: "live beats perfect. a few lost pixels won't hurt." },
  { prompt: "ssh into a server", side: "left", why: "every keystroke must arrive, in order. `rm` vs `rm -rf` matters." },
];

export const PHISH_CARDS: SwipeCard[] = [
  { prompt: "paypa1.com/login", side: "left", why: "that's the number 1, not an L." },
  { prompt: "accounts.google.com", side: "right", why: "real google subdomain. the domain is google.com." },
  { prompt: "instagram.com.verify-account.xyz", side: "left", why: "the real domain is the last part: verify-account.xyz." },
  { prompt: "netflix-billing-update.com", side: "left", why: "netflix only uses netflix.com. extra words = red flag." },
  { prompt: "github.com/settings/security", side: "right", why: "real github. the path after / can be anything." },
  { prompt: "amaz0n-orders.net", side: "left", why: "a zero instead of an o. and .net? nope." },
  { prompt: "login.microsoftonline.com", side: "right", why: "looks weird, but it's microsoft's actual login page." },
  { prompt: "apple.com-support.help", side: "left", why: "the real domain here is com-support.help, not apple.com." },
  { prompt: "dlscord.com/nitro", side: "left", why: "read it again. that's an L, not an i." },
  { prompt: "drive.google.com/file/d/8xk2", side: "right", why: "real google drive link. still, only open files you expect." },
];

export const PORTS: { port: number; service: string }[] = [
  { port: 22, service: "ssh" },
  { port: 80, service: "http" },
  { port: 443, service: "https" },
  { port: 53, service: "dns" },
  { port: 25, service: "email (smtp)" },
  { port: 21, service: "ftp" },
  { port: 3389, service: "remote desktop" },
  { port: 3306, service: "mysql" },
  { port: 25565, service: "minecraft" },
  { port: 123, service: "time sync (ntp)" },
  { port: 67, service: "dhcp" },
  { port: 5432, service: "postgres" },
];

/** Rough monthly active users, in billions (public figures, 2024–25) */
export const AUDIENCES: { name: string; users: number; color: string }[] = [
  { name: "facebook", users: 3.0, color: "#4f8cff" },
  { name: "youtube", users: 2.5, color: "#ff4d4d" },
  { name: "whatsapp", users: 2.0, color: "#2ee6a6" },
  { name: "instagram", users: 2.0, color: "#f472d0" },
  { name: "tiktok", users: 1.6, color: "#22d3ee" },
  { name: "telegram", users: 0.95, color: "#38bdf8" },
  { name: "snapchat", users: 0.85, color: "#facc15" },
  { name: "spotify", users: 0.65, color: "#4ade80" },
  { name: "pinterest", users: 0.55, color: "#ff5470" },
  { name: "discord", users: 0.2, color: "#8b9cff" },
];

export type QueryRound = { ask: string; tiles: string[]; decoy: string };

export const QUERY_ROUNDS: QueryRound[] = [
  { ask: "show every user", tiles: ["SELECT", "*", "FROM", "users"], decoy: "DELETE" },
  { ask: "just the names of users", tiles: ["SELECT", "name", "FROM", "users"], decoy: "WHERE" },
  { ask: "users older than 18", tiles: ["SELECT", "*", "FROM", "users", "WHERE", "age > 18"], decoy: "INSERT" },
  { ask: "posts, newest first", tiles: ["SELECT", "*", "FROM", "posts", "ORDER BY", "date DESC"], decoy: "UPDATE" },
  { ask: "delete user 42", tiles: ["DELETE", "FROM", "users", "WHERE", "id = 42"], decoy: "SELECT" },
];

export const SCAM_CARDS: SwipeCard[] = [
  { prompt: "guaranteed 30% returns every month", side: "left", why: "nothing legit guarantees returns. 30% a month is a classic ponzi promise." },
  { prompt: "your upi pin is needed to RECEIVE money", side: "left", why: "you never enter your pin to receive money. only to send it." },
  { prompt: "index fund that tracks the nifty 50", side: "right", why: "boring, regulated, low-cost. boring is good with money." },
  { prompt: "\"your KYC expired, click this link\" sms", side: "left", why: "banks don't send links to fix KYC. go to the official app instead." },
  { prompt: "fixed deposit at a big bank, 7% a year", side: "right", why: "a normal, realistic rate from a regulated bank." },
  { prompt: "pay ₹2,000 fee to unlock your ₹5 lakh lottery", side: "left", why: "real prizes never ask you to pay first. you didn't even enter." },
  { prompt: "SIP of ₹500/month in a mutual fund", side: "right", why: "small, regular investing in a registered fund. totally legit." },
  { prompt: "dm from a stranger: \"i'll double your crypto\"", side: "left", why: "nobody doubles your money for free. it's gone the moment you send it." },
  { prompt: "\"work from home: like videos, earn ₹5k/day\"", side: "left", why: "task scams pay small at first, then ask you to \"invest\" to unlock more." },
  { prompt: "government bond via RBI retail direct", side: "right", why: "backed by the government. about as safe as it gets." },
];

export const DEBIT_CREDIT_CARDS: SwipeCard[] = [
  { prompt: "cash comes in from chai sales → cash account", side: "left", why: "cash is an asset. assets go up with a debit." },
  { prompt: "chai sales of the day → sales account", side: "right", why: "sales are revenue. revenue goes up with a credit." },
  { prompt: "riya borrows ₹20,000 → loan account", side: "right", why: "a loan is a liability. liabilities go up with a credit." },
  { prompt: "she buys a new kettle → equipment account", side: "left", why: "equipment is an asset. it goes up, so debit." },
  { prompt: "she pays rent → rent expense", side: "left", why: "rent is an expense. expenses go up with a debit." },
  { prompt: "she pays rent → cash account", side: "right", why: "cash goes down. an asset going down is a credit." },
  { prompt: "riya puts in her own ₹50,000 → owner's equity", side: "right", why: "equity goes up with a credit." },
  { prompt: "electricity bill arrives → electricity expense", side: "left", why: "another expense going up, so debit." },
  { prompt: "she repays part of the loan → loan account", side: "left", why: "the liability goes down. going down is the opposite side: debit." },
  { prompt: "an office will pay ₹2,000 next week → receivables", side: "left", why: "money owed to you is an asset. assets go up with a debit." },
];

export const ASSET_LIABILITY_CARDS: SwipeCard[] = [
  { prompt: "cash in the till", side: "left", why: "money the business has. classic asset." },
  { prompt: "bank loan", side: "right", why: "it has to be paid back, with interest." },
  { prompt: "delivery scooter the shop owns", side: "left", why: "equipment the business owns and uses to earn money." },
  { prompt: "unpaid electricity bill", side: "right", why: "a bill you haven't paid yet is money you owe." },
  { prompt: "money a customer owes you", side: "left", why: "called accounts receivable. it's coming to you, so it's an asset." },
  { prompt: "credit card balance", side: "right", why: "you spent the bank's money. now you owe it." },
  { prompt: "jars of tea leaves and sugar", side: "left", why: "stock (inventory) is an asset. you'll sell it as chai." },
  { prompt: "salary owed to the helper", side: "right", why: "work done but not paid for yet: a liability." },
  { prompt: "the shop building you own", side: "left", why: "property you own is an asset, even if it's not cash." },
  { prompt: "supplier invoice due next week", side: "right", why: "called accounts payable. you owe it, so it's a liability." },
];

export const PUZZLE_MESSAGES = [
  "hello from the other side",
  "lag is not my fault",
  "packets arrive out of order",
  "have you tried turning it off",
  "it was dns all along obviously",
];

export const MYTH_CARDS: SwipeCard[] = [
  { prompt: "incognito mode hides your browsing from the wifi owner", side: "left", why: "incognito only skips saving history on your device. the network still sees which sites you visit." },
  { prompt: "more wifi bars always means faster internet", side: "left", why: "bars show signal to your router, not how fast the internet behind it is." },
  { prompt: "the padlock (https) means a site is safe", side: "left", why: "it only means the connection is encrypted. scam sites use https too." },
  { prompt: "turning it off and on again really fixes things", side: "right", why: "a restart clears stuck memory and resets connections. it genuinely works." },
  { prompt: "5 ghz wifi is faster but doesn't reach as far", side: "right", why: "higher frequency carries more data but struggles through walls." },
  { prompt: "macs can't get viruses", side: "left", why: "rarer, but mac malware is real and growing every year." },
  { prompt: "deleting a post removes it from the internet", side: "left", why: "screenshots, backups and caches can keep it alive forever." },
  { prompt: "your ip address can show roughly which city you're in", side: "right", why: "ip addresses are handed out by region, so sites can guess your city." },
  { prompt: "\"the cloud\" is just someone else's computer", side: "right", why: "cloud files live on real servers in real data centres." },
  { prompt: "public wifi with a password keeps others out of your traffic", side: "left", why: "everyone with that password shares the network. https and a vpn protect you, the password doesn't." },
  { prompt: "most of the internet travels through cables under the sea", side: "right", why: "over 95% of international data goes through undersea fibre cables, not satellites." },
  { prompt: "closing apps on your phone saves battery", side: "left", why: "reopening apps from scratch often uses more power than leaving them paused." },
];

export const PASSWORD_CARDS: SwipeCard[] = [
  { prompt: "password123", side: "left", why: "it's on every list of most common passwords. cracked instantly." },
  { prompt: "Riya@2005", side: "left", why: "a name plus a birth year is the first thing attackers try." },
  { prompt: "correct-horse-battery-staple", side: "right", why: "4 random words: very long, still easy to remember." },
  { prompt: "qwertyuiop", side: "left", why: "a keyboard row. cracking tools try these in the first second." },
  { prompt: "P@ssw0rd!", side: "left", why: "swapping letters for symbols is the oldest trick. crackers try it automatically." },
  { prompt: "mango-tractor-violin-42", side: "right", why: "long, random words plus a number. would take centuries to guess." },
  { prompt: "iloveyou", side: "left", why: "one of the most leaked passwords of all time." },
  { prompt: "Xk9#mQ2$vL7!pR", side: "right", why: "14 random characters. let a password manager make and remember these." },
  { prompt: "blue sofa eats 7 cold samosas", side: "right", why: "a silly sentence is long, unique and easy to remember." },
  { prompt: "your best password, reused on 20 sites", side: "left", why: "one leak unlocks all 20. every site needs its own." },
];

/** Emoji riddles; wrong options are drawn from the other answers */
export const EMOJI_ROUNDS: { emoji: string; answer: string; why: string }[] = [
  { emoji: "🔥🧱", answer: "firewall", why: "a wall that keeps bad traffic out." },
  { emoji: "🐴🎁", answer: "trojan", why: "malware hiding inside something that looks like a gift." },
  { emoji: "🎣📧", answer: "phishing", why: "a fake message that \"fishes\" for your password." },
  { emoji: "🍪🌐", answer: "cookie", why: "a tiny file a website saves to remember you." },
  { emoji: "☁️💾", answer: "cloud storage", why: "your files, saved on someone else's servers." },
  { emoji: "🐛💻", answer: "bug", why: "a mistake in code. the first one was a real moth stuck in a computer in 1947." },
  { emoji: "🐂📈", answer: "bull market", why: "prices charging up, like a bull's horns." },
  { emoji: "🐻📉", answer: "bear market", why: "prices swiping down, like a bear's paw." },
  { emoji: "🦄🚀", answer: "unicorn startup", why: "a young company worth over $1 billion. rare, like unicorns." },
  { emoji: "🐳🪙", answer: "crypto whale", why: "someone holding so much of a coin they can move its price." },
  { emoji: "🕷️🕸️", answer: "web crawler", why: "a bot that visits pages so search engines can find them." },
  { emoji: "🧅🌐", answer: "tor (onion routing)", why: "your traffic is wrapped in layers, like an onion." },
  { emoji: "🍝💻", answer: "spaghetti code", why: "code so tangled nobody can follow it." },
  { emoji: "🔑🔒📨", answer: "encryption", why: "scrambling a message so only the key holder can read it." },
  { emoji: "📣🎯", answer: "targeted ads", why: "ads aimed at exactly the people most likely to click." },
  { emoji: "🧲👀", answer: "clickbait", why: "a headline built to pull your click, not to inform." },
];

/** Bit values, left to right */
export const BITS = [128, 64, 32, 16, 8, 4, 2, 1];
export const toBinary = (n: number) => n.toString(2).padStart(8, "0");
