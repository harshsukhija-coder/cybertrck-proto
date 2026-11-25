import type { Lesson, Module, QuizQuestion } from "../types";
import { addressing } from "./m2-addressing";
import { basics } from "./m1-basics";
import { routing } from "./m4-routing";
import { security } from "./m6-security";
import { services } from "./m5-services";
import { switching } from "./m3-switching";

export const MODULES: Module[] = [basics, addressing, switching, routing, services, security];

export const ACADEMY_TITLE = "Networking Foundations";

export const lessonKey = (module: Module, lesson: Lesson) => `${module.id}/${lesson.id}`;
export const lessonHash = (module: Module, lesson: Lesson) => `#/academy/${module.id}/${lesson.id}`;

export const ALL_LESSONS = MODULES.flatMap(module => module.lessons.map(lesson => ({ module, lesson })));

export const findLesson = (moduleId: string, lessonId: string) => {
  const module = MODULES.find(m => m.id === moduleId);
  const lesson = module?.lessons.find(l => l.id === lessonId);
  return module && lesson ? { module, lesson } : undefined;
};

export const neighbours = (module: Module, lesson: Lesson) => {
  const i = ALL_LESSONS.findIndex(x => x.module === module && x.lesson === lesson);
  return { prev: ALL_LESSONS[i - 1], next: ALL_LESSONS[i + 1] };
};

export const COUNTS = {
  articles: ALL_LESSONS.filter(x => x.lesson.kind === "article").length,
  quizzes: ALL_LESSONS.filter(x => x.lesson.kind === "quiz").length,
  labs: ALL_LESSONS.filter(x => x.lesson.kind === "lab").length,
  minutes: ALL_LESSONS.reduce((sum, x) => sum + (x.lesson.kind === "quiz" ? 5 : x.lesson.minutes), 0),
};

export const FINAL_EXAM: QuizQuestion[] = [
  { q: "A user can reach websites by IP but not by name. Which service is failing?", options: ["DHCP", "DNS", "ARP", "NAT"], answer: 1, why: "Names → IPs is DNS's job." },
  { q: "Which device forwards frames using MAC addresses?", options: ["router", "switch", "modem", "firewall"], answer: 1, why: "Switches work at layer 2 with MAC addresses." },
  { q: "How many usable hosts are in 192.168.5.0/26?", options: ["64", "62", "30", "126"], answer: 1, why: "2⁶ = 64 − 2 = 62." },
  { q: "What's the network address of 10.1.1.77/27?", options: ["10.1.1.64", "10.1.1.32", "10.1.1.0", "10.1.1.96"], answer: 0, why: "Blocks of 32: 64–95 contains 77." },
  { q: "PC-A (192.168.1.10/24) has no default gateway. What can it reach?", options: ["everything", "only devices in 192.168.1.0/24", "only the internet", "nothing at all"], answer: 1, why: "Without a gateway, it can only reach its own subnet." },
  { q: "Which command turns a router interface on?", options: ["enable", "no shutdown", "ip enable", "start"], answer: 1, why: "Interfaces are shut down by default. no shutdown brings them up." },
  { q: "Ports Fa0/1 (VLAN 10) and Fa0/2 (VLAN 20) are on the same switch. To let their PCs talk you need…", options: ["a longer cable", "a router or layer-3 switch", "a hub", "DNS"], answer: 1, why: "Different VLANs are different networks, so routing is needed." },
  { q: "Which DHCP message does the client send first?", options: ["Offer", "Request", "Discover", "Ack"], answer: 2, why: "D-O-R-A: Discover comes first." },
  { q: "\"ip route 0.0.0.0 0.0.0.0 203.0.113.1\" is a…", options: ["host route", "default route", "connected route", "VLAN"], answer: 1, why: "0.0.0.0/0 matches everything. It's the default route." },
  { q: "What's the wildcard mask for 255.255.255.240?", options: ["0.0.0.15", "0.0.0.16", "0.0.0.240", "255.255.255.15"], answer: 0, why: "255 − 240 = 15 in the last octet." },
  { q: "Which is the most secure way to manage a router remotely?", options: ["Telnet", "SSH", "HTTP", "console over the internet"], answer: 1, why: "SSH encrypts the session." },
  { q: "At which OSI layer does IP work?", options: ["2", "3", "4", "7"], answer: 1, why: "IP is the Network layer, layer 3." },
  { q: "A frame arrives for an unknown MAC. The switch…", options: ["drops it", "floods it out of all other ports", "sends it to the router", "asks DNS"], answer: 1, why: "Unknown unicast frames are flooded." },
  { q: "What tags frames with VLAN numbers on a trunk?", options: ["802.1Q", "802.3", "802.11", "RIP"], answer: 0, why: "IEEE 802.1Q is the VLAN tagging standard." },
  { q: "Which protocol finds the MAC address for a known IP on the local network?", options: ["DNS", "DHCP", "ARP", "ICMP"], answer: 2, why: "ARP resolves IP → MAC." },
  { q: "An ACL contains only \"deny host 10.0.0.5\". What does it do to other traffic?", options: ["allows it", "blocks it (implicit deny)", "logs it", "redirects it"], answer: 1, why: "Every ACL ends with an invisible deny any." },
  { q: "Which subnet mask suits a link between two routers best?", options: ["/24", "/16", "/30", "/8"], answer: 2, why: "/30 gives exactly 2 usable addresses." },
  { q: "Both routers have correct IPs, but only R1 has a static route to R2's LAN. Pings from R1's LAN to R2's LAN…", options: ["work", "fail, because replies have no route back", "work only once", "work only for TCP"], answer: 1, why: "R2 also needs a route back to R1's LAN." },
  { q: "Which of these is a private IPv4 address?", options: ["11.0.0.1", "192.169.1.1", "172.31.200.4", "8.8.4.4"], answer: 2, why: "172.16.0.0 – 172.31.255.255 is private." },
  { q: "TCP's handshake is…", options: ["SYN, SYN-ACK, ACK", "ACK, SYN, FIN", "HELLO, HELLO", "SYN, FIN, ACK"], answer: 0, why: "SYN → SYN-ACK → ACK." },
];
