import detectivePikachuMeme from "../../../assets/memes/detective-pikachu.gif";
import waitingSkeletonMeme from "../../../assets/memes/waiting-skeleton.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 03 · the neighborhood lights up" },
    { from: "ramesh", text: "card listening. kim starts a broad scan with {yellow:airodump-ng}." },
    {
      from: "system",
      terminal: {
        command: "sudo airodump-ng wlan0mon",
        output: "scanning all channels...",
      },
    },
    { from: "system", text: "every row is a wifi network in range.", visual: "airodump-scan" },
    { from: "friday", image: detectivePikachuMeme, caption: "friday reading the PWR column for the first time" },
  ],
  [
    { from: "friday", text: "PWR... closer to zero means closer physically?" },
    { from: "ramesh", text: "yes. far neighbors sit around {cyan:-70}. next door is much higher. Sally_Home is loud. no surprise." },
    { from: "ramesh", text: "kim writes down two things: the {pink:BSSID} (router's unique hardware address) and the {cyan:channel} (here, channel 1)." },
    { from: "friday", text: "why not keep scanning everything?" },
    { from: "ramesh", text: "noise. he locks onto sally alone and records to a file." },
  ],
  [
    { from: "system", text: "narrow the hunt. write a capture.", visual: "target-lock" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "airodump flags that matter",
        text: "{pink:--bssid} → which router\n{cyan:-c} → which channel\n{yellow:-w} → write captures to a file name\nlast arg → {pink:wlan0mon}",
      },
    },
    { from: "ramesh", text: "top of the screen: her router. bottom: a {cyan:station} already connected — phone or laptop. that connected device is exactly what kim needs." },
  ],
  [
    { from: "friday", text: "and -w is already creating sally_handshake files?" },
    { from: "ramesh", text: "yes. from this moment, everything in the air between router and clients is recorded. waiting for one precise event." },
    { from: "friday", text: "the handshake." },
    { from: "ramesh", text: "the handshake. but it only happens when a device connects." },
    { from: "friday", image: waitingSkeletonMeme, caption: "kim, if he waited for someone to join wifi naturally" },
  ],
  [
    { from: "friday", text: "so he might wait hours?" },
    { from: "ramesh", text: "he could. he won't." },
    { from: "friday", text: "then how—" },
    { from: "ramesh", text: "he can't force a device to connect on command... but he can force one that's already connected to {red:drop off}. it reconnects on its own. and when it does—" },
    { from: "friday", text: "handshake." },
    { from: "ramesh", text: "handshake. watch what kim does next." },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "to be continued",
        text: "kim opens a second terminal. fake {red:deauthentication} packets. sally's phone will believe the router kicked it off — then walk right back into the handshake trap.",
      },
    },
    { from: "system", text: "chapter 3 complete." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "which tool lists nearby wifi networks in this story?",
    options: ["airmon-ng", "airodump-ng", "aircrack-ng", "chrome"],
    answer: 1,
    explanation: "airodump-ng scans and later captures.",
  },
  {
    question: "in the PWR column, closer to zero means...",
    options: ["farther away", "physically closer / stronger signal", "open network", "wpa3 only"],
    answer: 1,
    explanation: "-41 is nearer than -80.",
  },
  {
    question: "what is a BSSID?",
    options: ["the wifi password", "the router's unique hardware address", "the wordlist name", "a meme"],
    answer: 1,
    explanation: "like a MAC address for the access point.",
  },
  {
    question: "which two values must kim note to lock onto sally?",
    options: ["BSSID and channel", "password and username", "cpu and ram", "email and phone"],
    answer: 0,
    explanation: "--bssid and -c in airodump-ng.",
  },
  {
    question: "what does -w do in airodump-ng?",
    options: ["sets wifi color", "writes captured traffic into files", "waits forever", "wipes the disk"],
    answer: 1,
    explanation: "-w sally_handshake creates capture files.",
  },
  {
    question: "what is a 'station' in airodump output?",
    options: ["a train stop", "a client device connected to the wifi", "the isp", "a wordlist"],
    answer: 1,
    explanation: "phone/laptop associated with the AP.",
  },
  {
    question: "when does a WPA handshake normally happen?",
    options: ["every midnight", "when a device connects / reconnects", "when you open youtube", "never"],
    answer: 1,
    explanation: "connect event triggers the handshake.",
  },
  {
    question: "why doesn't kim just wait quietly for a handshake?",
    options: ["he likes waiting", "it could take a long time, so he will force a reconnect", "airodump forbids waiting", "wpa2 blocks waiting"],
    answer: 1,
    explanation: "deauth comes next to force the event.",
  },
  {
    question: "after locking on, what is kim missing?",
    options: ["the router name", "the handshake capture", "monitor mode", "kali linux"],
    answer: 1,
    explanation: "recording is ready; handshake not yet seen.",
  },
  {
    question: "Sally_Home showed a strong signal because...",
    options: ["she uses WPA3", "her router is next door", "the password is long", "kim has admin rights"],
    answer: 1,
    explanation: "PWR near zero-ish = close neighbor.",
  },
];

const notes = `# chapter 03 · airodump & target lock

> offtrck · wifi passwords module · study notes

## broad scan
\`\`\`
sudo airodump-ng wlan0mon
\`\`\`
read: ESSID, ENC (WPA2), **PWR**, **BSSID**, **CH**.

## focused capture
\`\`\`
sudo airodump-ng --bssid <router> -c <channel> -w sally_handshake wlan0mon
\`\`\`

## screen layout
- top: access points
- bottom: stations (clients)
- look for WPA handshake status later

## what's next
handshake only on connect — kim will force a drop + reconnect.
`;

export const wifiChapterThree: Chapter = {
  title: "chapter 03",
  subtitle: "neighborhood scan",
  scenes,
  quiz,
  notes,
};
