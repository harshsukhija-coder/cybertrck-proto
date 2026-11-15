import knockKnockMeme from "../../../assets/memes/knock-knock.gif";
import imInMeme from "../../../assets/memes/im-in.gif";
import surprisedPikachuMeme from "../../../assets/memes/surprised-pikachu.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 04 · forced reconnect · deauth" },
    { from: "ramesh", text: "recap: ears open. sally found. recording on. a device is already connected. missing piece: handshake." },
    { from: "friday", text: "and instead of waiting, he kicks the device off?" },
    { from: "ramesh", text: "with {red:deauthentication} packets. fake messages that say 'the router wants you gone.'" },
    { from: "friday", image: knockKnockMeme, caption: "deauth packets, knocking devices offline" },
  ],
  [
    { from: "ramesh", text: "tool: {yellow:aireplay-ng}. second terminal. airodump keeps listening in the first." },
    { from: "system", text: "kick → reconnect → handshake lands in the capture.", visual: "deauth-kick" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "reading the deauth command",
        text: "{red:--deauth 10} → send 10 kick packets\n{pink:-a} → router BSSID\n{cyan:-c} → target client MAC\n{yellow:wlan0mon} → listening card",
      },
    },
  ],
  [
    { from: "ramesh", text: "sally's phone believes it, drops for a split second, then reconnects because 'connect automatically' is on. that reconnection performs the handshake — straight into kim's recording." },
    { from: "friday", text: "that's evil. and clever. mostly evil." },
    { from: "ramesh", text: "that's why defenders enable protected management frames later. watch the listening terminal..." },
    { from: "system", text: "three words kim was waiting for.", visual: "handshake-caught" },
    { from: "friday", image: imInMeme, caption: "WPA handshake: captured" },
  ],
  [
    { from: "friday", text: "EAPOL in the notes column — those are the handshake packets?" },
    { from: "ramesh", text: "yes. extensible authentication protocol over LAN. the scrambled messages from the reconnect." },
    { from: "ramesh", text: "on disk he has files named sally_handshake. the one that matters: {yellow:sally_handshake-01.cap}." },
    { from: "friday", text: "so he has the password now?" },
    { from: "ramesh", text: "no. he has the {pink:sealed envelope}. proof of the password. not the password." },
    { from: "friday", image: surprisedPikachuMeme, caption: "friday realizing capture ≠ crack" },
  ],
  [
    { from: "ramesh", text: "dangerous part: he can pack up, leave the street, and open that envelope offline on his own computer. all the time in the world. no more contact with sally." },
    { from: "friday", text: "so the hard part is over?" },
    { from: "ramesh", text: "the hard part for the street is over. the hard part for sally's password is about to begin." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "aircrack-ng meets a 14-million-password wordlist called {pink:rockyou}. one weak phrase near the top will fall in seconds — and the key will print in plaintext.",
      },
    },
    { from: "system", text: "chapter 4 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does a deauth packet pretend?",
    options: [
      "the password is wrong",
      "the router told the device to leave",
      "the isp is offline",
      "https failed",
    ],
    answer: 1,
    explanation: "spoofed management frames that kick the client.",
  },
  {
    question: "which tool sends deauth in this story?",
    options: ["airodump-ng", "aireplay-ng", "airmon-ng", "git"],
    answer: 1,
    explanation: "aireplay-ng --deauth ...",
  },
  {
    question: "why does the phone reconnect on its own?",
    options: [
      "kim typed the password",
      "saved network + connect automatically",
      "wpa3 forces it",
      "rockyou forces it",
    ],
    answer: 1,
    explanation: "devices auto-rejoin known SSIDs.",
  },
  {
    question: "what appears in airodump when capture succeeds?",
    options: ["GAME OVER", "WPA handshake: <BSSID>", "404", "sudo denied"],
    answer: 1,
    explanation: "top status shows WPA handshake captured.",
  },
  {
    question: "EAPOL frames are...",
    options: ["cat videos", "the handshake packets", "router firmware", "wordlist lines"],
    answer: 1,
    explanation: "Extensible Authentication Protocol over LAN.",
  },
  {
    question: "which capture file matters most here?",
    options: [".jpg selfie", "sally_handshake-01.cap", "rockyou.txt.gz only", "package.json"],
    answer: 1,
    explanation: ".cap holds the handshake.",
  },
  {
    question: "after capture, does kim have the plaintext password?",
    options: ["yes immediately", "no, only the sealed proof", "yes if WPA3", "only on tuesdays"],
    answer: 1,
    explanation: "handshake ≠ password. cracking is next.",
  },
  {
    question: "why can kim leave the street after capture?",
    options: [
      "because cracking is offline against the file",
      "because the router follows him",
      "because deauth never stops",
      "because airodump emails the password",
    ],
    answer: 0,
    explanation: "offline attack needs only the .cap + wordlist.",
  },
  {
    question: "in aireplay, -a and -c are...",
    options: ["router BSSID and client MAC", "channel and password", "two wordlists", "two SSIDs"],
    answer: 0,
    explanation: "-a access point, -c client station.",
  },
  {
    question: "what will open the sealed envelope next?",
    options: ["paint.exe", "aircrack-ng + a wordlist", "the dishwasher", "nmap -sn"],
    answer: 1,
    explanation: "dictionary attack against the handshake.",
  },
];

const notes = `# chapter 04 · deauth & handshake capture

> offtrck · wifi passwords module · study notes

## idea
can't force "connect", but can force **disconnect** → device reconnects → handshake appears.

## command shape
\`\`\`
sudo aireplay-ng --deauth 10 -a <router_bssid> -c <client_mac> wlan0mon
\`\`\`
keep airodump running in another terminal with \`-w\`.

## success signals
- airodump header: \`WPA handshake: <BSSID>\`
- station notes: EAPOL
- file: \`*-01.cap\`

## important
handshake is a **sealed proof**, not plaintext.
attacker can leave and crack offline.

## what's next
rockyou wordlist + aircrack-ng.
`;

export const wifiChapterFour: Chapter = {
  title: "chapter 04",
  subtitle: "deauth & capture",
  scenes,
  quiz,
  notes,
};
