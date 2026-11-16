import shallNotPass from "../../../assets/memes/shall-not-pass.gif";
import epicHandshake from "../../../assets/memes/epic-handshake.gif";
import csiSunglasses from "../../../assets/memes/csi-sunglasses.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · man in the middle · chapter 05" },
    { from: "system", text: "🛡️ tone: armor-up montage. less doom. more habits." },
  ],
  [
    { from: "ramesh", text: "no single spell stops every mitm. you {cyan:stack} habits." },
    { from: "system", visual: "mitm-defense" },
  ],
  [
    { from: "ramesh", text: "most important: {green:HTTPS}. lock in the address bar. traffic scrambled end-to-end with the real site." },
    {
      from: "system",
      dual: {
        kim: {
          title: "https wall",
          prompt: "kim@kali:~$",
          command: "tcpdump -A 'tcp port 443' | head",
          output: `...{yellow:r8s#@@!!...nonsense...}...
{red:[-]} ciphertext only · no password candy today`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "bank.example.com/login",
            secure: true,
            heading: "Sign in · secure",
            body: "🔒 https://bank.example.com\n\npassword box · lock visible · kim sees noise",
          },
          note: "sally finally checks the lock 🔒",
        },
      },
    },
    { from: "system", image: shallNotPass, caption: "plaintext shall not pass" },
  ],
  [
    { from: "ramesh", text: "HTTPS also proves you're talking to the {cyan:right} site. cert warnings are not decoration." },
    {
      from: "system",
      dual: {
        kim: {
          title: "fake cert attempt",
          prompt: "kim@kali:~$",
          command: "# try to terminate tls with a bogus cert",
          output: `{yellow:[!]} browser should scream
{red:[-]} only works if the human clicks through anyway`,
        },
        sally: {
          mode: "cert",
          title: "chrome",
          certHost: "bank.example.com",
          note: "correct move: Back to safety · never 'Advanced → proceed'",
        },
      },
    },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "connection is not private",
        text: "that warning can mean someone is trying to intercept you. treat it like a slammed door.",
      },
    },
  ],
  [
    { from: "ramesh", text: "next: {green:VPN}. encrypts {cyan:all} your traffic in a tunnel — not just one tab. gold on public wifi." },
    { from: "ramesh", text: "then {green:MFA}. even if a password leaks, kim still needs the second factor from your phone. 📱" },
    { from: "jules", text: "and i'm putting a password on Bean&Byte, killing auto-join posters, and judging open networks from now on 😤" },
    { from: "system", image: epicHandshake, caption: "https + vpn + mfa + skepticism" },
  ],
  [
    { from: "ramesh", text: "recap: mitm = secret middle seat. doors: evil twin or ARP poison. powers: listen, change, hijack. shields: https, cert respect, vpn, mfa, careful wifi." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "legal line",
        text: "intercepting other people's traffic on a network you don't own is illegal in most places. pros only test with written permission.",
      },
    },
    { from: "kim", text: "study the moves. don't steal the mail. 💌" },
    { from: "sally", text: "lock icon checked. vpn on. auto-join off. jules gets a tip. ☕✨" },
    { from: "friday", image: csiSunglasses, caption: "friday · puts on the sunglasses anyway" },
    { from: "ramesh", text: "that's the module, friday. next time free wifi asks for a hug — ask what it wants in return." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "the most important everyday mitm shield is…",
    options: ["comic sans", "HTTPS (and the lock)", "louder wifi", "closing one eye"],
    answer: 1,
    explanation: "encrypted channel to the real site kills most postcard reading.",
  },
  {
    question: "a certificate warning means you should…",
    options: ["click through ASAP", "stop — it may signal interception", "download more toolbars", "ask the toaster"],
    answer: 1,
    explanation: "don't ignore 'connection is not private'.",
  },
  {
    question: "a VPN helps on public wifi by…",
    options: ["making coffee", "encrypting all traffic in a tunnel", "renaming the SSID", "deleting ARP forever"],
    answer: 1,
    explanation: "attacker may see tunnel packets, not the insides.",
  },
  {
    question: "intercepting strangers' traffic without permission is…",
    options: ["a fun weekend hobby", "illegal in most countries", "required by https", "jules' special"],
    answer: 1,
    explanation: "learn defensively; test only with authorization.",
  },
];

const notes = `# man in the middle · chapter 05 — armor up

## defense stack
1. **HTTPS** — lock icon · encrypts browser ↔ site
2. **Certificate warnings** — don't click through
3. **VPN** — encrypts all traffic on hostile networks
4. **MFA** — password theft ≠ account theft
5. **Public wifi hygiene** — avoid open nets · disable auto-join

## recap
- MITM = attacker between you and the service
- Get middle via **evil twin** or **ARP spoof**
- Then eavesdrop / modify / hijack sessions
- Encryption + habits remove most of their power

## law
Unauthorized interception is illegal. Authorized testing only.
`;

export const mitmChapterFive: Chapter = {
  title: "armor up",
  subtitle: "https · warnings · vpn · mfa · don't auto-join",
  scenes,
  quiz,
  notes,
};
