import hideThePainMeme from "../../../assets/memes/hide-the-pain.gif";
import surprisedPikachuMeme from "../../../assets/memes/surprised-pikachu.gif";
import csiSunglassesMeme from "../../../assets/memes/csi-sunglasses.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · firewalls · chapter 05" },
    { from: "system", text: "essential — but not a complete solution. then the honest recap." },
  ],
  [
    { from: "ramesh", text: "a firewall is one layer of defense, not the whole castle." },
    { from: "system", text: "blind spots.", visual: "firewall-limits" },
    { from: "friday", text: "hit me." },
  ],
  [
    { from: "ramesh", text: "first — it can't stop a user from being {red:tricked}." },
    { from: "ramesh", text: "convincing message, fake site, someone types their password willingly. the firewall sees normal allowed traffic. the attack went through the person, not an open port." },
    { from: "friday", image: hideThePainMeme, caption: "friday after clicking 'reset payroll password'" },
  ],
  [
    { from: "ramesh", text: "second — {yellow:encrypted} traffic is a challenge. encryption is good for privacy… but without extra setup a firewall often can't see inside. attackers can hide in that encryption." },
    { from: "ramesh", text: "third — a firewall mostly guards the {cyan:border}. a threat already inside — infected device or malicious insider — can act on the network without ever crossing it." },
    { from: "friday", image: surprisedPikachuMeme, caption: "when the threat was already on the lan" },
  ],
  [
    { from: "ramesh", text: "fourth — a firewall is only as good as its {pink:rules}." },
    { from: "ramesh", text: "one careless open port can quietly undo much of its protection. many real breaches come down to simple misconfiguration." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "false sense of security",
        text: "a poorly configured firewall can feel like armor while leaving the gate wide open. review rules. close unused ports. keep it updated.",
      },
    },
  ],
  [
    { from: "ramesh", text: "so a firewall works best as part of a {green:layered defense} — strong authentication, up-to-date software, informed users." },
    { from: "ramesh", text: "no single tool protects everything. the firewall is one strong layer among several." },
  ],
  [
    { from: "ramesh", text: "recap." },
    { from: "system", text: "put it together.", visual: "firewall-recap" },
    { from: "ramesh", text: "a firewall is a barrier that inspects traffic and allows or blocks based on rules — using addresses, ports, and (on smarter boxes) content." },
    { from: "ramesh", text: "safest approach: block everything by default, then allow only what's needed. packet filter → stateful → next-gen. but it's still one layer — not the whole thing." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "practical takeaway",
        text: "configure carefully. review rules. close unused ports. keep firmware updated.\na firewall protects the {cyan:border} — you still need brains for the {pink:clicks}.",
      },
    },
    { from: "friday", image: csiSunglassesMeme, caption: "friday · default deny · brain online" },
    { from: "friday", text: "guest list at the door. deny all at the bottom. don't get phished." },
    { from: "ramesh", text: "good. knowledge is powerful — using it responsibly is what matters." },
    { from: "system", text: "firewalls module complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "a firewall alone can stop phishing where the user willingly logs into a fake site?",
    options: ["yes, always", "no — it often looks like normal allowed traffic", "only on tuesdays", "only if the site is pink"],
    answer: 1,
    explanation: "social engineering bypasses the border.",
  },
  {
    question: "encrypted traffic is hard for firewalls because...",
    options: ["encryption is illegal", "without extra setup they often can't inspect insides", "ports disappear", "rules can't exist"],
    answer: 1,
    explanation: "privacy vs visibility tradeoff.",
  },
  {
    question: "threats already inside the network...",
    options: ["must always cross the border firewall", "can often act without crossing the firewall", "are impossible", "only affect printers"],
    answer: 1,
    explanation: "border device ≠ full internal visibility.",
  },
  {
    question: "many real breaches involving firewalls come down to...",
    options: ["perfect configs", "simple misconfiguration / careless open ports", "too much deny-all", "using https"],
    answer: 1,
    explanation: "rules quality matters as much as having a box.",
  },
  {
    question: "firewalls work best as...",
    options: ["the only security control ever", "one layer alongside auth, updates, and informed users", "a replacement for passwords", "a meme filter"],
    answer: 1,
    explanation: "defense in depth.",
  },
  {
    question: "the safest default policy style is...",
    options: ["allow all then chase threats", "deny all by default; allow only what's needed", "open every port", "no rules at all"],
    answer: 1,
    explanation: "default deny + explicit allows.",
  },
];

const notes = `
> offtrck · firewalls module · study notes
> chapter 05 · limits, layers, recap

## what firewalls can't fix alone
1. **tricked users** — phishing looks like allowed traffic
2. **encrypted payloads** — hard to inspect without extra setup
3. **already inside** — infected host / insider may never cross the border
4. **bad rules** — one open port undoes a lot; misconfig is common

## layered defense
pair firewalls with:
- strong authentication
- up-to-date software
- informed users

## full recap
- barrier between networks · allow/deny by rules
- uses addresses, ports, protocols (+ content on NGFW)
- **default deny**, open only what you need
- packet filter → stateful → next-gen
- one strong layer — not the whole shield
- review rules, close unused ports, keep updated

## practical
a poorly configured firewall = false sense of security.
configure carefully. think before you click.
`;

export const firewallChapterFive: Chapter = {
  title: "chapter 05",
  subtitle: "limits & layers",
  scenes,
  quiz,
  notes,
};
