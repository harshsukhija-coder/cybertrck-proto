import type { InterestId } from "./prefs";

export type Poll = {
  id: string;
  courseId: string;
  q: string;
  options: string[];
  answer: number;
  /** Fake vote split in %, shown after you vote */
  votes: number[];
  why: string;
  tags: InterestId[];
};

export type Fact = {
  id: string;
  courseId: string;
  big: string;
  line: string;
  sub: string;
  duo: [string, string];
  tags: InterestId[];
};

export const POLLS: Poll[] = [
  {
    id: "poll-password",
    courseId: "networking",
    q: "what's the most used password in the world?",
    options: ["password", "123456", "qwerty", "iloveyou"],
    answer: 1,
    votes: [31, 42, 19, 8],
    why: "123456 tops leaked-password lists almost every year. it gets cracked in under a second.",
    tags: ["security", "privacy"],
  },
  {
    id: "poll-double",
    courseId: "money",
    q: "₹1 lakh grows at 12% a year. when does it double?",
    options: ["~3 years", "~6 years", "~12 years", "~20 years"],
    answer: 1,
    votes: [18, 37, 33, 12],
    why: "rule of 72: 72 ÷ 12 = 6 years. then it doubles again in the next 6.",
    tags: ["money"],
  },
  {
    id: "poll-popcorn",
    courseId: "marketing",
    q: "why is medium popcorn priced just ₹20 less than large?",
    options: ["it's a mistake", "to push you to buy large", "medium costs more to make", "tax reasons"],
    answer: 1,
    votes: [9, 71, 12, 8],
    why: "the medium is a decoy. next to it, the large feels like a steal. it works on almost everyone.",
    tags: ["marketing", "money"],
  },
  {
    id: "poll-sql",
    courseId: "databases",
    q: "what does SQL stand for?",
    options: ["super quick language", "structured query language", "system queue logic", "simple question list"],
    answer: 1,
    votes: [14, 68, 10, 8],
    why: "structured query language. a way to ask a database questions in almost-english.",
    tags: ["data"],
  },
  {
    id: "poll-cables",
    courseId: "networking",
    q: "how much intercontinental internet traffic goes through undersea cables?",
    options: ["~20%", "~50%", "~75%", "99%+"],
    answer: 3,
    votes: [22, 30, 27, 21],
    why: "satellites carry a tiny slice. almost everything runs through ~500 cables on the ocean floor.",
    tags: ["internet"],
  },
  {
    id: "poll-minimum",
    courseId: "money",
    q: "you only pay the minimum on your credit card. what happens?",
    options: ["debt clears slowly but cheaply", "36%+ yearly interest piles up", "the bank forgives the rest", "your score goes up"],
    answer: 1,
    votes: [41, 38, 6, 15],
    why: "card interest is brutal. paying the minimum keeps you in debt for years.",
    tags: ["money"],
  },
  {
    id: "poll-viral",
    courseId: "marketing",
    q: "what helps a post spread the fastest?",
    options: ["likes", "shares", "30 hashtags", "posting at midnight"],
    answer: 1,
    votes: [35, 49, 9, 7],
    why: "each share shows the post to a brand new crowd. likes mostly stay with existing followers.",
    tags: ["marketing", "streaming"],
  },
  {
    id: "poll-attack",
    courseId: "databases",
    q: "which one of these is a real hacking attack?",
    options: ["sql injection", "css explosion", "html overflow", "pixel poisoning"],
    answer: 0,
    votes: [58, 14, 16, 12],
    why: "sql injection sneaks database commands into input boxes. still one of the most common attacks.",
    tags: ["data", "security"],
  },
];

export const FACTS: Fact[] = [
  {
    id: "fact-email",
    courseId: "networking",
    big: "1971",
    line: "the first email was sent.",
    sub: "ray tomlinson sent it between two computers sitting side by side. he doesn't remember what it said.",
    duo: ["#06203a", "#4cc9f0"],
    tags: ["internet", "web"],
  },
  {
    id: "fact-moth",
    courseId: "networking",
    big: "1947",
    line: "the first computer \"bug\" was a real moth.",
    sub: "it got stuck in a harvard computer. the team taped it into their logbook. it's in a museum now.",
    duo: ["#1a1446", "#b49bff"],
    tags: ["internet"],
  },
  {
    id: "fact-72",
    courseId: "money",
    big: "72",
    line: "the magic number for doubling money.",
    sub: "divide 72 by your yearly return. that's how many years until your money doubles.",
    duo: ["#062418", "#7af0c3"],
    tags: ["money"],
  },
  {
    id: "fact-swoosh",
    courseId: "marketing",
    big: "$35",
    line: "what nike paid for the swoosh.",
    sub: "a design student drew it in 1971. today it's one of the most valuable logos on earth.",
    duo: ["#33000d", "#ff3d5a"],
    tags: ["marketing"],
  },
  {
    id: "fact-cables",
    courseId: "networking",
    big: "99%",
    line: "of internet traffic between continents runs under the sea.",
    sub: "through cables about as thick as a garden hose. sharks have been caught biting them.",
    duo: ["#04152b", "#58a6ff"],
    tags: ["internet", "streaming"],
  },
  {
    id: "fact-upi",
    courseId: "money",
    big: "10B+",
    line: "UPI payments happen in india every month.",
    sub: "your ₹10 chai payment is one of them. each one hits a database in about a second.",
    duo: ["#1f1a00", "#f5d90a"],
    tags: ["money", "data"],
  },
  {
    id: "fact-ding",
    courseId: "marketing",
    big: "ding",
    line: "notification sounds are designed to feel like a reward.",
    sub: "apps test them on purpose. that tiny hit of excitement is why you check your phone ~100 times a day.",
    duo: ["#2b0631", "#f472d0"],
    tags: ["marketing", "privacy"],
  },
  {
    id: "fact-codd",
    courseId: "databases",
    big: "1970",
    line: "the idea behind almost every database was published.",
    sub: "edgar codd's paper on tables and relations still shapes every app on your phone.",
    duo: ["#001a24", "#22d3ee"],
    tags: ["data"],
  },
];
