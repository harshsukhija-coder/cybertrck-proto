import samePicture from "../../../assets/memes/same-picture.gif";
import sneakyHomer from "../../../assets/memes/sneaky-homer.gif";
import surprisedPikachu from "../../../assets/memes/surprised-pikachu.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · man in the middle · chapter 02" },
    { from: "system", text: "🎭 tone: thriller. two smiles. one name. pick wrong." },
  ],
  [
    { from: "jules", text: "board still says Bean&Byte_Free. guests join on autopilot. i refill oat milk. chaos continues 🧃" },
    { from: "kim", text: "method one: {pink:evil twin}. i broadcast the same SSID. louder. closer. hungrier." },
    { from: "system", visual: "evil-twin" },
  ],
  [
    {
      from: "system",
      dual: {
        kim: {
          title: "evil twin",
          prompt: "kim@kali:~$",
          command: "airbase-ng -e 'Bean&Byte_Free' -c 6 wlan0mon",
          output: `{green:[+]} soft AP up
ESSID: Bean&Byte_Free
channel: 6
{yellow:[!]} signal intentionally stronger near sally's table`,
        },
        sally: {
          mode: "wifi",
          title: "wifi picker",
          wifiNetworks: [
            { name: "Bean&Byte_Free", bars: 2, open: true },
            { name: "Bean&Byte_Free", bars: 4, open: true, fake: true },
            { name: "xfinitywifi", bars: 1, open: true },
          ],
          note: "sally: why are there two… whatever, strongest one 🤷‍♀️",
        },
      },
    },
    { from: "system", image: samePicture, caption: "they are the same picture · until they aren't" },
  ],
  [
    { from: "sally", text: "connected! full bars! jules your wifi upgraded 😍" },
    { from: "jules", text: "…i didn't touch anything." },
    {
      from: "system",
      dual: {
        kim: {
          title: "gateway",
          prompt: "kim@kali:~$",
          command: "sysctl -w net.ipv4.ip_forward=1\ntcpdump -i at0 -n -c 5",
          output: `{green:[+]} forwarding on · sally's packets now visit kim first
14:02:01 IP 192.168.0.44.52311 > 93.184.216.34.80
14:02:01 IP 192.168.0.44.52311 > 93.184.216.34.443
{pink:[*]} unencrypted crumbs already tasty`,
        },
        sally: {
          mode: "wifi",
          title: "wifi",
          wifiNetworks: [
            { name: "Bean&Byte_Free", bars: 4, open: true, fake: true, selected: true },
            { name: "Bean&Byte_Free", bars: 2, open: true },
          ],
          note: "sally: connected to the twin · still sipping",
        },
      },
    },
    { from: "kim", image: sneakyHomer, caption: "traffic goes through the quiet table" },
  ],
  [
    { from: "ramesh", text: "from sally's view: online. sites load. nothing screams. from kim's view: every packet that isn't encrypted is fair game." },
    { from: "friday", text: "so open networks are basically a costume party for attackers." },
    { from: "ramesh", text: "anyone can invent a twin. anyone can connect. that's why public open wifi is a favorite stage." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "auto-join trap",
        text: "if your device remembered Bean&Byte_Free, it may jump to kim's twin without asking. turn off auto-connect.",
      },
    },
    { from: "sally", image: surprisedPikachu, caption: "wait. there were TWO?" },
  ],
  [
    { from: "kim", text: "twin is one door. next door needs me already on the same LAN — then i poison a phonebook called ARP. 📒☠️" },
    { from: "jules", text: "i'm changing the SSID tomorrow. adding a password. buying a plant that looks judgmental 🌱" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "an evil twin is…",
    options: ["a free cookie", "a fake hotspot with the same SSID", "a vpn brand", "a printer error"],
    answer: 1,
    explanation: "attacker clones the network name, often with a stronger signal.",
  },
  {
    question: "why might a device pick the twin?",
    options: ["twins smell better", "stronger signal / auto-join to a known name", "https forces it", "jules clicks for you"],
    answer: 1,
    explanation: "proximity + remembered SSIDs make the fake AP sticky.",
  },
  {
    question: "after joining the twin, sally usually notices…",
    options: ["a red alarm siren", "almost nothing — sites still load", "her laptop melts", "kim waving"],
    answer: 1,
    explanation: "forwarding keeps the internet 'working'.",
  },
  {
    question: "open public wifi is risky because…",
    options: ["jazz is encrypted", "anyone can stand up a twin and anyone can join", "routers hate coffee", "packets can't exist outdoors"],
    answer: 1,
    explanation: "no password gate + easy cloning.",
  },
];

const notes = `# man in the middle · chapter 02 — evil twin

## method
Attacker spins up a fake AP with the **same SSID** as the real cafe wifi.

## why it works
- identical name in the wifi list
- often **stronger signal** (attacker sits close)
- devices may **auto-join** remembered networks

## result
Victim traffic flows through the attacker before the internet. Pages still load.

## defense teaser
Prefer password-protected networks, disable auto-join, use VPN + HTTPS (later chapter).
`;

export const mitmChapterTwo: Chapter = {
  title: "evil twin",
  subtitle: "same name · louder signal · wrong door",
  scenes,
  quiz,
  notes,
};
