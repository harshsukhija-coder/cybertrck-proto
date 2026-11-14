import fridayAvatar from "../../../assets/characters/friday.jpg";
import rameshAvatar from "../../../assets/characters/ramesh.jpg";
import httpNotSecure from "../../../assets/encryption/http-not-secure.jpg";
import httpPostcard from "../../../assets/encryption/http-postcard.jpg";
import httpsSecure from "../../../assets/encryption/https-secure.jpg";
import peekingMeme from "../../../assets/memes/peeking.gif";
import sneakyHomerMeme from "../../../assets/memes/sneaky-homer.gif";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · encryption · chapter 01" },
    { from: "system", text: "before the first secret: meet the two people in this module again." },
  ],
  [
    {
      from: "system",
      text: "[profile] friday · 23 · junior developer at chaibyte. good at shipping features. bad at spotting unsafe links. after nmap he can find devices... crypto is still new.",
      image: fridayAvatar,
      caption: "friday · the learner",
    },
    { from: "friday", text: "hi again. i write code. people still call me when wifi dies. i do not pretend i understand encryption yet." },
  ],
  [
    {
      from: "system",
      text: "[profile] ramesh · 27 · ethical hacker. he breaks systems with permission for a living, then teaches teams how to lock them properly. encryption is daily bread for him.",
      image: rameshAvatar,
      caption: "ramesh · the expert",
    },
    { from: "ramesh", text: "friday. if you are about to send a password over a weird looking link, stop and call me first." },
    { from: "friday", text: "...about that." },
  ],
  [
    { from: "friday", text: "our contractor {cyan:Dev} needs the temporary admin password for the staging panel. i found the old login page and was about to paste it." },
    { from: "friday", text: "look at my screen. is this fine?" },
    {
      from: "system",
      text: "friday's browser. read the address bar carefully.",
      image: httpNotSecure,
      caption: "http://... · Not Secure · no padlock",
      illustration: true,
    },
  ],
  [
    { from: "ramesh", text: "stop. stop stop stop. that red warning. {red:Not Secure}. and the url starts with {red:http}, not https." },
    { from: "friday", text: "but the page loads. the form works. i can type the password and hit enter." },
    { from: "ramesh", text: "it 'works' the same way shouting your bank pin across a crowded cafe 'works'. the waiter hears it. the next table hears it." },
    { from: "friday", image: thisIsFineMeme, caption: "friday, one second before ramesh grabbed the mouse" },
  ],
  [
    { from: "friday", text: "ok show me the safe version so i know what i should have opened." },
    {
      from: "system",
      text: "same site idea, but locked.",
      image: httpsSecure,
      caption: "https://... · padlock on · this is what you want",
      illustration: true,
    },
    { from: "ramesh", text: "see the difference? {green:https} + padlock. that is the browser telling you the connection is wrapped. we will learn how that wrap works. first: why http is dangerous." },
    { from: "system", text: "side by side, the rule is simple.", visual: "http-vs-https" },
  ],
  [
    { from: "friday", text: "it's just our staging site though. what's the worst that happens?" },
    { from: "ramesh", text: "imagine the message is something sensitive. a {pink:bank instruction}. a {red:password}. a one-time code. anything you would not read out loud on the metro." },
    { from: "friday", text: "and that message has to travel across a network we do not control?" },
    { from: "ramesh", text: "yes. your wifi to the coffee shop router. the coffee shop to the ISP. the ISP across the public internet. then to Dev's office. we own maybe one hop of that." },
  ],
  [
    { from: "friday", text: "i still don't get how someone in the middle reads it. can you draw it?" },
    { from: "ramesh", text: "three networks. yours. the middle we cannot trust. Dev's. watch the pink packet." },
    { from: "system", text: "a private message crossing an open middle.", visual: "internet-path" },
  ],
  [
    { from: "friday", text: "wait. the person in the middle... they can just {red:copy} the packet? they don't even stop it?" },
    { from: "ramesh", text: "yep. that's called {orange:eavesdropping} or packet sniffing. the message still arrives. Dev gets it. you think everything is fine. and a stranger already read it." },
    {
      from: "system",
      text: "http is basically a postcard. anyone along the path can read the writing.",
      image: httpPostcard,
      caption: "plaintext on the wire = an open postcard",
      illustration: true,
    },
    { from: "friday", image: peekingMeme, caption: "the attacker, politely reading your password" },
  ],
  [
    { from: "friday", text: "what tool do they even use? is this movie stuff?" },
    { from: "ramesh", text: "no cape required. free tools. {yellow:wireshark} is the famous one. {yellow:tcpdump} on the command line. on public wifi, a cheap adapter in monitor mode. that's it." },
    { from: "ramesh", text: "want to see what their screen looks like when you send that password over {red:http}?" },
    { from: "friday", text: "...do i have to?" },
    { from: "ramesh", text: "yes. look:" },
    { from: "system", text: "the attacker's wireshark window.", visual: "wireshark-http" },
  ],
  [
    { from: "friday", text: "USERNAME. PASSWORD. OTP. sitting there. in plain letters. i almost sent that." },
    { from: "ramesh", text: "readable text. that's the whole problem. if you send a message as plaintext across a network you don't control, {red:anyone who intercepts it can simply read it}." },
    { from: "friday", text: "so how do banks do this? how do i log into gmail from a cafe??" },
    { from: "ramesh", text: "good. that question is the door into this whole module. the answer has a name: {green:encryption}." },
    { from: "ramesh", text: "it scrambles the message into something unreadable before it leaves your laptop. even if someone intercepts it, all they see is meaningless characters. noise." },
    { from: "friday", image: sneakyHomerMeme, caption: "friday's password, disappearing into the noise" },
  ],
  [
    { from: "friday", text: "and only Dev can turn it back?" },
    { from: "ramesh", text: "only the intended receiver. to everyone else: garbage. next chapter i'll open that black box for you. plaintext, ciphertext, keys. slow and clear." },
    { from: "system", text: "chapter 1 complete. next: what is encryption?" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does a missing padlock / 'http' / 'Not Secure' in the address bar mean?",
    options: ["the site is faster", "the connection can send data as readable text", "the site is offline", "your wifi is broken"],
    answer: 1,
    explanation: "http has no encryption. anything you type can travel as readable plaintext.",
  },
  {
    question: "in this story, who is the expert teaching encryption?",
    options: ["friday", "ramesh", "Dev", "the isp"],
    answer: 1,
    explanation: "ramesh is the ethical hacker. friday is the junior learning.",
  },
  {
    question: "why is 'the middle network' dangerous?",
    options: [
      "it is always owned by hackers",
      "you usually cannot control it, so strangers may sit on the path",
      "it deletes all packets",
      "it only works at night",
    ],
    answer: 1,
    explanation: "ISPs, coffee-shop wifi, hotel wifi, airport hotspots: you don't control who else is there.",
  },
  {
    question: "if an attacker copies a packet but lets it continue to Dev, what happened?",
    options: ["nothing, copying is harmless", "eavesdropping / sniffing: they read the secret and the victim may never notice", "the message is deleted", "Dev's laptop catches fire"],
    answer: 1,
    explanation: "sniffing is silent. the message still arrives. that's why plaintext is so dangerous.",
  },
  {
    question: "which tool is commonly used to capture and inspect packets?",
    options: ["photoshop", "wireshark (or tcpdump)", "excel", "nmap -sn only"],
    answer: 1,
    explanation: "wireshark is the classic packet sniffer. tcpdump is the command-line cousin.",
  },
  {
    question: "in the demo, what did the attacker see in the http post?",
    options: ["only random bytes", "username, password and otp in readable text", "nothing, http is private", "only the website logo"],
    answer: 1,
    explanation: "the form fields were sitting in the packet as plaintext.",
  },
  {
    question: "ramesh compared http to what everyday object?",
    options: ["a locked safe", "an open postcard", "a vpn tunnel", "a firewall"],
    answer: 1,
    explanation: "anyone along the path can read the writing on a postcard.",
  },
  {
    question: "what does encryption do to a sensitive message before it travels?",
    options: [
      "deletes it",
      "scrambles it into unreadable ciphertext",
      "makes the wifi faster",
      "hides your laptop from nmap",
    ],
    answer: 1,
    explanation: "encryption turns readable plaintext into ciphertext that looks like noise without the key.",
  },
  {
    question: "which real-world place is a classic example of an untrusted middle network?",
    options: ["your own locked home wifi with no guests", "a random airport 'free wifi' hotspot", "an offline notebook", "a usb stick in your pocket"],
    answer: 1,
    explanation: "public hotspots are shared, uncontrolled, and perfect for sniffing.",
  },
  {
    question: "why did ramesh stop friday from pasting the password into the http page?",
    options: [
      "the page was too slow",
      "the password would travel readable across networks they don't control",
      "dev already knew the password",
      "http websites cannot show forms",
    ],
    answer: 1,
    explanation: "sensitive data on http is basically a postcard. anyone on the path can read it.",
  },
];

const notes = `# chapter 01 · the open postcard

> offtrck · encryption module · study notes

## the cast
| person | role |
|---|---|
| **friday** | junior developer. learner. does not know encryption yet. |
| **ramesh** | ethical hacker. expert. teaches how secrets survive the internet. |

## the story
friday almost pasted a temporary admin password into an old **http** staging login for contractor Dev. the browser showed **Not Secure**. ramesh stopped him.

## http vs https
| | http | https |
|---|---|---|
| address bar | \`http://...\` + often "Not Secure" | \`https://...\` with a padlock |
| data on the wire | plaintext (readable) | ciphertext (scrambled) |
| eavesdropper | can read passwords, cookies, forms | sees noise |

**real world:** browsers warn on http pages that ask for passwords. banks, email, and shopping should always show https.

## the path you don't control
1. friday's device + local wifi (maybe trusted)
2. **ISP / public internet / cafe uplink** (untrusted middle)
3. Dev's network (maybe trusted)

risky middles: airport wifi, hotel wifi, cafe wifi, fake hotspots.

## eavesdropping
- attacker **copies** packets without necessarily blocking them
- tools: **Wireshark**, **tcpdump**
- http is like an **open postcard**

## what encryption changes
scrambles the message *before* it leaves the sender. interceptors still see packets, but contents look like random bytes.

## remember
- friday asks, ramesh explains
- sensitive data on http is a postcard
- look for the padlock
`;

export const encryptionChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "the open postcard",
  scenes,
  quiz,
  notes,
};
