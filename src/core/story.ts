import confusedMeme from "../assets/memes/confused.gif";
import hackermanMeme from "../assets/memes/hackerman.gif";
import thisIsFineMeme from "../assets/memes/this-is-fine.gif";
import toyLaptopHackerMeme from "../assets/memes/toy-laptop-hacker.gif";
import turnItOffAndOnMeme from "../assets/memes/turn-it-off-and-on.gif";

export type Speaker = "system" | "friday" | "ramesh" | "you";

export type StoryMessage = {
  from: Speaker;
  text?: string;
  image?: string;
  caption?: string;
};

export type Scene = StoryMessage[];

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Chapter = {
  title: string;
  subtitle: string;
  scenes: Scene[];
  quiz?: QuizQuestion[];
};

export const PASS_SCORE = 0.9;

export const speakers: Record<Speaker, { name: string; color: string }> = {
  system: { name: "system", color: "#3DDC84" },
  friday: { name: "friday", color: "#C9A35A" },
  ramesh: { name: "ramesh", color: "#6FA8B8" },
  you: { name: "you", color: "#A1A8B0" },
};

const chapterOneScenes: Scene[] = [
  [
    { from: "system", text: "connecting to office network 192.168.1.0/24 ..." },
    { from: "system", text: "every network reveals secrets, if you know how to listen." },
  ],
  // Meet friday
  [
    { from: "system", text: "[profile] friday · 23 · junior developer at chaibyte, a 12-person startup" },
    { from: "friday", text: "hi, i'm friday. officially, i write code." },
    { from: "friday", text: "unofficially, i'm 'the IT guy'. i fixed the wifi once by restarting the router, and now everyone calls me.", image: turnItOffAndOnMeme, caption: "my entire IT training" },
  ],
  // The problem
  [
    { from: "friday", text: "this morning my boss walked up to my desk." },
    { from: "friday", text: "'friday, why is the wifi so slow? and what is DESKTOP-X7Q?'" },
    { from: "friday", text: "i have never seen DESKTOP-X7Q in my life.", image: confusedMeme, caption: "me, staring at the router admin page" },
  ],
  // Meet ramesh
  [
    { from: "friday", text: "so i called the only hacker i know. my college senior." },
    { from: "system", text: "[profile] ramesh · 27 · ethical hacker. companies pay him to break into their systems, legally." },
    { from: "ramesh", text: "friday! long time. let me guess... something is broken?" },
  ],
  [
    { from: "ramesh", text: "relax. i hack things for a living. the good kind.", image: toyLaptopHackerMeme, caption: "how ramesh thinks he looks while hacking" },
    { from: "friday", text: "wait, there's a good kind?" },
    { from: "ramesh", text: "ethical hacker = i break in with permission, so the bad guys can't break in without it." },
  ],
  // Back to the network
  [
    { from: "ramesh", text: "first question. how many devices are on your network?" },
    { from: "friday", text: "a handful? laptops, a printer, the wifi router, a storage box nobody remembers setting up... and now DESKTOP-X7Q." },
    { from: "ramesh", text: "and do you know what each of them is saying about itself?" },
  ],
  [
    { from: "friday", text: "saying?? devices can talk?" },
    { from: "ramesh", text: "every device on a network leaves a trace. it can't help it." },
    { from: "ramesh", text: "think of the network as a street, and every device as a house on it." },
  ],
  [
    { from: "ramesh", text: "trace #1 -> ip address. the house number. like 192.168.1.23" },
    { from: "ramesh", text: "trace #2 -> open ports. the doors of the house. some are locked, some are wide open." },
  ],
  [
    { from: "ramesh", text: "trace #3 -> services + version. who opens the door, and how old they are. like 'OpenSSH 7.2' or 'nginx 1.18'" },
    { from: "ramesh", text: "trace #4 -> operating system. what the house is built with. windows, linux, macos..." },
  ],
  [
    { from: "friday", text: "wait... so anyone on our wifi can see all of that?" },
    { from: "friday", image: thisIsFineMeme, caption: "me, looking at our network right now" },
  ],
  [
    { from: "ramesh", text: "yep. a network is not a mystery. it's an open map." },
    { from: "ramesh", text: "and nmap is the tool we use to read it. let's find out who DESKTOP-X7Q really is.", image: hackermanMeme, caption: "you, after this course" },
    { from: "system", text: "chapter 1 complete. next: your first scan." },
  ],
];

const chapterOneQuiz: QuizQuestion[] = [
  {
    question: "what is friday's real job at chaibyte?",
    options: ["IT manager", "junior developer", "ethical hacker", "CEO"],
    answer: 1,
    explanation: "he writes code. he's only 'the IT guy' because he restarted the router once.",
  },
  {
    question: "which device did nobody recognise on the office network?",
    options: ["the printer", "the wifi router", "DESKTOP-X7Q", "the storage box"],
    answer: 2,
    explanation: "DESKTOP-X7Q showed up and nobody knew whose it was.",
  },
  {
    question: "what does an ethical hacker do?",
    options: [
      "breaks into systems without permission",
      "breaks in with permission, so the bad guys can't",
      "fixes printers for a living",
      "sells stolen passwords",
    ],
    answer: 1,
    explanation: "same skills as a bad hacker, but with permission and paperwork.",
  },
  {
    question: "in ramesh's example the network is a street. what is each device?",
    options: ["a car", "a traffic light", "a shop sign", "a house"],
    answer: 3,
    explanation: "every device is a house on the street.",
  },
  {
    question: "which trace is the 'house number' of a device?",
    options: ["its ip address", "its operating system", "its open ports", "its service version"],
    answer: 0,
    explanation: "the ip address tells you where the device lives, like 192.168.1.23.",
  },
  {
    question: "in the house example, what are open ports?",
    options: ["the roof", "the doors", "the street name", "the paint colour"],
    answer: 1,
    explanation: "ports are doors. some are locked, some are wide open.",
  },
  {
    question: "'OpenSSH 7.2' is an example of which trace?",
    options: ["ip address", "operating system", "service + version", "open port"],
    answer: 2,
    explanation: "it tells you who answers the door (OpenSSH) and how old it is (7.2).",
  },
  {
    question: "windows, linux and macos are examples of which trace?",
    options: ["operating system", "service + version", "ip address", "open port"],
    answer: 0,
    explanation: "the operating system is what the house is built with.",
  },
  {
    question: "which of these could be a device in friday's office network (192.168.1.0/24)?",
    options: ["8.8.8.8", "999.1.1.1", "DESKTOP-X7Q.com", "192.168.1.23"],
    answer: 3,
    explanation: "office devices live at 192.168.1.something.",
  },
  {
    question: "what is nmap used for?",
    options: [
      "making the wifi faster",
      "deleting viruses",
      "reading the network map: finding devices and what they reveal",
      "sending memes to the boss",
    ],
    answer: 2,
    explanation: "nmap finds devices and reads the traces they leave.",
  },
];

const chapterTwoScenes: Scene[] = [
  [
    { from: "system", text: "chapter 2 · your first scan" },
    { from: "ramesh", text: "welcome back. you passed the test, so you're officially less confused than friday." },
    { from: "friday", text: "hey! ...fair." },
  ],
  [
    { from: "ramesh", text: "first, nmap needs to know where to look. friday's office network is 192.168.1.0/24." },
    { from: "friday", text: "what does the /24 mean?" },
  ],
  [
    { from: "ramesh", text: "it means every address from 192.168.1.0 to 192.168.1.255. 256 houses on one street." },
    { from: "ramesh", text: "next, we knock on every door on that street, and find out where DESKTOP-X7Q lives." },
    { from: "system", text: "chapter 2 continues soon." },
  ],
];

export const chapters: Chapter[] = [
  { title: "chapter 01", subtitle: "the unknown device", scenes: chapterOneScenes, quiz: chapterOneQuiz },
  { title: "chapter 02", subtitle: "your first scan", scenes: chapterTwoScenes },
];
