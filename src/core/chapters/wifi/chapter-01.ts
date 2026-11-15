import quietStreet from "../../../assets/wifi/quiet-street.jpg";
import neighborListen from "../../../assets/wifi/neighbor-listen.jpg";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import fridayAvatar from "../../../assets/characters/friday.jpg";
import rameshAvatar from "../../../assets/characters/ramesh.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · wifi passwords · chapter 01" },
    { from: "system", text: "today's story is about a quiet street, a weak password, and a neighbor with a laptop." },
  ],
  [
    {
      from: "system",
      text: "[profile] friday · junior developer. he can scan a network with nmap now. wi-fi cracking? still a black box.",
      image: fridayAvatar,
      caption: "friday · the learner",
    },
    { from: "friday", text: "ramesh... my neighbour's wifi name is sitting there on my phone. out of boredom i wondered how hard it would be to—" },
    {
      from: "system",
      text: "[profile] ramesh · ethical hacker. he will show how the attack works so friday learns how to stop it. only on networks you own.",
      image: rameshAvatar,
      caption: "ramesh · the expert",
    },
    { from: "ramesh", text: "stop. we do not touch other people's wifi. but i will teach you the story of {cyan:Sally} and {pink:Kim}, so you understand why weak passwords die." },
  ],
  [
    {
      from: "system",
      text: "this is Sally. quiet street. everyone waves hello. nothing ever seems to happen.",
      image: quietStreet,
      caption: "Sally's street · peaceful... on the surface",
      illustration: true,
    },
    { from: "ramesh", text: "like most of us, Sally has home wi-fi for her laptop, phone, smart TV. she locked it with a short, simple password. easy to remember." },
    { from: "friday", text: "she's never thought twice about it, right?" },
    { from: "ramesh", text: "exactly. 'who would ever want to break into my wifi?'" },
    { from: "friday", image: thisIsFineMeme, caption: "sally, trusting a short password" },
  ],
  [
    {
      from: "system",
      text: "and this is Kim. sally's new neighbor. ethical hacker. penetration tester.",
      image: neighborListen,
      caption: "kim · next door · laptop open",
      illustration: true,
    },
    { from: "ramesh", text: "today kim will recover sally's wifi password {pink:out of thin air}, using a toolkit called {yellow:aircrack-ng}." },
    { from: "friday", text: "out of thin air?? the password flies through the wifi?" },
    { from: "ramesh", text: "no. and that is the first thing people get wrong." },
  ],
  [
    { from: "ramesh", text: "modern wifi is protected by {green:WPA2}. the password is {red:never} sent through the air. kim cannot just sniff it like an http form." },
    { from: "friday", text: "then how does cracking even work?" },
    { from: "ramesh", text: "every time a device connects, it does a quick exchange with the router: a {pink:handshake}. scrambled proof that both sides know the password." },
    { from: "system", text: "handshake = proof, not the password itself.", visual: "wifi-handshake" },
  ],
  [
    { from: "ramesh", text: "kim's plan is simple. capture that handshake. then crack it on his own computer offline." },
    { from: "friday", text: "offline? so sally wouldn't even see him typing passwords at her router?" },
    { from: "ramesh", text: "correct. once he has the handshake file, he can leave the street entirely." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "rules of this module",
        text: "educational demo only.\nonly practice on networks {green:you own} or have {green:written permission} to test.\nbreaking into a neighbour's wifi without permission is illegal.",
      },
    },
  ],
  [
    { from: "friday", text: "ok... so step one is capture the handshake. how does he even hear it?" },
    { from: "ramesh", text: "first he has to turn his wifi card into a listening device. normal cards are polite. they only hear their own traffic." },
    { from: "ramesh", text: "but friday — what if the card could hear {pink:every} wifi conversation on the street?" },
    { from: "friday", text: "wait. can it?" },
    { from: "ramesh", text: "kim is about to find out. one switch. then the whole neighborhood opens up." },
    { from: "system", text: "chapter 1 complete." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "kim's laptop still only hears its own traffic. next he flips a switch called {pink:monitor mode} — and every nearby wifi conversation becomes audible.",
      },
    },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "in this story, who is learning and who is teaching?",
    options: ["ramesh learns, friday teaches", "friday learns, ramesh teaches", "sally teaches kim", "the router teaches everyone"],
    answer: 1,
    explanation: "friday is the junior. ramesh is the ethical hacker explaining the attack.",
  },
  {
    question: "why can't kim just sniff sally's wifi password out of the air on WPA2?",
    options: ["wifi has no passwords", "the password is never sent through the air", "passwords are only on paper", "nmap blocks it"],
    answer: 1,
    explanation: "WPA2 keeps the password local. devices exchange a handshake proof instead.",
  },
  {
    question: "what is a WPA2 handshake?",
    options: [
      "the router shouting the password",
      "a scrambled proof that both sides know the password",
      "a physical cable plug",
      "a wifi name",
    ],
    answer: 1,
    explanation: "it's proof of knowledge, not the plaintext password flying around.",
  },
  {
    question: "what is kim's basic plan?",
    options: [
      "break into sally's house",
      "capture a handshake, then crack it offline",
      "guess the password on the router login page only",
      "unplug the router",
    ],
    answer: 1,
    explanation: "capture first, crack later on his own machine.",
  },
  {
    question: "which toolkit does kim use in the story?",
    options: ["photoshop", "aircrack-ng suite", "excel", "zoom"],
    answer: 1,
    explanation: "aircrack-ng: airmon, airodump, aireplay, aircrack.",
  },
  {
    question: "sally's main mistake at the start is...",
    options: ["buying a smart TV", "using a short, simple, easy-to-remember password", "waving to neighbors", "using https"],
    answer: 1,
    explanation: "weak passwords are what make offline cracking easy.",
  },
  {
    question: "once kim has the handshake file, why is that dangerous?",
    options: [
      "he must stay next to the router forever",
      "he can leave and crack offline with all the time in the world",
      "the file deletes itself",
      "it only works on airplanes",
    ],
    answer: 1,
    explanation: "offline cracking needs no more contact with the victim network.",
  },
  {
    question: "when is it legal to try these techniques?",
    options: [
      "on any wifi you can see",
      "only on networks you own or have written permission to test",
      "on airport wifi always",
      "never, even on your own router",
    ],
    answer: 1,
    explanation: "permission matters. this module is for defense education.",
  },
  {
    question: "what will kim need next to hear the handshake?",
    options: ["a bigger font", "monitor mode on his wifi card", "sally's front door key", "a printer"],
    answer: 1,
    explanation: "monitor mode turns the card into a radio scanner.",
  },
  {
    question: "WPA2 stands for...",
    options: ["Wi-Fi Protected Access II", "Wireless Public Antenna 2", "Web Password Access 2", "Wide Packet Attack 2"],
    answer: 0,
    explanation: "Wi-Fi Protected Access II — the common home wifi protection.",
  },
];

const notes = `# chapter 01 · sally's quiet street

> offtrck · wifi passwords module · study notes

## cast
| person | role |
|---|---|
| friday | learner |
| ramesh | ethical hacker / teacher |
| Sally | home user with a weak wifi password |
| Kim | neighbor running an aircrack-ng demo (educational story) |

## big idea
on **WPA2**, the wifi password is **not** sent in the clear.
when a device joins, it performs a **4-way handshake**: scrambled proof both sides know the password.

## attack outline
1. hear the air (monitor mode)
2. find the target network
3. capture a handshake
4. crack offline with a wordlist

## ethics
only test networks you own or have written permission to test.

## what's next
kim still needs to turn his wifi card into a listening device.
`;

export const wifiChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "sally's quiet street",
  scenes,
  quiz,
  notes,
};
