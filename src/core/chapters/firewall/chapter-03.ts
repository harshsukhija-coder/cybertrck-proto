import easyButtonMeme from "../../../assets/memes/easy-button.gif";
import shutItDownMeme from "../../../assets/memes/shut-it-down.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · firewalls · chapter 03" },
    { from: "system", text: "rules: how they're written is what makes a firewall work." },
  ],
  [
    { from: "ramesh", text: "a firewall holds a list of rules. it reads them {yellow:in order} — top to bottom." },
    { from: "friday", text: "like a checklist?" },
    { from: "ramesh", text: "when a packet arrives, compare against each rule one by one. as soon as one matches, do what it says — allow or block — and {pink:stop checking}." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "first match wins",
        text: "order matters. a broad allow above a careful deny can quietly ruin your day.",
      },
    },
  ],
  [
    { from: "ramesh", text: "a typical rule is built from a few pieces." },
    { from: "ramesh", text: "where traffic is coming from · where it's going · which port · and what to do: {green:allow} or {red:deny}." },
    { from: "system", text: "sample policy.", visual: "firewall-rules" },
    { from: "friday", image: easyButtonMeme, caption: "friday wanting an 'allow everything' button" },
    { from: "ramesh", text: "resist that button." },
  ],
  [
    { from: "friday", text: "what if a packet matches {red:no} rule?" },
    { from: "ramesh", text: "this is the most important part." },
    { from: "ramesh", text: "a well-configured firewall ends with a final rule: {pink:deny all}." },
    { from: "friday", image: shutItDownMeme, caption: "deny all energy" },
    { from: "ramesh", text: "anything that wasn't explicitly allowed is automatically blocked." },
  ],
  [
    { from: "ramesh", text: "core security principle: don't try to list every bad thing — that's impossible." },
    { from: "ramesh", text: "instead, {red:block everything by default}, and only open exactly what you need." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "default deny",
        text: "safer to start closed and allow a few things than to start open and try to catch every threat.",
      },
    },
    { from: "friday", text: "so 'deny all' is the last line on purpose." },
    { from: "ramesh", text: "yes. next: not all firewalls are equally smart — packet filters, stateful firewalls, and next-gen." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "rules are ordered. first match wins. deny-all closes the list. next chapter: firewalls that remember conversations — and ones that peek inside the traffic.",
      },
    },
    { from: "system", text: "chapter 3 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "firewall rules are evaluated...",
    options: ["randomly", "top to bottom, in order", "only on tuesdays", "bottom to top always"],
    answer: 1,
    explanation: "sequential; first match wins.",
  },
  {
    question: "when a rule matches, the firewall...",
    options: ["keeps checking every other rule forever", "applies allow/deny and stops", "reboots", "ignores it"],
    answer: 1,
    explanation: "first match ends the search.",
  },
  {
    question: "a typical rule includes...",
    options: ["source/dest, port, and allow/deny", "only the company logo", "favorite color", "cpu temperature"],
    answer: 0,
    explanation: "who ↔ who, which port, action.",
  },
  {
    question: "the final rule on a well-configured firewall is often...",
    options: ["allow all", "deny all", "ask friday", "print banner"],
    answer: 1,
    explanation: "default deny closes the policy.",
  },
  {
    question: "default deny means...",
    options: ["block everything by default; open only what's needed", "allow everything then blacklist forever", "never use ports", "disable the firewall"],
    answer: 0,
    explanation: "start closed; explicit allows only.",
  },
  {
    question: "why is listing every bad thing a bad strategy?",
    options: ["it's impossible to enumerate all threats", "bad things don't exist", "rules can't deny", "ports are illegal"],
    answer: 0,
    explanation: "allowlist what you need instead.",
  },
];

const notes = `
> offtrck · firewalls module · study notes
> chapter 03 · rules & deny-all

## evaluation
rules are read **top → bottom**.
**first match wins** — then stop checking.

## rule pieces
- source (where from)
- destination (where to)
- port / service
- action: allow or deny

## if nothing matches
end with **deny all**.
anything not explicitly allowed is blocked.

## principle
don't try to list every evil.
**default deny** + open only what you need.
safer than start-open + endless blacklists.

## watch the order
a broad allow above a careful deny can bypass your intent.

## what's next
packet filter vs stateful vs next-generation firewalls.
`;

export const firewallChapterThree: Chapter = {
  title: "chapter 03",
  subtitle: "rules & deny-all",
  scenes,
  quiz,
  notes,
};
