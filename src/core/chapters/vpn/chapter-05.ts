import spidermanMeme from "../../../assets/memes/spiderman-pointing.gif";
import samePictureMeme from "../../../assets/memes/same-picture.gif";
import csiSunglassesMeme from "../../../assets/memes/csi-sunglasses.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · vpn · chapter 05" },
    { from: "system", text: "proxy vs vpn — then the honest recap." },
  ],
  [
    { from: "friday", text: "people at work keep saying 'just use a proxy'." },
    { from: "ramesh", text: "they can look similar. both route traffic through another server. they are {red:not} the same." },
    { from: "friday", image: spidermanMeme, caption: "proxy gang vs vpn gang" },
  ],
  [
    { from: "ramesh", text: "a {orange:proxy} usually works at the level of a {pink:single application} — like your browser." },
    { from: "ramesh", text: "it can change that app's apparent ip. other apps often aren't routed through it at all." },
    { from: "ramesh", text: "and a basic proxy often {red:doesn't encrypt}. it can change where traffic appears to come from without protecting what's inside." },
    { from: "friday", text: "so on airport wifi a plain proxy..." },
    { from: "ramesh", text: "may leave you exposed." },
  ],
  [
    { from: "ramesh", text: "a {green:vpn} works at the level of your {cyan:whole device}." },
    { from: "ramesh", text: "it captures traffic from all your apps and sends it through one encrypted tunnel." },
    { from: "ramesh", text: "everything is both rerouted and protected — not just one app." },
    { from: "system", text: "side by side.", visual: "vpn-vs-proxy" },
    { from: "friday", image: samePictureMeme, caption: "they are not the same picture" },
  ],
  [
    { from: "ramesh", text: "simplest memory: proxy mainly changes where {orange:one app} appears to come from. vpn encrypts and reroutes the {green:entire device}." },
    { from: "ramesh", text: "a vpn does more — stronger choice for privacy and security." },
  ],
  [
    { from: "ramesh", text: "recap." },
    { from: "system", text: "one useful tool. not a complete shield.", visual: "vpn-recap" },
    { from: "ramesh", text: "a vpn routes traffic through an encrypted tunnel to a vpn server — protecting it along the way and changing how you appear online." },
    { from: "ramesh", text: "two jobs: encrypt so cafe/isp can't see what you're doing. hide your real ip so sites see the vpn." },
    { from: "ramesh", text: "not magic. not anonymous. not a https replacement. not anti-phishing. traffic is visible to the provider." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "practical takeaway",
        text: "a vpn is one useful privacy tool — not a complete shield.\nit protects your {cyan:connection}, not your {pink:clicks}.\nchoose a reputable provider. that matters as much as turning it on.",
      },
    },
    { from: "friday", image: csiSunglassesMeme, caption: "friday · vpn on · brain on · still reading urls" },
    { from: "friday", text: "got it. tunnel for the path. brain for the clicks." },
    { from: "ramesh", text: "good. now go finish that deploy — preferably not on cleartext cafe gossip." },
    { from: "system", text: "vpn module complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "a typical proxy operates at the level of...",
    options: ["the whole device", "usually a single application like the browser", "the power grid", "only printers"],
    answer: 1,
    explanation: "app-level forwarder.",
  },
  {
    question: "a basic proxy often...",
    options: ["fully encrypts everything like a vpn", "doesn't encrypt, so contents may stay exposed", "deletes malware", "replaces https"],
    answer: 1,
    explanation: "IP change ≠ encryption.",
  },
  {
    question: "a vpn captures traffic from...",
    options: ["only chrome", "the whole device / all apps", "only email", "only ads"],
    answer: 1,
    explanation: "device-wide encrypted tunnel.",
  },
  {
    question: "best short memory aid...",
    options: [
      "proxy = whole device encrypt; vpn = one app",
      "proxy ≈ one app appearance; vpn = encrypt + reroute whole device",
      "they are identical",
      "proxies are always safer",
    ],
    answer: 1,
    explanation: "vpn does more for privacy/security.",
  },
  {
    question: "a vpn is best described as...",
    options: ["a complete invisibility shield", "one useful privacy tool, not a complete shield", "antivirus", "a password manager"],
    answer: 1,
    explanation: "protects connection; not your clicks.",
  },
  {
    question: "choosing a reputable vpn provider matters because...",
    options: ["marketing", "they can see traffic after decrypt — trust equals risk", "fonts", "wifi channels"],
    answer: 1,
    explanation: "provider sits in the middle now.",
  },
];

const notes = `
> offtrck · vpn module · study notes
> chapter 05 · proxy vs vpn · recap

## proxy vs vpn
| | proxy | vpn |
|---|---|---|
| scope | usually one app (browser) | whole device |
| encrypt? | often **no** | **yes** (tunnel) |
| on bad wifi | may leave you exposed | stronger protection |

**memory:** proxy changes where one app appears to come from.
vpn encrypts + reroutes the entire device.

## full recap
a vpn routes traffic through an **encrypted tunnel** to a vpn server.

### does
1. encrypt so local network / isp can't see what you're doing
2. hide real IP so websites see the vpn

### does not
- make you anonymous
- replace https
- stop phishing / malware
- hide traffic from the **vpn provider**

## practical
vpn = useful privacy tool, **not** a complete shield.
protects the connection — not your clicks.
**choose a reputable provider.**
`;

export const vpnChapterFive: Chapter = {
  title: "chapter 05",
  subtitle: "proxy vs vpn",
  scenes,
  quiz,
  notes,
};
