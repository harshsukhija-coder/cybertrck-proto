import packetsPhoto from "../../assets/courses/packets.jpg";
import phishPhoto from "../../assets/courses/phish.jpg";
import portsPhoto from "../../assets/courses/ports.jpg";
import tcpUdpPhoto from "../../assets/courses/tcp-udp.jpg";
import type { CoverArt } from "../chapter-cover";
import type { InterestId } from "../prefs";

export type GameId = "tcp-or-udp" | "real-or-phish" | "port-rush" | "packet-puzzle";

export type GameMeta = CoverArt & {
  id: GameId;
  title: string;
  /** Short hook shown on the game card and feed post */
  tagline: string;
  how: string;
  caption: string;
  tags: InterestId[];
  plays: number;
};

export const GAMES: GameMeta[] = [
  {
    id: "tcp-or-udp",
    title: "tcp or udp?",
    word: "tcp or udp",
    tagline: "swipe left for tcp, right for udp. how fast is your gut?",
    how: "swipe or use ← →",
    caption: "facetime, bank transfers, valorant. which ones care about every byte? swipe to find out 🎮",
    photo: tcpUdpPhoto,
    duo: ["#06203a", "#4cc9f0"],
    focus: "50% 50%",
    tags: ["gaming", "streaming", "internet"],
    plays: 8412,
  },
  {
    id: "real-or-phish",
    title: "real or phish?",
    word: "phish?",
    tagline: "one of these links steals your password. can you spot it?",
    how: "swipe or use ← →",
    caption: "90% of hacks start with a fake link. you'd never fall for one… right? prove it 🎣",
    photo: phishPhoto,
    duo: ["#3a0716", "#ff8fa3"],
    focus: "30% 50%",
    tags: ["security", "privacy", "web"],
    plays: 12930,
  },
  {
    id: "port-rush",
    title: "port rush",
    word: "port rush",
    tagline: "30 seconds. a port number. what's behind the door?",
    how: "tap the right service",
    caption: "22, 443, 25565… how many doors can you name before the timer runs out? ⏱️",
    photo: portsPhoto,
    duo: ["#2b0a1e", "#ff4d6d"],
    focus: "65% 50%",
    exposure: 1.4,
    tags: ["security", "home", "gaming"],
    plays: 5307,
  },
  {
    id: "packet-puzzle",
    title: "packet puzzle",
    word: "puzzle",
    tagline: "packets arrive scrambled. put the message back together. fast.",
    how: "tap packets in order",
    caption: "the internet delivers your messages in pieces, out of order. you're the computer now 🧩",
    photo: packetsPhoto,
    duo: ["#3d0c02", "#ff8a3d"],
    focus: "50% 50%",
    tags: ["internet", "streaming", "web"],
    plays: 6648,
  },
];

export const gameHash = (id: GameId) => `#/feed/games/${id}`;

export const isGameId = (value: string): value is GameId => GAMES.some(g => g.id === value);

export type SwipeCard = { prompt: string; side: "left" | "right"; why: string };

export const TCP_UDP_CARDS: SwipeCard[] = [
  { prompt: "facetime call with your bestie", side: "right", why: "a frozen frame beats a 3-second delay. old video frames are useless." },
  { prompt: "sending ₹5,000 to a friend", side: "left", why: "every byte must arrive. imagine losing a zero." },
  { prompt: "your valorant movement", side: "right", why: "128 updates a second. waiting for a lost one only makes it worse." },
  { prompt: "downloading a game update", side: "left", why: "one missing byte = corrupted file. tcp re-sends anything lost." },
  { prompt: "discord voice chat", side: "right", why: "a tiny glitch is fine. a delay while talking is not." },
  { prompt: "sending an email", side: "left", why: "an email with random missing words? no thanks." },
  { prompt: "a dns lookup", side: "right", why: "one tiny question, one tiny answer. no time for handshakes." },
  { prompt: "uploading your essay to drive", side: "left", why: "you want every word of it. in the right order." },
  { prompt: "zoom screen share", side: "right", why: "live beats perfect. a few lost pixels won't hurt." },
  { prompt: "ssh into a server", side: "left", why: "every keystroke must arrive, in order. `rm` vs `rm -rf` matters." },
];

export const PHISH_CARDS: SwipeCard[] = [
  { prompt: "paypa1.com/login", side: "left", why: "that's the number 1, not an L." },
  { prompt: "accounts.google.com", side: "right", why: "real google subdomain. the domain is google.com." },
  { prompt: "instagram.com.verify-account.xyz", side: "left", why: "the real domain is the last part: verify-account.xyz." },
  { prompt: "netflix-billing-update.com", side: "left", why: "netflix only uses netflix.com. extra words = red flag." },
  { prompt: "github.com/settings/security", side: "right", why: "real github. the path after / can be anything." },
  { prompt: "amaz0n-orders.net", side: "left", why: "a zero instead of an o. and .net? nope." },
  { prompt: "login.microsoftonline.com", side: "right", why: "looks weird, but it's microsoft's actual login page." },
  { prompt: "apple.com-support.help", side: "left", why: "the real domain here is com-support.help, not apple.com." },
  { prompt: "dlscord.com/nitro", side: "left", why: "read it again. that's an L, not an i." },
  { prompt: "drive.google.com/file/d/8xk2", side: "right", why: "real google drive link. still, only open files you expect." },
];

export const PORTS: { port: number; service: string }[] = [
  { port: 22, service: "ssh" },
  { port: 80, service: "http" },
  { port: 443, service: "https" },
  { port: 53, service: "dns" },
  { port: 25, service: "email (smtp)" },
  { port: 21, service: "ftp" },
  { port: 3389, service: "remote desktop" },
  { port: 3306, service: "mysql" },
  { port: 25565, service: "minecraft" },
  { port: 123, service: "time sync (ntp)" },
  { port: 67, service: "dhcp" },
  { port: 5432, service: "postgres" },
];

export const PUZZLE_MESSAGES = [
  "hello from the other side",
  "lag is not my fault",
  "packets arrive out of order",
  "have you tried turning it off",
  "it was dns all along obviously",
];
