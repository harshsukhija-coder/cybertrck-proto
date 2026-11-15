import peekingMeme from "../../../assets/memes/peeking.gif";
import sneakyHomerMeme from "../../../assets/memes/sneaky-homer.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 02 · ears open · monitor mode" },
    { from: "friday", text: "ok so kim needs to hear the handshake. his laptop wifi is not enough?" },
    { from: "ramesh", text: "normal mode only listens to traffic meant for that card. like a phone that only hears calls to its own number." },
    { from: "friday", text: "and the special mode?" },
    { from: "ramesh", text: "{pink:monitor mode}. turns the card into a radio scanner. every wifi conversation nearby becomes audible." },
    { from: "system", text: "polite guest vs neighborhood scanner.", visual: "monitor-mode" },
  ],
  [
    { from: "ramesh", text: "tool: {yellow:airmon-ng}, part of aircrack-ng. first he lists wireless cards." },
    {
      from: "system",
      terminal: {
        command: "sudo airmon-ng",
        output: `PHY\tInterface\tDriver\t\tChipset
phy0\t{cyan:wlan0}\t\tiwlwifi\tIntel`,
      },
    },
    { from: "friday", text: "wlan0. that's the one?" },
    { from: "ramesh", text: "yes. but on kali, background programs keep grabbing the card. they get in the way." },
  ],
  [
    { from: "ramesh", text: "so kim shuts them down first:" },
    {
      from: "system",
      terminal: {
        command: "sudo airmon-ng check kill",
        output: `Killing these processes:
  NetworkManager
  wpa_supplicant
{green:done.}`,
      },
    },
    { from: "friday", text: "that kills wifi for normal browsing too?" },
    { from: "ramesh", text: "on that machine, yes. this is attacker-lab mode. then he starts monitor mode:" },
    {
      from: "system",
      terminal: {
        command: "sudo airmon-ng start wlan0",
        output: `monitor mode enabled on {pink:wlan0mon}`,
      },
    },
  ],
  [
    { from: "ramesh", text: "see that name? {pink:wlan0mon}. the {pink:mon} at the end is the giveaway. listening interface from here on." },
    { from: "ramesh", text: "confirm with iwconfig:" },
    {
      from: "system",
      terminal: {
        command: "iwconfig wlan0mon",
        output: `wlan0mon  IEEE 802.11  Mode:{pink:Monitor}  Frequency:2.412 GHz
          Tx-Power=20 dBm`,
      },
    },
    { from: "friday", image: peekingMeme, caption: "kim's card, suddenly hearing everything" },
  ],
  [
    { from: "friday", text: "so now he's silently listening to the whole street?" },
    { from: "ramesh", text: "to every access point and client in range. no password cracked yet. he just opened his ears." },
    { from: "friday", image: sneakyHomerMeme, caption: "kim, blending into the radio noise" },
    { from: "ramesh", text: "next he has to pick Sally_Home out of a forest of networks." },
    { from: "friday", text: "how many networks are we talking?" },
    { from: "ramesh", text: "enough to get lost. and if he picks the wrong row, he captures the wrong handshake." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "the card is a scanner now. the neighborhood is about to {pink:light up} on screen. which row is sally — and which two numbers must kim write down before he moves?",
      },
    },
    { from: "system", text: "chapter 2 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does monitor mode do?",
    options: [
      "makes wifi faster",
      "lets the card overhear all nearby wifi traffic",
      "hides your mac forever",
      "turns off encryption",
    ],
    answer: 1,
    explanation: "monitor mode = radio scanner for 802.11 frames.",
  },
  {
    question: "which tool enables monitor mode in the aircrack suite?",
    options: ["aircrack-ng only", "airmon-ng", "nmap", "curl"],
    answer: 1,
    explanation: "airmon-ng start wlan0 → wlan0mon.",
  },
  {
    question: "why run 'airmon-ng check kill'?",
    options: [
      "to delete sally's password",
      "to stop background programs that fight for the wifi card",
      "to update kali",
      "to enable https",
    ],
    answer: 1,
    explanation: "NetworkManager / wpa_supplicant often block monitor mode.",
  },
  {
    question: "what does the 'mon' in wlan0mon mean?",
    options: ["monday", "monitor interface", "monster mode", "money"],
    answer: 1,
    explanation: "it's the listening interface name kali creates.",
  },
  {
    question: "which command confirms Mode:Monitor?",
    options: ["ping", "iwconfig", "ls", "cat /etc/passwd"],
    answer: 1,
    explanation: "iwconfig shows wireless interface mode.",
  },
  {
    question: "in normal mode, a wifi card mostly hears...",
    options: ["every network on earth", "traffic meant for it", "only bluetooth", "only ethernet"],
    answer: 1,
    explanation: "like a phone that only answers its own number.",
  },
  {
    question: "after enabling monitor mode, has kim cracked the password?",
    options: ["yes", "no, he only opened his ears", "yes, automatically", "only if WPA3"],
    answer: 1,
    explanation: "listening ≠ cracking. capture and wordlist come later.",
  },
  {
    question: "airmon-ng is part of...",
    options: ["microsoft office", "the aircrack-ng suite", "chrome extensions", "figma"],
    answer: 1,
    explanation: "airmon, airodump, aireplay, aircrack.",
  },
  {
    question: "what is kim's interface before monitor mode in the demo?",
    options: ["eth0", "wlan0", "lo", "docker0"],
    answer: 1,
    explanation: "wlan0 is the wireless card listed by airmon-ng.",
  },
  {
    question: "what is the next problem after monitor mode?",
    options: ["finding which network is sally's among many", "buying a new router", "installing windows", "turning wifi off forever"],
    answer: 0,
    explanation: "he must identify BSSID + channel for the target.",
  },
];

const notes = `# chapter 02 · monitor mode

> offtrck · wifi passwords module · study notes

## idea
normal wifi = hear your own traffic.
**monitor mode** = hear the neighborhood.

## commands
\`\`\`
sudo airmon-ng
sudo airmon-ng check kill
sudo airmon-ng start wlan0
iwconfig wlan0mon   # Mode:Monitor
\`\`\`

## names
- \`wlan0\` → normal interface
- \`wlan0mon\` → monitor interface

## what's next
which network is Sally_Home, and what BSSID + channel does kim need?
`;

export const wifiChapterTwo: Chapter = {
  title: "chapter 02",
  subtitle: "monitor mode",
  scenes,
  quiz,
  notes,
};
