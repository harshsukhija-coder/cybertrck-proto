import keyFoundImg from "../../../assets/wifi/key-found.jpg";
import easyButtonMeme from "../../../assets/memes/easy-button.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import mindBlownMeme from "../../../assets/memes/mind-blown.gif";
import shallNotPassMeme from "../../../assets/memes/shall-not-pass.gif";
import shutItDownMeme from "../../../assets/memes/shut-it-down.gif";
import sweatingMeme from "../../../assets/memes/sweating.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 05 · crack, defend, disclaimer" },
    { from: "ramesh", text: "kim has the .cap. aircrack alone is not enough. it asks for a dictionary — a {yellow:wordlist}." },
    { from: "friday", text: "like a giant list of guesses?" },
    { from: "ramesh", text: "exactly. kali ships the famous one: {pink:rockyou.txt} — over 14 million real passwords from an old breach." },
  ],
  [
    {
      from: "system",
      terminal: {
        command: "sudo gunzip /usr/share/wordlists/rockyou.txt.gz",
        output: "{green:rockyou.txt ready.}",
      },
    },
    { from: "ramesh", text: "then:" },
    {
      from: "system",
      terminal: {
        command: "aircrack-ng -w rockyou.txt sally_handshake-01.cap",
        output: "testing keys against the handshake...",
      },
    },
    { from: "system", text: "each guess is combined with the handshake until one matches.", visual: "rockyou-crack" },
  ],
  [
    {
      from: "system",
      text: "KEY FOUND.",
      image: keyFoundImg,
      caption: "sally's password in plaintext · I love you",
      illustration: true,
    },
    { from: "friday", text: "I love you??? that was the wifi password??" },
    { from: "ramesh", text: "sits near the top of rockyou. aircrack hit it in a fraction of a second. four passwords tested." },
    { from: "friday", image: easyButtonMeme, caption: "weak password vs 14 million leaks" },
    { from: "friday", image: sweatingMeme, caption: "friday checking his own wifi password rn" },
  ],
  [
    { from: "ramesh", text: "kim now has the key to sally's entire home network. cracked from his living room. never touched her router. never touched her phone." },
    { from: "friday", image: mindBlownMeme, caption: "no cable. no contact. just a laptop." },
    { from: "ramesh", text: "once you're on someone's home wifi, damage goes further: watch devices, sniff unprotected traffic, reach router settings, abuse the connection — looking like just another neighbor." },
    { from: "friday", text: "one weak password opened all of that." },
  ],
  [
    { from: "friday", text: "so how does sally shut it down?" },
    { from: "ramesh", text: "five moves. number one is the real fix." },
    { from: "friday", image: shutItDownMeme, caption: "sally, finally changing the passphrase" },
    { from: "system", text: "defense checklist.", visual: "wifi-defense" },
    { from: "friday", image: shallNotPassMeme, caption: "long passphrase + wpa3 + pmf" },
  ],
  [
    { from: "ramesh", text: "do the first three well and an attack like kim's goes from minutes to practically impossible." },
    { from: "friday", text: "so if someone's wifi won't fall to rockyou..." },
    { from: "ramesh", text: "then they did the homework." },
    { from: "system", text: "read this twice.", visual: "smarter-neighbor" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "disclaimer",
        text: "if you are not able to hack the wifi, it means your neighbour is smarter and already knows a lot of stuff.\n\nalso: only test networks you own or have written permission to test. stay ethical.",
      },
    },
    { from: "friday", text: "ok. my takeaway: wifi is only as strong as its password. short romantic phrases are not a security strategy." },
    { from: "ramesh", text: "good. change yours tonight. then teach sally." },
    { from: "friday", image: hackermanMeme, caption: "friday, about to set a 5-word passphrase" },
    { from: "system", text: "wifi passwords module complete. stay ethical." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does aircrack-ng need besides the .cap file?",
    options: ["a wordlist / dictionary of password guesses", "sally's passport", "a printer", "bluetooth"],
    answer: 0,
    explanation: "-w points at the wordlist (e.g. rockyou).",
  },
  {
    question: "what is rockyou.txt?",
    options: [
      "a music playlist",
      "a huge list of real leaked passwords used for cracking demos",
      "a router brand",
      "an https certificate",
    ],
    answer: 1,
    explanation: "14M+ passwords from a historic breach, bundled with kali.",
  },
  {
    question: "sally's cracked password in the story was...",
    options: ["CorrectHorseBatteryStaple!", "I love you", "admin123 only", "WPA3-SECRET"],
    answer: 1,
    explanation: "a weak phrase near the top of rockyou.",
  },
  {
    question: "why did cracking finish so fast?",
    options: [
      "quantum computer",
      "the password was early in the wordlist",
      "wifi was off",
      "kim typed it manually",
    ],
    answer: 1,
    explanation: "common passwords are tested first.",
  },
  {
    question: "what is the #1 real fix?",
    options: ["hide SSID only", "use a long strong passphrase", "MAC filter only", "unplug the PC forever"],
    answer: 1,
    explanation: "not in any wordlist → offline attack hits a wall.",
  },
  {
    question: "WPA3 helps because...",
    options: [
      "it makes wifi free",
      "it resists this offline handshake cracking style better",
      "it removes passwords",
      "it disables routers",
    ],
    answer: 1,
    explanation: "newer standard designed against this class of attack.",
  },
  {
    question: "PMF / 802.11w helps by...",
    options: [
      "blocking the deauth kick trick",
      "making rockyou longer",
      "renaming the SSID",
      "buying a new phone",
    ],
    answer: 0,
    explanation: "protected management frames stop fake deauths.",
  },
  {
    question: "hiding the SSID or filtering MAC addresses...",
    options: ["fully stops aircrack", "does NOT stop this attack; both are easy to bypass", "is required by law", "deletes rockyou"],
    answer: 1,
    explanation: "myth busted in the defense list.",
  },
  {
    question: "the module disclaimer says if you can't hack the wifi...",
    options: [
      "the tools are broken",
      "your neighbour is smarter and already knows a lot of stuff",
      "you must try harder on their network anyway",
      "wifi does not exist",
    ],
    answer: 1,
    explanation: "strong neighbors configured strong wifi.",
  },
  {
    question: "when may you practice these techniques?",
    options: [
      "any cafe wifi",
      "only networks you own or have written permission to test",
      "any SSID that looks funny",
      "never learn defense",
    ],
    answer: 1,
    explanation: "ethics and law. education ≠ permission.",
  },
];

const notes = `# chapter 05 · crack, defend, disclaimer

> offtrck · wifi passwords module · study notes

## cracking
\`\`\`
gunzip /usr/share/wordlists/rockyou.txt.gz
aircrack-ng -w rockyou.txt sally_handshake-01.cap
\`\`\`
aircrack tests each wordlist candidate against the handshake until one matches → \`KEY FOUND!\`

in the story: password \`I love you\` fell almost instantly.

## after access risks
- map devices
- sniff unprotected traffic
- hit router admin if defaults remain
- abuse bandwidth while looking like a neighbor

## defense (do these)
1. **long strong passphrase** (best single fix)
2. **WPA3**
3. **PMF / 802.11w** (blocks deauth forcing)
4. change router admin password + update firmware
5. do NOT rely on hidden SSID / MAC filter alone

## disclaimer
if you are not able to hack the wifi, it means your neighbour is smarter and already knows a lot of stuff.

## ethics
educational only. written permission or your own lab.
`;

export const wifiChapterFive: Chapter = {
  title: "chapter 05",
  subtitle: "key found · defense",
  scenes,
  quiz,
  notes,
};
