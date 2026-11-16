import cafeWifi from "../../../assets/vpn/cafe-wifi.jpg";
import cafeSniffer from "../../../assets/scenes/cafe-sniffer.jpg";
import kimAvatar from "../../../assets/characters/kim.jpg";
import sallyAvatar from "../../../assets/characters/sally.jpg";
import thisIsFine from "../../../assets/memes/this-is-fine.gif";
import peeking from "../../../assets/memes/peeking.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · man in the middle · chapter 01" },
    { from: "system", text: "🎬 tone shift: less forge-room. more latte foam… and a ghost on the wire." },
  ],
  [
    { from: "friday", text: "ramesh. public wifi feels free. is free ever free? 🥲" },
    { from: "ramesh", text: "grab a seat, friday. today's story starts with steam, screens, and someone who is {pink:already listening}." },
  ],
  [
    {
      from: "system",
      text: "bean & byte café. open network. soft jazz. nobody looks suspicious.",
      image: cafeWifi,
      caption: "free wifi · strongest aroma in the room",
      illustration: true,
    },
    { from: "jules", text: "☕ welcome in! password is on the chalkboard… wait, there is no password. just tap Bean&Byte_Free ✨" },
    { from: "friday", text: "who is that?" },
    { from: "ramesh", text: "meet {orange:Jules} — barista, part-time philosopher, full-time wifi enabler." },
  ],
  [
    {
      from: "system",
      text: "and our returning cast — different job today.",
      image: sallyAvatar,
      caption: "sally · cafe regular · trusts the SSID",
    },
    { from: "sally", text: "perfect. emails, then bank. this wifi is so nice 💆‍♀️" },
    {
      from: "system",
      text: "two tables away…",
      image: kimAvatar,
      caption: "kim · kali open under the table",
    },
    { from: "kim", text: "☕ + antennas. she thinks she's talking to the router. cute." },
    { from: "jules", text: "kim tip-jars in silence. i pretend not to see the dongle forest 👀" },
  ],
  [
    {
      from: "system",
      dual: {
        kim: {
          title: "recon",
          prompt: "kim@kali:~$",
          command: "iwconfig wlan0\nip -br a",
          output: `wlan0    IEEE 802.11  ESSID:Bean&Byte_Free
wlan0    UP  192.168.0.66/24

{green:[+]} same cafe air as sally. listening starts now.`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "mail.example.com/inbox",
            secure: true,
            heading: "Inbox · 3 new",
            body: "from: bob\nsubject: paris pics later?\n\n😊 everything feels normal.",
          },
          note: "sally: pages load. logins work. vibes: 😌",
        },
      },
    },
    { from: "sally", image: thisIsFine, caption: "sally's internal weather report" },
    { from: "kim", image: peeking, caption: "kim · a few tables away" },
  ],
  [
    { from: "ramesh", text: "normal path first. device → access point (router) → internet → website. reply comes home the same way." },
    { from: "ramesh", text: "data isn't one blob. it's {cyan:packets} — tiny envelopes with source + destination addresses." },
    {
      from: "system",
      text: "some envelopes are sealed ({green:encrypted}). some are postcards ({red:plaintext}). guess which ones kim prefers.",
      visual: "packet-journey",
    },
  ],
  [
    {
      from: "system",
      text: "the trust glitch: your laptop trusts 'this is the router'. the router trusts 'this is your laptop'. neither checks hard.",
      image: cafeSniffer,
      caption: "quiet room · loud packets",
      illustration: true,
    },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "man-in-the-middle",
        text: "an attacker secretly sits between two talking devices. traffic still works. that's the horror.",
      },
    },
    { from: "system", text: "letter metaphor: someone opens your mail, reads it, maybe edits a line, reseals it, delivers it. receiver smiles. never knows. 💌➡️🕵️➡️💌" },
    { from: "system", visual: "mitm-middle" },
  ],
  [
    { from: "kim", text: "once i'm middle, i can {cyan:eavesdrop}, {orange:modify}, or {pink:impersonate}. first i have to get there." },
    { from: "friday", text: "…how does she get there without sally noticing?" },
    { from: "ramesh", text: "two classic doors. next chapter: the twin with the same smile. 🎭" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "in a mitm, the scary part is usually…",
    options: ["the wifi dies instantly", "everything still looks normal", "the screen turns red", "the router explodes"],
    answer: 1,
    explanation: "pages load. logins 'work'. silence is the feature.",
  },
  {
    question: "packets are…",
    options: ["one giant file sent whole", "small units with source + destination", "only passwords", "printer drivers"],
    answer: 1,
    explanation: "broken into packets, each with addressing.",
  },
  {
    question: "devices on wifi often trust…",
    options: ["only signed government routers", "that they're talking straight to the other end", "random bluetooth toasters", "nothing at all"],
    answer: 1,
    explanation: "that trust is what mitm abuses.",
  },
  {
    question: "jules' cafe wifi is dangerous mainly because…",
    options: ["the coffee is too hot", "open networks are easy to twin / join", "jazz music encrypts packets", "sally uses a desktop tower"],
    answer: 1,
    explanation: "open public wifi is a favorite stage for evil twins.",
  },
];

const notes = `# man in the middle · chapter 01 — the quiet cafe

## cast
- **Sally** — victim on a laptop, thinks cafe wifi is cozy
- **Kim** — attacker a few tables away on Kali
- **Jules** — barista who hands out the open SSID with a smile

## normal path
device → wireless AP/router → internet → website → back the same way

## packets
traffic is split into packets with source + destination addresses.

## the attack
MITM = attacker secretly between two parties. can eavesdrop, modify, or impersonate — while both sides think the path is direct.

## vibe check
if it feels fine, that doesn't mean it's private.
`;

export const mitmChapterOne: Chapter = {
  title: "the quiet cafe",
  subtitle: "trust, packets, and a seat in the middle",
  scenes,
  quiz,
  notes,
};
