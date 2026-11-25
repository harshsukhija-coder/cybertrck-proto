import type { buildSimulator, PtNetwork } from "./pt-network";

export type AnimId =
  | "packet-trip"
  | "layer-stack"
  | "tcp-handshake"
  | "binary-octet"
  | "subnet-calc"
  | "mac-learning"
  | "arp"
  | "vlan-split"
  | "routing-hops"
  | "dhcp-dora"
  | "dns-lookup"
  | "acl-filter";

/** Text supports **bold** and `code` */
export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "callout"; tone: "tip" | "warn" | "fact"; text: string }
  | { kind: "cli"; prompt?: string; lines: string[]; note?: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "anim"; id: AnimId; caption: string }
  | { kind: "check"; q: string; options: string[]; answer: number; why: string };

export type QuizQuestion = { q: string; options: string[]; answer: number; why: string };

export type Article = {
  kind: "article";
  id: string;
  title: string;
  minutes: number;
  summary: string;
  blocks: Block[];
};

export type Quiz = { kind: "quiz"; id: string; title: string; questions: QuizQuestion[] };

export type Simulator = ReturnType<typeof buildSimulator>;
export type LabContext = { net: PtNetwork; sim: Simulator };
/** true = passed, a string = what went wrong (shown to the student) */
export type LabCheck = { label: string; points: number; hint: string; run: (ctx: LabContext) => true | string };

export type TopoNode = { id: string; kind: "pc" | "router" | "switch" | "server"; label: string; sub?: string; x: number; y: number };
export type Topology = {
  height: number;
  nodes: TopoNode[];
  links: { a: string; b: string; label?: string; color?: string }[];
  zones?: { x: number; y: number; w: number; h: number; label: string; color: string }[];
};

export type Lab = {
  kind: "lab";
  id: string;
  title: string;
  minutes: number;
  level: "easy" | "medium" | "hard";
  story: string;
  goals: string[];
  topology: Topology;
  addressing: { head: string[]; rows: string[][] };
  steps: { title: string; text: string; cli?: { prompt: string; lines: string[] } }[];
  checks: LabCheck[];
};

export type Lesson = Article | Quiz | Lab;

export type Module = {
  id: string;
  number: number;
  title: string;
  tagline: string;
  color: string;
  lessons: Lesson[];
};

export const KIND_LABEL = { article: "blog", quiz: "quiz", lab: "practical" } as const;

export const QUIZ_PASS = 70;
export const LAB_PASS = 80;
export const EXAM_PASS = 75;
