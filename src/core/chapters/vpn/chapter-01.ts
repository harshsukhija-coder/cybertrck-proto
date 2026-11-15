import cafeWifi from "../../../assets/vpn/cafe-wifi.jpg";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import peekingMeme from "../../../assets/memes/peeking.gif";
import fridayAvatar from "../../../assets/characters/friday.jpg";
import rameshAvatar from "../../../assets/characters/ramesh.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · vpn · chapter 01" },
    { from: "system", text: "today: what happens to your traffic on a network you don't control — before anyone mentions a vpn." },
  ],
  [
    {
      from: "system",
      text: "[profile] friday · junior developer. he knows nmap and encryption basics. public wifi still feels 'fine'.",
      image: fridayAvatar,
      caption: "friday · the learner",
    },
    { from: "friday", text: "ramesh, i'm at the airport cafe. free wifi. working on the staging deploy. is that... bad?" },
    {
      from: "system",
      text: "[profile] ramesh · ethical hacker. he will show what leaks by default — then what a vpn actually fixes.",
      image: rameshAvatar,
      caption: "ramesh · the expert",
    },
    { from: "ramesh", text: "not automatically illegal. but by default, a lot of your traffic can be {red:seen} by others along the way." },
  ],
  [
    {
      from: "system",
      text: "airport cafe. rainy glass. free wifi. strangers sharing the same airwaves.",
      image: cafeWifi,
      caption: "public wifi · network you don't control",
      illustration: true,
    },
    { from: "friday", image: thisIsFineMeme, caption: "friday on free wifi, shipping code" },
    { from: "ramesh", text: "the network you're on — and your {yellow:internet provider} — can see {pink:where} your traffic is going." },
    { from: "ramesh", text: "and on an unsecured network, others nearby may see more than you'd expect." },
    { from: "friday", image: peekingMeme, caption: "someone two tables over, theoretically" },
  ],
  [
    { from: "friday", text: "ok but https exists. we did encryption. aren't sites locked?" },
    { from: "ramesh", text: "https protects the contents of many pages. it does {pink:not} erase your path. let's talk about what still leaks." },
    { from: "system", text: "two leaks by default.", visual: "traffic-leaks" },
  ],
  [
    { from: "ramesh", text: "when you visit a website, traffic doesn't go straight there. it passes through several hands." },
    { from: "ramesh", text: "every device has an {cyan:IP address}. your request carries it so the response knows where to come back." },
    { from: "friday", text: "so the website sees my ip?" },
    { from: "ramesh", text: "yes. not your home street address — but city or region, and which provider you use. more than many people realize." },
    { from: "ramesh", text: "and your isp sits in the middle of {pink:all} your traffic. depending on where you are, it can see which sites you connect to — and may keep records." },
  ],
  [
    { from: "ramesh", text: "so by default, your connection leaks two things." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "the default internet",
        text: "leak 1 · {pink:what you're doing}\nleak 2 · {cyan:where you're coming from}",
      },
    },
    { from: "friday", text: "and a vpn...?" },
    { from: "ramesh", text: "a vpn wraps the connection in an {green:encrypted tunnel}. same networks. different eyesight." },
    { from: "friday", text: "so what is a vpn, exactly? not the ads. the real thing." },
    { from: "ramesh", text: "next. we open the sealed pipe." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "friday's packets are still walking around in a {cyan:clear glass tube}. next chapter: what a virtual private network actually is — and how it turns that tube opaque.",
      },
    },
    { from: "system", text: "chapter 1 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "on public wifi, your traffic travels across a network...",
    options: ["you fully control", "you don't control", "that only exists in space", "owned by your fridge"],
    answer: 1,
    explanation: "cafe / airport / hotel wifi is someone else's network.",
  },
  {
    question: "by default, your connection tends to leak...",
    options: ["only your favorite color", "what you're doing and where you're from", "nothing at all", "only battery percent"],
    answer: 1,
    explanation: "activity path + IP / location / provider clues.",
  },
  {
    question: "your IP address tells a website...",
    options: ["your exact home street", "roughly city/region and often your isp", "your password", "nothing useful"],
    answer: 1,
    explanation: "not a postal address — still more than people think.",
  },
  {
    question: "who sits in the middle of basically all your traffic?",
    options: ["your isp", "your toaster", "only google", "nobody"],
    answer: 0,
    explanation: "the internet provider routes you onto the wider net.",
  },
  {
    question: "https alone means...",
    options: ["nobody can see your path or ip clues", "page contents can be protected, but path/ip issues remain", "vpn is illegal", "wifi is always safe"],
    answer: 1,
    explanation: "encryption of content ≠ erasing who connected from where.",
  },
  {
    question: "a vpn's big idea (preview) is to...",
    options: ["delete the internet", "wrap traffic in an encrypted tunnel", "make coffee faster", "replace your laptop"],
    answer: 1,
    explanation: "encrypted tunnel across the same networks.",
  },
];

const notes = `
> offtrck · vpn module · study notes
> chapter 01 · leaky by default

## the problem
on public wifi (and the wider internet), traffic crosses networks **you don't control**.

## who can see what
| actor | often sees |
|---|---|
| local network (cafe wifi) | destinations; sometimes more if traffic isn't encrypted |
| isp | which sites you connect to; may log |
| website | your **IP** (city/region, provider clues) |

## two leaks
1. **what you're doing** (where traffic goes)
2. **where you're coming from** (IP / provider)

## ip address
needed so replies find you. also reveals roughly where you are — not your street, but not "nothing".

## preview
a **vpn** wraps the connection in an encrypted tunnel so observers along the path can't read the contents.

## what's next
what "virtual private network" actually means — glass tube vs sealed pipe.
`;

export const vpnChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "leaky by default",
  scenes,
  quiz,
  notes,
};
