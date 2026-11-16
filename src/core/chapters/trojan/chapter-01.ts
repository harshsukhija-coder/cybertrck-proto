import dualDesks from "../../../assets/trojan/dual-desks.jpg";
import parisSunset from "../../../assets/trojan/paris-sunset.jpg";
import kimAvatar from "../../../assets/characters/kim.jpg";
import sallyAvatar from "../../../assets/characters/sally.jpg";
import bobAvatar from "../../../assets/characters/bob.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · image trojan · chapter 01" },
    { from: "system", text: "🎬 new cast. new folder. this one is about trust… and a fake sunset." },
  ],
  [
    {
      from: "system",
      text: "meet {green:Kim} 🐉 — ethical attacker. kali linux. terminal always open.",
      image: kimAvatar,
      caption: "kim · the operator",
    },
    {
      from: "system",
      text: "meet {cyan:Sally} 💙 — windows 10 user. trusts her friends. loves travel photos.",
      image: sallyAvatar,
      caption: "sally · the target",
    },
    {
      from: "system",
      text: "and {yellow:Bob} 🧳 — sally's real best friend. kim will steal that trust without bob knowing.",
      image: bobAvatar,
      caption: "bob · the borrowed identity",
    },
  ],
  [
    {
      from: "system",
      text: "two desks. one story.",
      image: dualDesks,
      caption: "kali night ↔ windows day",
      illustration: true,
    },
    {
      from: "system",
      dual: {
        kim: {
          title: "idle",
          prompt: "kim@kali:~$",
          command: "whoami",
          output: "kim\n# waiting for a plan ☕",
        },
        sally: {
          mode: "idle",
          title: "desktop",
          note: "sally has no idea what's coming",
        },
      },
    },
  ],
  [
    { from: "kim", text: "an image lands in an inbox. a paris sunset from a 'friend'. she clicks. 🌅" },
    {
      from: "system",
      text: "the photo she expects…",
      image: parisSunset,
      caption: "bait · eiffel tower sunset",
      illustration: true,
    },
    { from: "sally", text: "aww bob always sends the best travel pics 🥺" },
    { from: "kim", text: "in the background, something else launches. a hidden program. full control." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "image trojan",
        text: "not science fiction. a real method: malicious code {red:disguised} as a harmless photo.",
      },
    },
  ],
  [
    { from: "system", text: "think of the file like a delivery package. 📦", visual: "trojan-package" },
    { from: "kim", text: "outer wrapping = email + cute filename. inside = {pink:payload}. the real action code." },
    { from: "sally", text: "i just wanted the sunset…" },
    { from: "kim", text: "payload tonight: a {yellow:reverse shell}. her pc calls me back. i get a remote session." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "kim opens a terminal. tool of the night: {green:msfvenom}. next — forging picture.exe while sally still thinks the internet is friendly.",
      },
    },
    { from: "system", text: "chapter 1 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "in this story, who is the ethical attacker?",
    options: ["sally", "bob", "kim", "the eiffel tower"],
    answer: 2,
    explanation: "Kim runs Kali and builds the trojan.",
  },
  {
    question: "sally's machine is…",
    options: ["kali linux", "windows 10", "a toaster", "macos only"],
    answer: 1,
    explanation: "Windows 10 is the target.",
  },
  {
    question: "an image trojan is…",
    options: ["a wallpaper pack", "malware disguised as a harmless photo", "a vpn feature", "antivirus"],
    answer: 1,
    explanation: "Looks like an image; runs malicious code.",
  },
  {
    question: "kim plans to exploit…",
    options: ["sally's wifi password only", "trust in her friend bob", "printer ink", "dns"],
    answer: 1,
    explanation: "Social engineering via a fake Bob email.",
  },
  {
    question: "the 'payload' is…",
    options: ["the email subject", "the real action code inside the package", "the sunset photo pixels only", "windows wallpaper"],
    answer: 1,
    explanation: "Payload = what runs on the victim.",
  },
  {
    question: "a reverse shell means…",
    options: ["the victim connects back to the attacker", "the attacker mails a USB", "wifi turns off", "https is disabled"],
    answer: 0,
    explanation: "Victim initiates the call home.",
  },
];

const notes = `
> offtrck · image trojan · study notes
> chapter 01 · the cast & the bait

## cast
| character | role |
|---|---|
| **Kim** | ethical attacker on Kali |
| **Sally** | Windows 10 target |
| **Bob** | Sally's friend — identity kim steals for trust |

## image trojan
malware delivered as something that **looks** like a photo.
opens → hidden program runs → attacker may get control.

## package metaphor
- **wrapping** = delivery + disguise (email, filename)
- **payload** = real code (here: reverse shell)

## reverse shell
victim machine connects **out** to attacker listener.

## ethics
demo / education only. never send malware without written permission.
`;

export const trojanChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "the cast & the bait",
  scenes,
  quiz,
  notes,
};
