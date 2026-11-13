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

export const speakers: Record<Speaker, { name: string; color: string }> = {
  system: { name: "system", color: "#3DDC84" },
  friday: { name: "friday", color: "#C9A35A" },
  ramesh: { name: "ramesh", color: "#6FA8B8" },
  you: { name: "you", color: "#A1A8B0" },
};

export const story: Scene[] = [
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
