import sessionOpenedMeme from "../../../assets/memes/session-opened.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · image trojan · chapter 05" },
    { from: "system", text: "💥 the click. then the quiet aftermath. then how not to be sally." },
  ],
  [
    { from: "sally", text: "downloads folder… there it is. picture.jpeg 🖼️" },
    {
      from: "system",
      dual: {
        kim: {
          title: "handler",
          prompt: "msf6 >",
          command: "# still waiting…",
          output: `[*] Started reverse TCP handler on 192.168.56.101:4444
[*] heartbeat… 🎣`,
        },
        sally: {
          mode: "downloads",
          title: "Downloads",
          hideExtensions: true,
          files: [
            { name: "notes.txt", icon: "image" },
            { name: "picture.jpeg", icon: "image", selected: true },
          ],
          note: "double-click incoming…",
        },
      },
    },
    { from: "sally", text: "trusting it completely… open! ✨" },
  ],
  [
    {
      from: "system",
      dual: {
        kim: {
          title: "meterpreter",
          prompt: "msf6 >",
          command: "# automatic",
          output: `[*] Sending stage (175686 bytes) to 192.168.56.104
[*] {green:Meterpreter session 1 opened} (192.168.56.101:4444 -> 192.168.56.104:49157)

{pink:kim is inside.} 🕶️`,
        },
        sally: {
          mode: "opened",
          title: "after click",
          note: "no photo. no popup. she shrugs and checks slack.",
        },
      },
    },
    { from: "kim", image: sessionOpenedMeme, caption: "session 1 opened · full control" },
    { from: "sally", text: "huh. photo didn't open? whatever, maybe a bad download 🤷‍♀️" },
    { from: "kim", text: "boom. tunnel is up. she sees nothing. i see everything." },
  ],
  [
    { from: "kim", text: "first look around." },
    {
      from: "kim",
      terminal: {
        title: "meterpreter",
        prompt: "meterpreter >",
        command: "sysinfo\ngetuid",
        output: `Computer        : SALLY-PC
OS              : {cyan:Windows 10} (10.0 Build 19045)
Architecture    : {yellow:x64}
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 2

Server username: SALLY-PC\\sally`,
      },
    },
    { from: "kim", text: "now i can browse files — photos, docs, whatever the account can touch. 📂" },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "recap",
        text: "kim forged a trojan 'photo' → pretended to be bob → sally clicked → meterpreter.\nsimple. sneaky. scary.",
      },
    },
  ],
  [
    { from: "system", text: "how to not live this plotline.", visual: "trojan-defense" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "defense checklist",
        text: "👁️ show file extensions\n📎 never open weird attachments — even from 'friends'\n🛡️ realtime antivirus\n👑 avoid running as admin\n🧪 open unknowns in a vm/sandbox",
      },
    },
    { from: "sally", text: "…i'm enabling file extensions right now. 😤" },
    { from: "kim", text: "good. trust is a feature. verify is a habit." },
    { from: "system", text: "image trojan module complete. stay ethical." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "when sally double-clicks, kim sees…",
    options: ["a sunset slideshow", "a meterpreter session open", "his wifi die", "nothing ever"],
    answer: 1,
    explanation: "Reverse shell connects to the handler.",
  },
  {
    question: "on sally's screen after the click…",
    options: ["a huge virus banner always", "often nothing obvious — silence", "bob calls her", "windows deletes itself"],
    answer: 1,
    explanation: "Trojans can be quiet.",
  },
  {
    question: "sysinfo helps kim…",
    options: ["edit the sunset", "learn OS/arch/users to plan next moves", "send flowers", "fix the coffee machine"],
    answer: 1,
    explanation: "Recon inside the compromised host.",
  },
  {
    question: "a key windows hardening step is…",
    options: ["hide more extensions", "show file name extensions", "disable all photos forever", "uninstall mail"],
    answer: 1,
    explanation: "Spot .exe hiding behind .jpeg.",
  },
  {
    question: "unexpected attachments from friends should be…",
    options: ["opened immediately", "treated carefully — verify before opening", "forwarded to everyone", "renamed to .exe on purpose"],
    answer: 1,
    explanation: "Trust can be spoofed.",
  },
  {
    question: "safer place to open a suspicious file…",
    options: ["as domain admin on the laptop", "in a vm or sandbox", "on the company domain controller", "in recycling bin execution mode"],
    answer: 1,
    explanation: "Isolate the blast radius.",
  },
];

const notes = `
> offtrck · image trojan · study notes
> chapter 05 · click, session, defense

## kill chain (this story)
1. msfvenom → picture.exe
2. rename → picture.jpeg.exe
3. multi/handler listening
4. fake bob email
5. sally opens "jpeg"
6. meterpreter session
7. sysinfo / file access

## after access
attacker can gather system info and browse files the user can reach.

## defenses
1. **Show file extensions**
2. Don't open unexpected attachments (verify out-of-band)
3. Realtime antivirus
4. Don't run as admin daily
5. Sandbox / VM for unknowns

## ethics
only on systems you own or have written permission to test.
`;

export const trojanChapterFive: Chapter = {
  title: "chapter 05",
  subtitle: "click · session · defense",
  scenes,
  quiz,
  notes,
};
