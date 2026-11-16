import knockKnockMeme from "../../../assets/memes/knock-knock.gif";
import mathLadyMeme from "../../../assets/memes/math-lady.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · firewalls · chapter 02" },
    { from: "system", text: "ports: numbered doors. packets: little résumés the firewall reads." },
  ],
  [
    { from: "ramesh", text: "to understand how a firewall decides, you need one quick concept: {cyan:ports}." },
    { from: "friday", text: "like… boat ports?" },
    { from: "ramesh", text: "numbered doors into a device. a machine can run many services at once. each service is reached through a port number." },
    { from: "friday", image: knockKnockMeme, caption: "friday knocking on every door" },
  ],
  [
    { from: "ramesh", text: "different services use well-known ports." },
    { from: "system", text: "the door chart.", visual: "firewall-ports" },
    { from: "ramesh", text: "web usually on {green:80} or {green:443}. email often {yellow:25}. remote access (ssh) on {cyan:22}." },
    { from: "ramesh", text: "the port number is a huge clue about what kind of traffic you're looking at." },
  ],
  [
    { from: "ramesh", text: "every packet carries useful information the firewall can read." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "packet résumé",
        text: "• where it's going ({cyan:address})\n• which door ({yellow:port})\n• how it talks ({pink:protocol} — tcp / udp)",
      },
    },
    { from: "friday", image: mathLadyMeme, caption: "friday processing three fields at once" },
    { from: "ramesh", text: "that's exactly what a basic firewall looks at to decide allow or deny." },
  ],
  [
    { from: "ramesh", text: "example: allow traffic to port {green:443} so people can reach a website. block port {red:23} — old telnet remote access, considered insecure." },
    { from: "friday", text: "same device. different doors. different decisions." },
    { from: "ramesh", text: "and that leads to a key principle: every open door is a potential way in." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "least open surface",
        text: "a good firewall keeps closed every port that isn't needed — leaving open only the few that are.",
      },
    },
  ],
  [
    { from: "friday", text: "so the rules are… written around these doors?" },
    { from: "ramesh", text: "yes. next chapter we look at how the rule list is actually read — because order matters more than people think." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "ports are doors. next: the guest list itself — rule order, first match wins, and the legendary final line: {pink:deny all}.",
      },
    },
    { from: "system", text: "chapter 2 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "ports are best thought of as...",
    options: ["boat harbors only", "numbered doors into a device's services", "wifi passwords", "cpu cores"],
    answer: 1,
    explanation: "each service listens on a port.",
  },
  {
    question: "https web traffic commonly uses port...",
    options: ["23", "443", "3389 only", "7"],
    answer: 1,
    explanation: "443 is the usual https door.",
  },
  {
    question: "ssh remote access commonly uses port...",
    options: ["22", "80", "25", "53"],
    answer: 0,
    explanation: "22 = ssh.",
  },
  {
    question: "a firewall deciding on a packet looks at things like...",
    options: ["only the wallpaper", "address, port, and protocol", "battery percent", "font size"],
    answer: 1,
    explanation: "classic packet filter fields.",
  },
  {
    question: "why block port 23 in the example?",
    options: ["it's the https port", "telnet is an old insecure remote service", "it's required for email", "ports can't be blocked"],
    answer: 1,
    explanation: "telnet is legacy and unsafe compared to ssh.",
  },
  {
    question: "security principle from this chapter...",
    options: ["open every port for convenience", "close every unused port; open only what's needed", "never use https", "firewalls ignore ports"],
    answer: 1,
    explanation: "every open door is a potential way in.",
  },
];

const notes = `
> offtrck · firewalls module · study notes
> chapter 02 · ports & packets

## ports
numbered **doors** into a device. many services can run at once; each is reached via a port.

## common examples
| port | usual service |
|---|---|
| 80 / 443 | web (http / https) |
| 25 | email |
| 22 | remote access (ssh) |
| 23 | telnet (insecure — usually block) |

## what a packet carries
- destination **address**
- destination **port**
- **protocol** (tcp / udp, …)

a firewall uses these fields to decide allow vs deny.

## principle
every open door is a potential way in → close unused ports; open only what you need.

## what's next
how rule lists are evaluated: order, first match, deny-all.
`;

export const firewallChapterTwo: Chapter = {
  title: "chapter 02",
  subtitle: "ports & packets",
  scenes,
  quiz,
  notes,
};
