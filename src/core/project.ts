import type { ComponentType, SVGProps } from "react";

/** one line that can “type” into a live terminal */
export type LiveLine = {
  prompt?: string;
  command?: string;
  output?: string;
  /** ms before this line starts after previous (default 380) */
  pause?: number;
  tone?: "ok" | "warn" | "err" | "info" | "dim";
};

export type LiveTerm = {
  /** character name on the terminal chrome */
  title: string;
  host: string;
  side: "target" | "attacker" | "bot";
  lines: LiveLine[];
};

export type ComicStrip =
  | {
      type: "narrator";
      text: string;
    }
  | {
      type: "bubble";
      who: "narrator" | "target" | "attacker" | "bot" | "script";
      text: string;
    }
  | {
      type: "decode";
      /** plain-English translation of what just happened */
      text: string;
    }
  | {
      type: "tool";
      /** short tool name people will see in the terminal */
      name: string;
      /** who is holding this tool right now */
      who: "target" | "attacker" | "bot" | "script";
      /** what it does, in everyday words */
      does: string;
      /** why this character bothers using it */
      why: string;
    }
  | {
      type: "run";
      setup?: string;
      term: LiveTerm;
      /** plain language under the terminal */
      decode?: string;
    }
  | {
      type: "duel";
      setup?: string;
      target: LiveTerm;
      attacker: LiveTerm;
      /** animated packets between the two sides (shown after terminals start) */
      wire?: {
        from: "target" | "attacker" | "bot";
        to: "target" | "attacker" | "bot";
        packets: { label: string; kind?: "knock" | "answer" | "roast" | "block" | "data" }[];
      };
      decode?: string;
      twist?: string;
    }
  | {
      type: "wire";
      /** standalone packet highway animation */
      from: "target" | "attacker" | "bot";
      to: "target" | "attacker" | "bot";
      packets: { label: string; kind?: "knock" | "answer" | "roast" | "block" | "data" }[];
      note?: string;
    }
  | {
      type: "meme";
      src: string;
      caption: string;
    }
  | {
      type: "boom";
      title: string;
      text: string;
    }
  | {
      type: "fix";
      title: string;
      text: string;
    }
  | {
      type: "codebit";
      title: string;
      code: string;
      decode: string;
    }
  | {
      type: "goals";
      rows: {
        who: "narrator" | "target" | "attacker" | "bot" | "script";
        goal: string;
        plan: string;
      }[];
    }
  | {
      type: "links";
      title: string;
      items: { label: string; href: string; note: string }[];
    }
  | {
      type: "path";
      /** journey of one packet through the OS */
      title: string;
      steps: { name: string; detail: string }[];
    }
  | {
      type: "playground";
      /** interactive packet lab */
      title: string;
      hint: string;
    };

export type ProjectPage =
  | {
      kind: "cover";
      kicker: string;
      title: string;
      tagline: string;
      meme?: string;
      memeCaption?: string;
    }
  | {
      kind: "comic";
      /** short chapter label, e.g. "meet Target" */
      act: string;
      headline: string;
      strips: ComicStrip[];
    }
  | {
      kind: "choice";
      act: string;
      prompt: string;
      options: string[];
      answer: number;
      roastWrong: string;
      explain: string;
      twist?: string;
      meme?: string;
      memeCaption?: string;
    }
  | {
      kind: "loot";
      title: string;
      outro: string;
      bullets: string[];
      commandsFile: { name: string; text: string };
      scriptFile: { name: string; text: string };
      meme?: string;
      memeCaption?: string;
    };

export type Project = {
  id: string;
  title: string;
  badge: string;
  blurb: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  pages: ProjectPage[];
};

/** @deprecated alias while migrating */
export type ProjectSlide = ProjectPage;
