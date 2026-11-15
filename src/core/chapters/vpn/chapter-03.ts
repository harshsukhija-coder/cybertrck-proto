import epicHandshakeMeme from "../../../assets/memes/epic-handshake.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · vpn · chapter 03" },
    { from: "system", text: "follow one request from friday's laptop to a website — with the vpn on." },
  ],
  [
    { from: "ramesh", text: "step one — before anything leaves your device, the vpn software {green:encrypts} your traffic." },
    { from: "ramesh", text: "your readable request is sealed in a layer of encryption {pink:on your own device}." },
    { from: "friday", text: "so the cafe never gets the cleartext version?" },
    { from: "ramesh", text: "correct. they get a sealed box addressed to the vpn." },
  ],
  [
    { from: "ramesh", text: "step two — that encrypted data travels through the tunnel to the vpn server." },
    { from: "ramesh", text: "anyone watching along the way — local network or provider — sees only the sealed box, not its contents." },
    { from: "system", text: "the hop-by-hop movie.", visual: "vpn-tunnel-flow" },
    { from: "friday", image: hackermanMeme, caption: "friday watching the sealed dots move" },
  ],
  [
    { from: "ramesh", text: "step three — at the vpn server, it {cyan:decrypts} the box. original request revealed." },
    { from: "ramesh", text: "then it forwards that request to the real website." },
    { from: "friday", text: "and the reply?" },
    { from: "ramesh", text: "comes back to the vpn, gets sealed again, travels the tunnel home, and decrypts on your device." },
    { from: "friday", image: epicHandshakeMeme, caption: "you ↔ vpn ↔ website" },
  ],
  [
    { from: "ramesh", text: "this is why the website's point of view changes." },
    { from: "system", text: "ip mask.", visual: "ip-mask" },
    { from: "ramesh", text: "without a vpn, the site sees your ip. with a vpn, it sees the {green:vpn server's} ip." },
    { from: "friday", text: "so on public wifi that's actually useful." },
    { from: "ramesh", text: "genuinely. encrypts the path. hides your real ip from the destination." },
  ],
  [
    { from: "ramesh", text: "but friday — notice who opened the box." },
    { from: "friday", text: "the vpn server..." },
    { from: "ramesh", text: "exactly. your traffic is decrypted {red:there}. the provider sits where your isp used to sit." },
    { from: "friday", text: "wait. so we just... moved the middleman?" },
    { from: "ramesh", text: "you're not removing the middleman. you're choosing to trust a different one. next chapter: what that means — and what a vpn will never save you from." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "the tunnel works. the seal opens at the vpn. if that provider is sketchy, you handed them the diary. also: anonymity? https? phishing? spoiler — the vpn is not a magic cape.",
      },
    },
    { from: "system", text: "chapter 3 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "where does vpn encryption start?",
    options: ["at the website", "on your own device, before traffic leaves", "only at the isp", "never"],
    answer: 1,
    explanation: "sealed on-device first.",
  },
  {
    question: "along the tunnel, cafe wifi / isp see...",
    options: ["the sealed box, not the contents", "your passwords clearly", "your webcam", "the website html"],
    answer: 0,
    explanation: "scrambled tunnel traffic only.",
  },
  {
    question: "who decrypts the tunnel traffic to forward it?",
    options: ["a random stranger", "the vpn server", "your toaster", "dns"],
    answer: 1,
    explanation: "vpn server opens the box, then forwards.",
  },
  {
    question: "with a vpn on, websites typically see...",
    options: ["your real home ip", "the vpn server's ip", "no source at all", "your mac address only"],
    answer: 1,
    explanation: "exit IP belongs to the vpn.",
  },
  {
    question: "decrypting at the vpn means...",
    options: ["the vpn provider can see your traffic", "nobody anywhere can see anything ever", "https is illegal", "wifi disappears"],
    answer: 0,
    explanation: "trust shifts from isp to vpn provider.",
  },
  {
    question: "on public wifi, a vpn is especially valuable because it...",
    options: ["makes coffee free", "encrypts the path and hides your real ip from sites", "deletes phishing", "replaces antivirus"],
    answer: 1,
    explanation: "path protection + IP mask — big deal on shared networks.",
  },
];

const notes = `
> offtrck · vpn module · study notes
> chapter 03 · hop by hop

## steps (vpn on)
1. **encrypt on device** — readable request sealed before it leaves
2. **travel the tunnel** — cafe / isp see a sealed box to the vpn
3. **vpn decrypts** — opens the box
4. **vpn forwards** — to the real website
5. **reply returns** — sealed back through the tunnel to you

## ip change
| mode | website sees |
|---|---|
| vpn off | your real IP |
| vpn on | vpn server IP |

## trust shift
traffic is readable at the **vpn provider**.
you replaced the isp middleman with a different middleman.

## what's next
limits: anonymity, https, phishing — and why provider reputation matters.
`;

export const vpnChapterThree: Chapter = {
  title: "chapter 03",
  subtitle: "hop by hop",
  scenes,
  quiz,
  notes,
};
