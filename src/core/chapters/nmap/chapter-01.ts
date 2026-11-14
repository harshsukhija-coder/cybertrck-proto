import confusedMeme from "../../../assets/memes/confused.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import toyLaptopHackerMeme from "../../../assets/memes/toy-laptop-hacker.gif";
import turnItOffAndOnMeme from "../../../assets/memes/turn-it-off-and-on.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "connecting to office network {cyan:192.168.1.0/24} ..." },
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
    { from: "friday", text: "'friday, why is the wifi so slow? and what is {red:DESKTOP-X7Q}?'" },
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
    { from: "ramesh", text: "{green:ethical hacker} = i break in with permission, so the bad guys can't break in without it." },
  ],
  // Back to the network
  [
    { from: "ramesh", text: "first question. what's actually on your network?" },
    { from: "friday", text: "uh... two {cyan:laptops}, an {blue:hp printer}, the {yellow:netgear router}, our {red:web server} with the {red:mysql} database, and a {purple:synology nas} box for files. oh, and now {red:DESKTOP-X7Q}." },
    { from: "system", text: "here's friday's office as a picture. everything talks through the router.", visual: "office-network" },
  ],
  [
    { from: "ramesh", text: "see how every line goes through the {yellow:router}? it's the post office of the network. every message passes through it." },
    { from: "ramesh", text: "and do you know what each of those devices is saying about itself?" },
  ],
  [
    { from: "friday", text: "saying?? devices can talk?" },
    { from: "ramesh", text: "every device on a network leaves a trace. it can't help it." },
    { from: "ramesh", text: "think of the network as a {cyan:street}, and every device as a {yellow:house} on it." },
  ],
  [
    { from: "ramesh", text: "trace #1 -> {pink:ip address}. the house number. like {pink:192.168.1.23}" },
    { from: "ramesh", text: "trace #2 -> {green:open ports}. the doors of the house. some are locked, some are wide open." },
  ],
  [
    { from: "ramesh", text: "trace #3 -> {orange:services + version}. who opens the door, and how old they are. like {orange:'OpenSSH 7.2'} or {orange:'nginx 1.18'}" },
    { from: "ramesh", text: "trace #4 -> {purple:operating system}. what the house is built with. windows, linux, macos..." },
    { from: "system", callout: { tone: "tip", title: "the 4 traces", text: "{pink:ip address} -> where it lives\n{green:open ports} -> which doors exist\n{orange:service + version} -> who answers, and how old they are\n{purple:operating system} -> what the house is built with" } },
  ],
  [
    { from: "friday", text: "wait... so anyone on our wifi can see all of that?" },
    { from: "friday", image: thisIsFineMeme, caption: "me, looking at our network right now" },
  ],
  [
    { from: "ramesh", text: "yep. a network is not a mystery. it's an open map." },
    { from: "ramesh", text: "and {green:nmap} is the tool we use to read it. let's find out who DESKTOP-X7Q really is.", image: hackermanMeme, caption: "you, after this course" },
    { from: "system", text: "chapter 1 complete. next: know your network." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what is friday's real job at chaibyte?",
    options: ["IT manager", "junior developer", "ethical hacker", "CEO"],
    answer: 1,
    explanation: "he writes code. he's only 'the IT guy' because he restarted the router once.",
  },
  {
    question: "which device did nobody recognise on the office network?",
    options: ["the printer", "the netgear router", "DESKTOP-X7Q", "the synology nas"],
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
    question: "in friday's office, which device does every message pass through?",
    options: ["the printer", "the synology nas", "the netgear router", "the boss's laptop"],
    answer: 2,
    explanation: "the router sits in the middle. it's the post office of the network.",
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

const notes = `# chapter 01 · the unknown device

> offtrck · nmap module · study notes

## the story so far
friday is a junior developer at chaibyte (12 people). a device called **DESKTOP-X7Q** appeared on the office network and nobody knows what it is. ramesh, an ethical hacker, is going to teach him how to read the network with **nmap**.

## what is on a small office network?
| device | what it does | why an attacker cares |
|---|---|---|
| netgear router | connects the office to the internet, hands out ip addresses (DHCP), runs the wifi | it sees all traffic and its admin panel controls everything |
| laptops | daily work machines | full of passwords, browser sessions and files |
| hp printer | printing and scanning | printers run old software, store scanned documents and are rarely updated |
| web server (mysql) | hosts the company website and its database | databases hold customer data, the jackpot |
| synology nas | shared file storage | backups and documents in one place |

**key idea:** every device talks through the router. that's why one network is like one street: everyone shares it.

## the 4 traces every device leaves
1. **ip address**: the house number. inside an office it looks like \`192.168.1.23\`.
2. **open ports**: the doors. a port number (0-65535) is a door a program listens behind. port 80 = web, 22 = ssh, 3306 = mysql.
3. **service + version**: who answers the door and how old they are, e.g. \`OpenSSH 7.2\`. old versions often have publicly known bugs (CVEs).
4. **operating system**: windows, linux, macos, or an embedded os on printers and routers.

## going deeper
- **why "it can't help it"?** to communicate, a device must answer packets. the way it answers (which ports reply, what banners say, how the TCP/IP stack behaves) leaks information. nmap just asks politely and listens very carefully.
- **unknown devices are a real risk.** security people call them *shadow IT*: devices installed without IT knowing. they are usually unpatched and unmonitored, which makes them perfect entry points.
- **ethical vs malicious hacking.** the techniques are identical. the difference is *written permission* and a defined *scope* (which ips, which dates, which tests). professionals call this a "rules of engagement" document.
- **asset inventory** is step zero of security. you can't protect what you don't know exists. scanning your own network regularly is how teams build that inventory.

## what is nmap?
nmap ("network mapper") is a free, open-source tool created by Gordon Lyon (Fyodor) in 1997. it discovers hosts, open ports, running services, versions and operating systems. it's used by sysadmins, pentesters, and yes, attackers. it even appeared in *The Matrix Reloaded*.

## remember
- a network is not a mystery, it's an open map.
- every device leaves 4 traces: ip, ports, services/versions, os.
- only scan networks you own or have written permission to scan.
`;

export const chapterOne: Chapter = { title: "chapter 01", subtitle: "the unknown device", scenes, quiz, notes };
