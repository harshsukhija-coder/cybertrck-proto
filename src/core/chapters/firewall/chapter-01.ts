import shallNotPassMeme from "../../../assets/memes/shall-not-pass.gif";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import fridayAvatar from "../../../assets/characters/friday.jpg";
import rameshAvatar from "../../../assets/characters/ramesh.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · firewalls · chapter 01" },
    { from: "system", text: "today: what stands at the border and decides what gets in — and what gets blocked." },
  ],
  [
    {
      from: "system",
      text: "[profile] friday · junior developer. he can scan ports with nmap. he still thinks 'the router handles security'.",
      image: fridayAvatar,
      caption: "friday · the learner",
    },
    { from: "friday", text: "ramesh… every device on the internet is constantly receiving traffic, right?" },
    {
      from: "system",
      text: "[profile] ramesh · ethical hacker. he will make friday respect the security guard at the door.",
      image: rameshAvatar,
      caption: "ramesh · the expert",
    },
    { from: "ramesh", text: "yes. some of it is legitimate — websites and services you asked for. some of it isn't." },
  ],
  [
    { from: "ramesh", text: "hidden in that traffic: scans of your network, attempts to reach services you never meant to expose, or something malicious slipping in." },
    { from: "friday", image: thisIsFineMeme, caption: "friday realizing his laptop is a tourist attraction" },
    { from: "ramesh", text: "so something needs to stand at the {pink:border} and decide what gets in and what gets blocked." },
    { from: "ramesh", text: "that something is a {green:firewall}." },
    { from: "friday", image: shallNotPassMeme, caption: "the firewall energy we want" },
  ],
  [
    { from: "ramesh", text: "at its core, a firewall is a barrier between two networks — usually your {cyan:private network} and the {purple:internet}." },
    { from: "ramesh", text: "its job: control the traffic that flows between them." },
    { from: "system", text: "the border.", visual: "firewall-border" },
  ],
  [
    { from: "ramesh", text: "every packet that tries to cross is checked against a set of {yellow:rules}." },
    { from: "ramesh", text: "matches an allow rule → let through. matches a block rule — or matches nothing allowed → stopped." },
    { from: "friday", text: "like a security guard with a guest list?" },
    { from: "ramesh", text: "exactly. on the list, you come in. not on the list, turned away. except the firewall does this thousands of times per second." },
  ],
  [
    { from: "ramesh", text: "and it doesn't only watch traffic {cyan:coming in}." },
    { from: "ramesh", text: "it can also control traffic {orange:going out} — which helps stop a device inside from calling home somewhere it shouldn't. useful if something's already infected." },
    { from: "friday", text: "hardware thing, or software?" },
    { from: "ramesh", text: "both. a dedicated box can protect a whole network. software on one computer protects that device. often you use {green:both} together." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "friday knows there's a guard. next: the {cyan:numbered doors} the guard actually looks at — ports — and what info every packet carries.",
      },
    },
    { from: "system", text: "chapter 1 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "a firewall mainly sits between...",
    options: ["your keyboard and mouse", "two networks (often private + internet)", "two memes", "cpu and ram only"],
    answer: 1,
    explanation: "classic placement: private network ↔ internet.",
  },
  {
    question: "packets crossing a firewall are checked against...",
    options: ["a set of rules", "friday's mood", "random dice", "only the weather"],
    answer: 0,
    explanation: "allow / deny rules decide fate.",
  },
  {
    question: "if traffic matches nothing allowed, a good firewall usually...",
    options: ["lets it through for fun", "stops / blocks it", "prints it", "emails bob"],
    answer: 1,
    explanation: "no match to allow → stopped.",
  },
  {
    question: "firewalls can control...",
    options: ["only inbound traffic", "inbound and outbound traffic", "only wifi passwords", "only printer jobs"],
    answer: 1,
    explanation: "outbound control matters for infected hosts calling home.",
  },
  {
    question: "hardware vs software firewalls...",
    options: ["you must pick exactly one forever", "often both are used together", "software can't exist", "hardware only works on phones"],
    answer: 1,
    explanation: "network appliance + host firewall is common.",
  },
  {
    question: "the security-guard metaphor means...",
    options: ["anyone gets in", "guest-list style allow / deny for traffic", "the firewall makes coffee", "ports don't matter"],
    answer: 1,
    explanation: "on the list → in; not on the list → turned away.",
  },
];

const notes = `
> offtrck · firewalls module · study notes
> chapter 01 · the border guard

## problem
every internet-connected device receives constant traffic. some is wanted. some is scanning, probing, or malicious.

## what a firewall is
a **barrier** between networks (usually private ↔ internet) that decides what traffic may cross.

## how it decides
each packet is checked against **rules**:
- allow match → through
- block / no allow → stopped

like a security guard with a guest list — thousands of times per second.

## direction
not only inbound. **outbound** control can stop infected devices from connecting where they shouldn't.

## form factors
- **hardware**: protects a whole network
- **software**: protects one device
- often used **together**

## what's next
ports — the numbered doors — and the packet fields firewalls actually inspect.
`;

export const firewallChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "the border guard",
  scenes,
  quiz,
  notes,
};
