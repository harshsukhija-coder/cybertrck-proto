import detectivePikachu from "../../../assets/memes/detective-pikachu.gif";
import mathLady from "../../../assets/memes/math-lady.gif";
import spidermanPointing from "../../../assets/memes/spiderman-pointing.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · man in the middle · chapter 03" },
    { from: "system", text: "🕵️ tone: detective lab. whiteboards. MAC addresses. no jazz solo." },
  ],
  [
    { from: "ramesh", text: "method two: {pink:ARP spoofing}. only works if kim is already on the {cyan:same network} as sally." },
    { from: "friday", text: "so not a fake cafe — the real cafe LAN, but kim lies inside it." },
    { from: "kim", text: "exactly. twin is theater. ARP is forgery of the local phonebook." },
    { from: "system", image: detectivePikachu, caption: "follow the MAC" },
  ],
  [
    { from: "ramesh", text: "on a LAN, IP isn't enough. each NIC has a {yellow:MAC address} — hardware sticker for the local hop." },
    { from: "ramesh", text: "your laptop keeps an {cyan:ARP table}: IP → MAC. when it needs the router it basically yells: {green:who has 192.168.1.1?}" },
    { from: "jules", text: "router answers with its MAC. laptop writes it down. nobody asks for ID. cafe energy. 🪪❌" },
    { from: "friday", image: mathLady, caption: "wait so the list just… trusts strangers?" },
  ],
  [
    { from: "kim", text: "i send fake replies. tell sally: {pink:i am the router}. tell the router: {pink:i am sally}. both entries get my MAC." },
    { from: "system", visual: "arp-poison" },
    {
      from: "system",
      dual: {
        kim: {
          title: "arpspoof",
          prompt: "kim@kali:~$",
          command: "arpspoof -i wlan0 -t 192.168.1.44 192.168.1.1\narpspoof -i wlan0 -t 192.168.1.1 192.168.1.44",
          output: `{yellow:82:a3:…} is at {pink:aa:bb:cc:dd:ee:ff} (sally←kim)
{yellow:192.168.1.1} is at {pink:aa:bb:cc:dd:ee:ff} (router←kim)

{green:[+]} both tables poisoned · silent middle seat taken`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "notes.work.local/today",
            secure: false,
            heading: "Today's notes",
            body: "buy oat milk\nfinish report\n\n(still feels fine. too fine.)",
          },
          note: "sally: wifi icon happy · ARP table quietly wrong",
        },
      },
    },
  ],
  [
    { from: "system", image: spidermanPointing, caption: "router thinks kim is sally · sally thinks kim is router" },
    { from: "ramesh", text: "now every packet between sally and the internet takes a scenic route through kim — who sits quietly in the middle." },
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "no verification",
        text: "classic ARP has no proof. whoever answers loudest / first can rewrite the map.",
      },
    },
    { from: "kim", text: "twin got me the door from outside. ARP keeps me middle once i'm inside. next: what i can {red:do} with that seat. 🍿" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "ARP spoofing needs the attacker to be…",
    options: ["on another continent", "on the same local network", "inside https only", "a barista"],
    answer: 1,
    explanation: "same LAN — e.g. same wifi — so fake ARP replies reach both sides.",
  },
  {
    question: "an ARP table maps…",
    options: ["emails to passwords", "IP addresses to MAC addresses", "SSIDs to coffee orders", "ports to memes"],
    answer: 1,
    explanation: "IP → MAC for local delivery.",
  },
  {
    question: "in the spoof, kim tells sally…",
    options: ["i am the router", "i am https", "i am jules", "i am offline"],
    answer: 0,
    explanation: "and tells the router 'i am the user' — both point at kim's MAC.",
  },
  {
    question: "why does ARP spoofing work so often?",
    options: ["quantum wifi", "classic ARP doesn't verify answers", "windows plays a song", "macs can't lie"],
    answer: 1,
    explanation: "trust-by-default is the hole.",
  },
];

const notes = `# man in the middle · chapter 03 — ARP poison

## requirement
Attacker already on the **same local network** as the victim.

## building blocks
- **MAC address** — hardware address on the LAN
- **ARP table** — IP → MAC cache on each device
- Device asks "who has this IP?" · answer is trusted

## spoof
Attacker replies:
- to victim: "I am the router" (attacker MAC)
- to router: "I am the victim" (attacker MAC)

Traffic between victim and gateway now flows through the attacker.
`;

export const mitmChapterThree: Chapter = {
  title: "ARP poison",
  subtitle: "local lies · rewritten phonebook",
  scenes,
  quiz,
  notes,
};
