import detectiveMeme from "../../../assets/memes/detective-pikachu.gif";
import sneakyHomerMeme from "../../../assets/memes/sneaky-homer.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-concepts · firewalls · chapter 04" },
    { from: "system", text: "not all firewalls are equally smart." },
  ],
  [
    { from: "ramesh", text: "the earliest, simplest type: a {orange:packet filter}." },
    { from: "ramesh", text: "it looks at each packet on its own — address, port, protocol — and checks the rules." },
    { from: "friday", text: "sounds fine?" },
    { from: "ramesh", text: "catch: a basic packet filter has {red:no memory}. every packet is a stranger. it doesn't know if it's part of a conversation you started or something arriving out of nowhere." },
    { from: "friday", image: detectiveMeme, caption: "packet filter · short-term memory: 0" },
  ],
  [
    { from: "ramesh", text: "enter the smarter type: the {cyan:stateful firewall}." },
    { from: "ramesh", text: "when a device inside starts a connection — say you open a website — the firewall records that connection in a table." },
    { from: "ramesh", text: "when the response comes back, it recognizes it as part of a conversation you started and lets it in. no separate rule needed for every reply." },
    { from: "friday", text: "that's why it's called stateful — it remembers state." },
    { from: "ramesh", text: "exactly. but if a packet arrives out of the blue claiming to be a reply to something you never sent — table check fails — {red:blocked}." },
  ],
  [
    { from: "ramesh", text: "stateful is great at where traffic is going and whether it belongs to a known connection." },
    { from: "ramesh", text: "but it mostly looks at the {yellow:outside} of each packet — addresses and ports. not what's inside." },
    { from: "friday", image: sneakyHomerMeme, caption: "malware wearing a 'port 443' hat" },
    { from: "ramesh", text: "attackers know which ports are usually open. if 443 is allowed for web, they can hide something malicious inside traffic that uses that same port. to a basic firewall it looks fine." },
  ],
  [
    { from: "ramesh", text: "that's what a {green:next-generation firewall} — NGFW — is built for." },
    { from: "system", text: "three generations.", visual: "firewall-types" },
    { from: "ramesh", text: "on top of stateful tracking, it looks deeper — inspecting actual content, not just address and port." },
    { from: "ramesh", text: "it can recognize which {cyan:application} the traffic belongs to even on a common port. scan for known attack patterns and malware. enforce detailed rules — allow a site but block a risky feature inside it." },
    { from: "friday", image: hackermanMeme, caption: "ngfw reading the fine print" },
  ],
  [
    { from: "ramesh", text: "so when something tries to sneak through on an allowed port, an NGFW has a real chance of spotting it by content — where a simpler firewall would wave it through." },
    { from: "friday", text: "so we should only buy NGFWs and ignore everything else?" },
    { from: "ramesh", text: "know the ladder. next chapter: what even a great firewall still can't do." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "packet filter → stateful → NGFW. next: phishing, encryption, insider threats, and misconfigured rules — the stuff a firewall alone won't save you from.",
      },
    },
    { from: "system", text: "chapter 4 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "a basic packet filter's big weakness is...",
    options: ["it costs too little", "no memory of connections; each packet is alone", "it only runs on paper", "it blocks coffee"],
    answer: 1,
    explanation: "stateless — no conversation context.",
  },
  {
    question: "a stateful firewall remembers...",
    options: ["your passwords", "active connections in a table", "memes", "nothing ever"],
    answer: 1,
    explanation: "state table tracks conversations you started.",
  },
  {
    question: "unsolicited 'reply' packets with no matching connection are typically...",
    options: ["allowed", "blocked", "printed", "turned into music"],
    answer: 1,
    explanation: "no state → deny.",
  },
  {
    question: "stateful firewalls still mostly inspect...",
    options: ["packet exterior (addresses/ports), not full content", "only emoji", "hard drive files", "battery health"],
    answer: 0,
    explanation: "headers/context, not deep payload inspection.",
  },
  {
    question: "attackers may hide malware on port 443 because...",
    options: ["443 is never used", "it's commonly allowed for web, so simpler firewalls may wave it through", "ports can't carry data", "firewalls love 443 malware"],
    answer: 1,
    explanation: "allowed port ≠ safe content.",
  },
  {
    question: "an NGFW adds the ability to...",
    options: ["only filter by port forever", "inspect content/apps and catch hidden threats on allowed ports", "delete the internet", "replace user training"],
    answer: 1,
    explanation: "deeper inspection + app awareness.",
  },
];

const notes = `
> offtrck · firewalls module · study notes
> chapter 04 · smarter firewalls

## packet filter
- inspects each packet alone (address, port, protocol)
- **no memory** of conversations
- rules stay simple — and limited

## stateful firewall
- records connections you start in a **state table**
- expected replies allowed automatically
- fake / unsolicited "replies" blocked
- still mostly sees the **outside** of packets

## the content gap
attackers abuse commonly open ports (e.g. **443**). headers look fine; payload may not be.

## next-generation firewall (NGFW)
- everything stateful does **plus** deeper inspection
- application awareness (even on common ports)
- malware / attack-pattern scanning
- finer rules (allow site, block risky feature)

## what's next
limits of firewalls + layered defense + full recap.
`;

export const firewallChapterFour: Chapter = {
  title: "chapter 04",
  subtitle: "smarter firewalls",
  scenes,
  quiz,
  notes,
};
