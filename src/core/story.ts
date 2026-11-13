import confusedMeme from "../assets/memes/confused.gif";
import hackermanMeme from "../assets/memes/hackerman.gif";
import thisIsFineMeme from "../assets/memes/this-is-fine.gif";

export type Speaker = "system" | "friday" | "ramesh" | "you";

export type StoryMessage = {
  from: Speaker;
  text?: string;
  image?: string;
  caption?: string;
};

export type Scene = StoryMessage[];

export const speakers: Record<Speaker, { name: string; color: string }> = {
  system: { name: "system", color: "#00FF9C" },
  friday: { name: "friday", color: "#FFB000" },
  ramesh: { name: "ramesh", color: "#22D3EE" },
  you: { name: "you", color: "#E2E8F0" },
};

export const story: Scene[] = [
  [
    { from: "system", text: "connecting to office network 192.168.1.0/24 ..." },
    { from: "system", text: "every network reveals secrets, if you know how to listen." },
  ],
  [
    { from: "friday", text: "hey! i'm friday." },
    { from: "friday", text: "i just joined a small startup. 12 people and one very tired coffee machine." },
    { from: "friday", text: "my job? keep the office network running." },
  ],
  [
    { from: "friday", text: "we have a handful of devices here. laptops, a printer, the wifi router, and a storage box nobody remembers setting up." },
    { from: "ramesh", text: "nice. and do you know what each of them is saying about itself?" },
    { from: "friday", text: "saying??", image: confusedMeme, caption: "devices can talk?" },
  ],
  [
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
    { from: "ramesh", text: "and nmap is the tool we use to read that map.", image: hackermanMeme, caption: "you, after this course" },
    { from: "system", text: "chapter 1 complete." },
  ],
];
