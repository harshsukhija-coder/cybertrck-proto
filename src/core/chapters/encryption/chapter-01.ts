import peekingMeme from "../../../assets/memes/peeking.gif";
import sneakyHomerMeme from "../../../assets/memes/sneaky-homer.gif";
import thisIsFineMeme from "../../../assets/memes/this-is-fine.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · encryption · chapter 01" },
    { from: "friday", text: "ramesh. quick one. our contractor {cyan:Dev} needs the temporary admin password for the staging panel." },
    { from: "friday", text: "i was about to paste it into the old login page. look:" },
    { from: "system", text: "friday opens the address bar. something is missing.", visual: "http-vs-https" },
  ],
  [
    { from: "ramesh", text: "stop. stop stop stop. that left side. {red:http}. no padlock." },
    { from: "friday", text: "so... the site still works? i can type the password and hit enter." },
    { from: "ramesh", text: "it 'works' the same way shouting your bank pin across a crowded cafe 'works'. the waiter hears it. the next table hears it. the guy with headphones? maybe also." },
    { from: "friday", image: thisIsFineMeme, caption: "friday, one second before ramesh grabbed the mouse" },
  ],
  [
    { from: "friday", text: "ok but it's just our staging site. what's the worst that happens?" },
    { from: "ramesh", text: "imagine the message is something sensitive. a {pink:bank instruction}. a {red:password}. a one-time code. anything you would not read out loud on the metro." },
    { from: "friday", text: "and that message has to travel across a network we do not control..." },
    { from: "ramesh", text: "exactly. your wifi to the coffee shop router. the coffee shop to the ISP. the ISP across the public internet. then somehow to Dev's office. we own maybe one hop of that." },
  ],
  [
    { from: "friday", text: "so draw it. i need to see the danger." },
    { from: "ramesh", text: "three networks. yours. the middle we cannot trust. Dev's. watch the pink packet." },
    { from: "system", text: "a private message crossing an open middle.", visual: "internet-path" },
  ],
  [
    { from: "friday", text: "wait. the person in the middle... they can just {red:copy} the packet? they don't even have to stop it?" },
    { from: "ramesh", text: "yep. that's called {orange:eavesdropping} or packet sniffing. the message still arrives. Dev gets it. you think everything is fine. and a stranger already read it." },
    { from: "friday", image: peekingMeme, caption: "the attacker, politely reading your password" },
  ],
  [
    { from: "friday", text: "what tool do they even use? is this like movie hacking?" },
    { from: "ramesh", text: "no cape required. free tools. {yellow:wireshark} is the famous one. {yellow:tcpdump} on the command line. on a public wifi, a cheap wifi adapter in monitor mode. that's it." },
    { from: "ramesh", text: "want to see what their screen looks like when you send that password over {red:http}?" },
    { from: "friday", text: "...do i?" },
    { from: "ramesh", text: "yes. curiosity is how we learn. look:" },
    { from: "system", text: "the attacker's wireshark window.", visual: "wireshark-http" },
  ],
  [
    { from: "friday", text: "USERNAME. PASSWORD. OTP. sitting there. in plain letters." },
    { from: "ramesh", text: "readable text. that's the whole problem. if you send a message as plaintext across a network you don't control, {red:anyone who intercepts it can simply read it}." },
    { from: "friday", text: "so how do banks... how does anything... how do i log into gmail from this cafe??" },
    { from: "ramesh", text: "curious already. good. the answer has a name: {green:encryption}." },
    { from: "ramesh", text: "it scrambles the message into something unreadable before it leaves your laptop. even if someone intercepts it, all they see is meaningless characters. noise." },
    { from: "friday", image: sneakyHomerMeme, caption: "friday's password, disappearing into the noise" },
  ],
  [
    { from: "friday", text: "and only Dev can turn it back?" },
    { from: "ramesh", text: "only the intended receiver. to everyone else: garbage. next chapter we open that black box. plaintext, ciphertext, keys. the whole machine." },
    { from: "system", text: "chapter 1 complete. next: what is encryption?" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does a missing padlock / 'http' in the address bar mean?",
    options: ["the site is faster", "the connection sends data as readable text", "the site is offline", "your wifi is broken"],
    answer: 1,
    explanation: "http has no encryption. anything you type can travel as readable plaintext.",
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
    question: "after encryption, what does an interceptor usually see?",
    options: ["the password clearly", "meaningless characters / noise", "your home address only", "a thank-you note"],
    answer: 1,
    explanation: "without the right key, ciphertext is useless noise.",
  },
  {
    question: "who should be able to turn the scrambled message back into the original?",
    options: ["anyone on the wifi", "only the intended receiver (with the right secret)", "only the isp", "google"],
    answer: 1,
    explanation: "that's the point: only the receiver can decrypt it.",
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

## the story
friday almost pasted a temporary admin password into an old **http** staging login for contractor Dev. ramesh stopped him: no padlock means the message can travel as readable text across networks they do not control.

## http vs https
| | http | https |
|---|---|---|
| address bar | \`http://...\` often "not secure" | \`https://...\` with a padlock |
| data on the wire | plaintext (readable) | ciphertext (scrambled) |
| eavesdropper | can read passwords, cookies, forms | sees noise |
| real use | almost never for logins/payments | the default for the modern web |

**real world:** browsers now warn loudly on http pages that ask for passwords. banks, email, and shopping should always show https.

## the path you don't control
a message from friday to Dev typically crosses:
1. friday's device + local wifi/router (maybe trusted)
2. **ISP / public internet / coffee-shop uplink** (untrusted middle)
3. Dev's network (maybe trusted)

classic risky middles: airport wifi, hotel wifi, cafe wifi, a compromised router, a fake hotspot named "Free Airport WiFi".

## eavesdropping
- the attacker **copies** packets without necessarily blocking them
- the receiver still gets the message, so victims often notice nothing
- tools: **Wireshark**, **tcpdump**, remote capture on a router, wifi monitor mode

## what encryption changes
encryption scrambles the message *before* it leaves the sender. interceptors still see packets, but the contents look like random bytes. only someone with the right secret can turn them back into the original message.

## remember
- sensitive data on http is a postcard
- the danger is the path you don't own
- encryption turns the postcard into a locked box
`;

export const encryptionChapterOne: Chapter = {
  title: "chapter 01",
  subtitle: "the open postcard",
  scenes,
  quiz,
  notes,
};
