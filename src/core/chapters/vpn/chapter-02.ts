import vpnTunnelImg from "../../../assets/vpn/vpn-tunnel.jpg";
import mindBlownMeme from "../../../assets/memes/mind-blown.gif";
import shhMeme from "../../../assets/memes/shh.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · vpn · chapter 02" },
    { from: "system", text: "virtual private network — the sealed pipe." },
  ],
  [
    { from: "friday", text: "so... vpn stands for?" },
    { from: "ramesh", text: "{green:virtual private network}. the idea: route your traffic through a secure server — a {cyan:vpn server} — and protect it along the way." },
    { from: "friday", text: "virtual private... so it's not a physical cable?" },
    { from: "ramesh", text: "correct. same public networks. private {pink:behavior}. encryption makes the difference." },
  ],
  [
    { from: "ramesh", text: "when you turn a vpn on, your device creates an {green:encrypted tunnel} to that vpn server." },
    { from: "ramesh", text: "everything you send goes into the tunnel first. anyone watching from outside sees only {yellow:scrambled} data." },
    {
      from: "system",
      text: "same rainy route. different pipe.",
      image: vpnTunnelImg,
      caption: "encrypted tunnel · sealed along the path",
      illustration: true,
    },
    { from: "friday", image: mindBlownMeme, caption: "friday realizing the path stays public but the contents don't" },
  ],
  [
    { from: "ramesh", text: "key point — and people get this wrong." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "what the isp still sees",
        text: "the network and your isp can still see that you're {cyan:connected to a vpn} and that data is flowing.\n\nthey {red:cannot} see what's inside — which sites, or what you send and receive.",
      },
    },
    { from: "friday", image: shhMeme, caption: "isp: 'he's on a vpn.' isp: '...' " },
    { from: "friday", text: "so they know i'm hiding something?" },
    { from: "ramesh", text: "they know you're using a tunnel. they don't get the diary inside." },
  ],
  [
    { from: "ramesh", text: "metaphor time. normally your traffic travels through a {cyan:clear glass tube}. anyone alongside can look in." },
    { from: "ramesh", text: "a vpn replaces that with a {green:sealed opaque pipe}. same route. no peeking." },
    { from: "system", text: "glass vs pipe.", visual: "glass-vs-pipe" },
  ],
  [
    { from: "ramesh", text: "at the vpn server, traffic exits and continues to the real destination." },
    { from: "ramesh", text: "from the website's point of view, the traffic now appears to come from the {pink:vpn server} — not from you." },
    { from: "friday", text: "wait. so the website thinks i'm the vpn?" },
    { from: "ramesh", text: "it thinks the client ip is the vpn's. we'll walk the packets step by step next — including that ip swap." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "the pipe is sealed. but {pink:where} does the seal open? and who gets to read the letter after that? next: the full hop-by-hop journey.",
      },
    },
    { from: "system", text: "chapter 2 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "vpn stands for...",
    options: ["very private notebook", "virtual private network", "visual packet node", "volatile public net"],
    answer: 1,
    explanation: "Virtual Private Network.",
  },
  {
    question: "when a vpn is on, traffic first goes into...",
    options: ["a clear postcard", "an encrypted tunnel to a vpn server", "your neighbor's fridge", "dns forever"],
    answer: 1,
    explanation: "device → encrypted tunnel → vpn server.",
  },
  {
    question: "observers outside the tunnel see...",
    options: ["your passwords in plain text", "scrambled data", "your screen", "nothing ever"],
    answer: 1,
    explanation: "encrypted = scrambled from the outside.",
  },
  {
    question: "your isp with a vpn on can typically still see...",
    options: ["every website url you open", "that you're connected to a vpn and data is flowing", "your email drafts", "nothing at all including that a vpn exists"],
    answer: 1,
    explanation: "they see the tunnel, not the contents.",
  },
  {
    question: "the clear glass tube metaphor means...",
    options: ["traffic is invisible", "anyone alongside can look into normal traffic", "glass is illegal", "vpns are made of glass"],
    answer: 1,
    explanation: "normal path is inspectable; vpn makes it opaque.",
  },
  {
    question: "after the vpn server, websites often see traffic as coming from...",
    options: ["your home ip", "the vpn server's ip", "a random toaster", "no ip at all"],
    answer: 1,
    explanation: "exit IP is the vpn's, not yours.",
  },
];

const notes = `
> offtrck · vpn module · study notes
> chapter 02 · the sealed pipe

## definition
**VPN** = virtual private network.
route traffic through a **vpn server** and protect it along the way.

## the tunnel
1. turn vpn on
2. device builds an **encrypted tunnel** to the vpn server
3. everything you send enters the tunnel first
4. outsiders see **scrambled** data

## what isp / cafe still see
- that you are connected to a vpn
- that data is flowing
- **not** which websites or what you send/receive

## metaphor
| without vpn | with vpn |
|---|---|
| clear glass tube | sealed opaque pipe |
| peeking possible | contents hidden |

## exit
at the vpn server, traffic exits and continues to the real site.
websites see the **vpn's IP**, not yours.

## what's next
encrypt → travel → decrypt → forward — hop by hop.
`;

export const vpnChapterTwo: Chapter = {
  title: "chapter 02",
  subtitle: "the sealed pipe",
  scenes,
  quiz,
  notes,
};
