import dnsPhoto from "../assets/courses/dns.jpg";
import ipPhoto from "../assets/courses/ip.jpg";
import networkPhoto from "../assets/courses/network.jpg";
import osiPhoto from "../assets/courses/osi.jpg";
import packetsPhoto from "../assets/courses/packets.jpg";
import portsPhoto from "../assets/courses/ports.jpg";
import routerPhoto from "../assets/courses/router.jpg";
import tcpUdpPhoto from "../assets/courses/tcp-udp.jpg";

/** How the tile sits in the collage: big poster, short tiles, tall strip, wide strip or the full-width finale */
export type TileShape = "hero" | "side" | "tall" | "wide" | "stack" | "boss";

export type CourseChapter = {
  id: string;
  number: number;
  title: string;
  /** Big word printed on the cover */
  word: string;
  /** The question under the cover — the reason to click */
  hook: string;
  /** Half an answer, revealed on hover */
  tease: string;
  minutes: number;
  /** Unsplash photo, shown as a duotone */
  photo: string;
  /** Duotone colours: [shadows, highlights] */
  duo: [string, string];
  /** CSS object-position, so the subject stays in frame */
  focus: string;
  /** Brightness boost for very dark photos, so the highlight colour still shows */
  exposure?: number;
  shape: TileShape;
};

export type VibeCourse = {
  id: string;
  title: string;
  chapters: CourseChapter[];
};

export const networkingCourse: VibeCourse = {
  id: "networking",
  title: "intro to networking",
  chapters: [
    {
      id: "what-is-a-network",
      number: 1,
      title: "networks",
      word: "networks",
      hook: "who is your phone secretly talking to?",
      tease: "~30 devices. right now. even your fridge.",
      minutes: 8,
      photo: networkPhoto,
      duo: ["#2a0845", "#ff5fa2"],
      focus: "60% 50%",
      exposure: 3,
      shape: "hero",
    },
    {
      id: "ip-addresses",
      number: 2,
      title: "ip addresses",
      word: "ip",
      hook: "can someone find your house from your IP?",
      tease: "kinda. it's scarier than you think.",
      minutes: 10,
      photo: ipPhoto,
      duo: ["#0b1d51", "#ffd166"],
      focus: "50% 70%",
      shape: "side",
    },
    {
      id: "packets",
      number: 3,
      title: "packets",
      word: "packets",
      hook: "how does a 4K video fit through a wire?",
      tease: "it gets chopped into a million tiny boxes.",
      minutes: 9,
      photo: packetsPhoto,
      duo: ["#3d0c02", "#ff8a3d"],
      focus: "50% 50%",
      shape: "side",
    },
    {
      id: "routers-switches",
      number: 4,
      title: "routers",
      word: "routers",
      hook: "why does turning it off and on actually work?",
      tease: "it's not magic. there's a real reason.",
      minutes: 12,
      photo: routerPhoto,
      duo: ["#00332f", "#5ff0b5"],
      focus: "55% 50%",
      shape: "tall",
    },
    {
      id: "dns",
      number: 5,
      title: "dns",
      word: "dns",
      hook: "how does your laptop know where google.com lives?",
      tease: "it asks a phonebook. the phonebook can lie.",
      minutes: 11,
      photo: dnsPhoto,
      duo: ["#1a1446", "#b49bff"],
      focus: "50% 50%",
      shape: "wide",
    },
    {
      id: "tcp-vs-udp",
      number: 6,
      title: "tcp vs udp",
      word: "tcp/udp",
      hook: "why does your game lag but netflix doesn't?",
      tease: "one of them just doesn't care if data gets lost.",
      minutes: 10,
      photo: tcpUdpPhoto,
      duo: ["#06203a", "#4cc9f0"],
      focus: "50% 50%",
      shape: "stack",
    },
    {
      id: "ports",
      number: 7,
      title: "ports",
      word: "ports",
      hook: "your laptop has 65,535 doors. how many are open?",
      tease: "hackers check this before anything else.",
      minutes: 9,
      photo: portsPhoto,
      duo: ["#2b0a1e", "#ff4d6d"],
      focus: "65% 50%",
      exposure: 1.4,
      shape: "stack",
    },
    {
      id: "osi-model",
      number: 8,
      title: "the osi model",
      word: "osi",
      hook: "what actually happens when you hit enter?",
      tease: "7 layers. one wild trip. under 100ms.",
      minutes: 15,
      photo: osiPhoto,
      duo: ["#0d1117", "#c6f432"],
      focus: "50% 50%",
      shape: "boss",
    },
  ],
};
