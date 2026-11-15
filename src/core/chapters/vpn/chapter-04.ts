import vpnTrustImg from "../../../assets/vpn/vpn-trust.jpg";
import surprisedPikachuMeme from "../../../assets/memes/surprised-pikachu.gif";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import shallNotPassMeme from "../../../assets/memes/shall-not-pass.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · vpn · chapter 04" },
    { from: "system", text: "what a vpn protects — and the parts the ads leave out." },
  ],
  [
    { from: "ramesh", text: "a vpn does two main things well." },
    { from: "ramesh", text: "one: {green:encrypts} your traffic so the local network and your isp can't see what you're doing." },
    { from: "ramesh", text: "two: {cyan:hides} your real ip so websites see the vpn instead of you." },
    { from: "friday", text: "on airport wifi that's the whole point." },
    { from: "ramesh", text: "yes. genuinely valuable there." },
  ],
  [
    { from: "ramesh", text: "here's what's often left out." },
    {
      from: "system",
      text: "you moved the middleman. choose carefully.",
      image: vpnTrustImg,
      caption: "vpn provider · new position of trust",
      illustration: true,
    },
    { from: "ramesh", text: "your traffic is decrypted at the vpn server. so the {pink:provider} is now where your isp used to be." },
    { from: "ramesh", text: "you're not removing the middleman. you're choosing to trust a different one." },
    { from: "friday", image: surprisedPikachuMeme, caption: "friday after reading the privacy policy" },
    { from: "ramesh", text: "that's why trustworthiness of the provider matters so much." },
  ],
  [
    { from: "ramesh", text: "a vpn also does {red:not} make you anonymous." },
    { from: "ramesh", text: "the moment you log into an account — or your browser carries its usual cookies — you can still be identified and tracked. vpn or not." },
    { from: "friday", text: "hiding my ip ≠ cloak of invisibility." },
    { from: "ramesh", text: "exactly. hiding your ip is not the same as being invisible." },
  ],
  [
    { from: "ramesh", text: "and a vpn does {red:not} replace https." },
    { from: "ramesh", text: "the tunnel protects you ↔ vpn server. from the vpn onward to the website, you still rely on the site's own encryption — https." },
    { from: "friday", image: shallNotPassMeme, caption: "https still required beyond the tunnel exit" },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "vpn ≠ https",
        text: "a vpn is {red:not} a substitute for a website's own encryption. use both when it matters.",
      },
    },
  ],
  [
    { from: "ramesh", text: "finally — phishing, scams, malware. a vpn does nothing if you type your password on a fake site or download something nasty." },
    { from: "friday", image: thisIsFineMeme, caption: "vpn on · clicking 'free nitro' link" },
    { from: "ramesh", text: "it secures the {cyan:connection}, not your {pink:decisions}." },
    { from: "system", text: "shields and gaps.", visual: "vpn-limits" },
    { from: "friday", text: "ok. so when people say 'just use a proxy'...?" },
    { from: "ramesh", text: "next. proxy vs vpn — they look similar, they are not the same animal." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "one last comparison: a {orange:proxy} can change where one app appears to come from. a vpn encrypts and reroutes the {green:whole device}. friday needs that difference burned in.",
      },
    },
    { from: "system", text: "chapter 4 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "a vpn's two main protections are...",
    options: ["free coffee and stickers", "encrypt traffic + hide your real ip", "stop all malware forever", "replace passwords"],
    answer: 1,
    explanation: "encryption along the path + IP masking.",
  },
  {
    question: "after you turn a vpn on, who can see inside your traffic at the exit?",
    options: ["nobody in the universe", "the vpn provider", "only your cat", "cafe wifi still reads everything"],
    answer: 1,
    explanation: "decrypted at the vpn — trust the provider.",
  },
  {
    question: "does a vpn make you anonymous?",
    options: ["yes, completely", "no — logins and cookies can still identify you", "only on tuesdays", "yes if the logo is green"],
    answer: 1,
    explanation: "hiding IP ≠ invisibility.",
  },
  {
    question: "does a vpn replace https?",
    options: ["yes always", "no — beyond the vpn you still need the site's encryption", "https is fake", "only for images"],
    answer: 1,
    explanation: "tunnel covers you↔vpn; site needs https onward.",
  },
  {
    question: "if you enter a password on a phishing site with vpn on...",
    options: ["vpn blocks it automatically", "vpn does nothing to stop that decision", "the password becomes encrypted forever", "the site evaporates"],
    answer: 1,
    explanation: "secures the connection, not your clicks.",
  },
  {
    question: "choosing a vpn provider matters because...",
    options: ["colors look nicer", "you trust them with traffic the isp used to see", "laws ban free wifi", "nmap requires it"],
    answer: 1,
    explanation: "reputable provider = same importance as using a vpn at all.",
  },
];

const notes = `
> offtrck · vpn module · study notes
> chapter 04 · shields and gaps

## a vpn does
- encrypt traffic so cafe wifi / isp can't read what you're doing
- hide your real IP from websites
- especially valuable on **public wifi**

## a vpn does NOT
- make you **anonymous** (logins, cookies still track)
- replace **HTTPS**
- stop **phishing / scams / malware**
- hide traffic from the **vpn provider**

## trust
you're not removing the middleman — you're choosing a different one.
provider reputation matters as much as turning the vpn on.

## what's next
proxy vs vpn, then full recap.
`;

export const vpnChapterFour: Chapter = {
  title: "chapter 04",
  subtitle: "shields and gaps",
  scenes,
  quiz,
  notes,
};
