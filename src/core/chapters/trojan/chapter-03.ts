import trustJpegMeme from "../../../assets/memes/trust-the-jpeg.jpg";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · image trojan · chapter 03" },
    { from: "system", text: "🎭 costume change. the exe learns to cosplay as a jpeg." },
  ],
  [
    { from: "kim", text: "nobody double-clicks picture.exe on purpose. so we rename." },
    {
      from: "system",
      dual: {
        kim: {
          title: "disguise",
          prompt: "kim@kali:~$",
          command: "mv picture.exe picture.jpeg.exe\nls -l picture.jpeg.exe",
          output: `-rw-r--r-- 1 kim kim 73802 picture.jpeg.exe

{pink:still an executable.} name now contains "jpeg" to trick the eyes.`,
        },
        sally: {
          mode: "downloads",
          title: "preview · if extensions hidden",
          hideExtensions: true,
          files: [{ name: "picture.jpeg", icon: "image", selected: true }],
          note: "sally would see this — not picture.jpeg.exe",
        },
      },
    },
    { from: "sally", text: "that just looks like a normal photo file to me 🖼️" },
    { from: "kim", text: "exactly. windows hides known extensions by default. the real type is still {red:.exe}." },
  ],
  [
    { from: "system", text: "the danger in one glance.", visual: "extension-trick" },
    { from: "kim", text: "picture.jpeg.exe → she sees picture.jpeg. last extension wins for the OS. costume wins for the human." },
    { from: "friday", image: trustJpegMeme, caption: "brain: it's a jpeg · os: it's an exe" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "default windows setting",
        text: "hiding extensions is convenience for users — and camouflage for attackers.\nalways {cyan:show file name extensions}.",
      },
    },
    { from: "kim", text: "file is ready. but a trojan without a listener is a knock with nobody home." },
    { from: "kim", text: "next: metasploit multi/handler — my walkie-talkie on port 4444. 📡" },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "kim arms the listener. then he writes a fake bob email. sally's inbox is about to get warm.",
      },
    },
    { from: "system", text: "chapter 3 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "kim renames picture.exe to…",
    options: ["vacation.png.txt", "picture.jpeg.exe", "sally.dll", "readme.md"],
    answer: 1,
    explanation: "Double extension disguise.",
  },
  {
    question: "windows by default often…",
    options: ["shows every extension", "hides known file extensions", "blocks all jpegs", "renames files randomly"],
    answer: 1,
    explanation: "Hidden extensions make picture.jpeg.exe look like picture.jpeg.",
  },
  {
    question: "what sally typically sees is…",
    options: ["picture.jpeg.exe", "picture.jpeg", "a virus alert always", "nothing"],
    answer: 1,
    explanation: ".exe is hidden from view.",
  },
  {
    question: "which extension does windows actually run?",
    options: ["the first one (.jpeg)", "the last one (.exe)", "whichever is prettier", "none"],
    answer: 1,
    explanation: "Real type is the final extension.",
  },
  {
    question: "best user defense mentioned here…",
    options: ["delete windows", "show file name extensions", "never download photos", "use comic sans"],
    answer: 1,
    explanation: "See the real .exe.",
  },
  {
    question: "after disguising, kim still needs…",
    options: ["a listener waiting for the reverse shell", "a printer", "sally's password written down", "a new isp"],
    answer: 0,
    explanation: "Multi/handler next.",
  },
];

const notes = `
> offtrck · image trojan · study notes
> chapter 03 · the disguise

## rename trick
\`\`\`
mv picture.exe picture.jpeg.exe
\`\`\`

## why it works
windows **hides known extensions** by default.
user sees: \`picture.jpeg\`
os runs: \`.exe\`

## defense
File Explorer → View → **File name extensions** ✅

## what's next
msfconsole listener + social engineering email.
`;

export const trojanChapterThree: Chapter = {
  title: "chapter 03",
  subtitle: "the disguise",
  scenes,
  quiz,
  notes,
};
