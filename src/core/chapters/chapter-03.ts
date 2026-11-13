import anybodyOutThereMeme from "../../assets/memes/anybody-out-there.gif";
import detectivePikachuMeme from "../../assets/memes/detective-pikachu.gif";
import surprisedPikachuMeme from "../../assets/memes/surprised-pikachu.gif";
import type { Chapter, QuizQuestion, Scene } from "../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 3 · step 1: who is on the network?" },
    { from: "system", text: "before the first scan, meet the two people in this story:", visual: "who-is-who" },
  ],
  [
    { from: "ramesh", text: "every hack, every security audit, starts with the same boring question: {cyan:who is alive?}" },
    { from: "ramesh", text: "you can't attack, or protect, a device you don't know exists." },
    { from: "friday", text: "so... we shout 'anybody home?' down the street again?", image: anybodyOutThereMeme, caption: "friday's broadcast ping, basically" },
  ],
  [
    { from: "ramesh", text: "smarter. nmap visits {yellow:every single address} from .0 to .255 and checks if someone answers. it's called a {cyan:ping sweep}." },
    { from: "ramesh", text: "the magic flag is {cyan:-sn}. it means 'just tell me who's alive, don't touch any doors yet'." },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -sn 192.168.1.0/24",
        output: `Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-13 10:42 IST
Nmap scan report for {yellow:routerlogin.net (192.168.1.1)}
Host is up (0.0021s latency).
MAC Address: A0:40:A0:3C:11:02 ({purple:Netgear})
Nmap scan report for {blue:HPDA41C2 (192.168.1.20)}
Host is up (0.0034s latency).
MAC Address: 3C:52:82:DA:41:C2 ({purple:Hewlett Packard})
Nmap scan report for {red:DESKTOP-X7Q (192.168.1.30)}
Host is up (0.0029s latency).
MAC Address: 18:66:DA:2E:7C:91 ({purple:Dell})
Nmap scan report for {purple:chaibyte-nas (192.168.1.40)}
Host is up (0.0041s latency).
MAC Address: 00:11:32:8F:2B:64 ({purple:Synology Incorporated})
Nmap scan report for {orange:BOSS-LAPTOP (192.168.1.50)}
Host is up (0.012s latency).
MAC Address: F4:5C:89:17:A3:0E ({purple:Apple})
Nmap scan report for {cyan:fridays-macbook (192.168.1.10)}
Host is up.
Nmap done: 256 IP addresses ({green:6 hosts up}) scanned in 2.31 seconds`,
      },
    },
  ],
  [
    { from: "ramesh", text: "let's read it line by line:" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "reading a ping sweep",
        text: "{cyan:-sn} -> 'no port scan'. only checks who's alive. fast and quiet.\n{yellow:192.168.1.0/24} -> the whole street, all 256 addresses.\n{green:Nmap scan report for ...} -> one line = one living device. name + ip.\n{green:Host is up (0.0021s latency)} -> it answered, in 2 milliseconds.\n{purple:MAC Address ... (Dell)} -> the manufacturer, read from the MAC address.\n{green:6 hosts up} -> 6 devices alive out of 256 addresses.",
      },
    },
    { from: "ramesh", text: "why {orange:sudo}? as admin, nmap asks every address with {orange:ARP} ('who has 192.168.1.30?'). devices {red:can't} ignore ARP, or the network stops working for them. that's how we found the laptops the broadcast ping missed." },
    { from: "friday", text: "and your own machine shows up last with no MAC, because nmap doesn't need to ask itself." },
  ],
  [
    { from: "system", text: "here's everything the sweep found, as cards:", visual: "devices-found" },
    { from: "friday", text: "wait. {red:DESKTOP-X7Q} is at {red:192.168.1.30}... that's the address of our {red:web server}!" },
    { from: "friday", text: "the boss's nephew set that 'server' up last summer. i thought it was a real server. it's a {red:dell desktop}?!", image: surprisedPikachuMeme, caption: "friday, realising the 'server' is a desktop pc" },
  ],
  [
    { from: "ramesh", text: "mystery #1 solved. DESKTOP-X7Q is the default name windows gives a new pc. so your website and its mysql database run on someone's old windows desktop." },
    { from: "ramesh", text: "this is how the office is probably wired up. nmap doesn't draw it for you, but now you can:" },
    { from: "system", text: "chaibyte office · network diagram", visual: "network-diagram" },
  ],
  [
    { from: "ramesh", text: "a few more ways to find who's alive:" },
    {
      from: "system",
      terminal: {
        command: `nmap -sn 192.168.1.1-50          # only addresses .1 to .50
nmap -sn 192.168.1.0/24 -oG - | grep Up   # one line per live host
nmap -sL 192.168.1.0/24           # just list targets, send nothing
sudo nmap -sn -PE 192.168.1.0/24  # force classic ICMP ping`,
      },
    },
    { from: "ramesh", text: "without sudo nmap can't send ARP, so it 'knocks' on ports 80 and 443 instead. it still works, just slower and it may miss shy devices." },
  ],
  [
    { from: "friday", text: "ok so we know {green:who} lives on the street. now what?" },
    { from: "ramesh", text: "now we walk up to {red:192.168.1.30} and check every door.", image: detectivePikachuMeme, caption: "ramesh, about to inspect DESKTOP-X7Q" },
    { from: "system", text: "chapter 3 complete. next: knocking on every door." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what does the -sn option do?",
    options: ["scans every port", "finds which hosts are alive, without scanning ports", "detects the os", "saves output to a file"],
    answer: 1,
    explanation: "-sn = ping scan. 'who is alive', no doors touched.",
  },
  {
    question: "in a ping sweep, what does one 'Nmap scan report for ...' line mean?",
    options: ["an open port", "an error", "one live device", "one closed port"],
    answer: 2,
    explanation: "every scan report line is one device that answered.",
  },
  {
    question: "how did nmap know DESKTOP-X7Q is a Dell?",
    options: ["it asked the boss", "from the first part of its MAC address", "from the hostname", "it took a photo"],
    answer: 1,
    explanation: "the first half of a MAC address identifies the manufacturer.",
  },
  {
    question: "how many hosts were up on friday's network?",
    options: ["1", "6", "254", "256"],
    answer: 1,
    explanation: "'256 IP addresses (6 hosts up)': 6 devices answered.",
  },
  {
    question: "why does nmap find devices that ignored the broadcast ping when run with sudo on the local network?",
    options: [
      "it guesses",
      "it uses ARP requests, which devices can't ignore",
      "it hacks the router first",
      "it uses bluetooth",
    ],
    answer: 1,
    explanation: "on a local network, root nmap uses ARP. devices must answer ARP to stay on the network.",
  },
  {
    question: "what turned out to be DESKTOP-X7Q?",
    options: ["the printer", "a hacker's laptop", "the office web server: an old windows desktop", "the router"],
    answer: 2,
    explanation: "192.168.1.30, the web server with mysql, is really a dell desktop running windows.",
  },
  {
    question: "which command only scans addresses 192.168.1.1 to 192.168.1.50 for live hosts?",
    options: ["nmap -sn 192.168.1.1-50", "nmap -sn 192.168.1.50/1", "nmap -p 1-50 192.168.1.0", "nmap -sV 1-50"],
    answer: 0,
    explanation: "a dash in the last number makes a range: 192.168.1.1-50.",
  },
  {
    question: "what does 'Host is up (0.0021s latency)' tell you?",
    options: ["the host is overloaded", "the device replied in about 2 milliseconds", "the host has 21 open ports", "the scan failed"],
    answer: 1,
    explanation: "latency = how long the reply took. 2 ms = same local network.",
  },
  {
    question: "why is the scanning machine (fridays-macbook) listed without a MAC address?",
    options: ["it's broken", "nmap doesn't need to ask its own machine", "macbooks have no MAC", "it's hidden by NAT"],
    answer: 1,
    explanation: "nmap already knows its own interface, so it just reports 'Host is up'.",
  },
  {
    question: "why is 'who is alive?' always the first step?",
    options: [
      "because it's the loudest",
      "you can't attack or protect a device you don't know exists",
      "because nmap requires it by law",
      "to make the wifi faster",
    ],
    answer: 1,
    explanation: "host discovery builds the list of targets for every later step.",
  },
];

const notes = `# chapter 03 · step 1: who is on the network?

> offtrck · nmap module · study notes

## the command
\`\`\`
sudo nmap -sn 192.168.1.0/24
\`\`\`
- \`-sn\` = **ping scan / host discovery only**. no port scan. (older name: \`-sP\`)
- target \`192.168.1.0/24\` = all 256 addresses of the office network.

## what friday found
| ip | hostname | vendor (from MAC) | what it really is |
|---|---|---|---|
| 192.168.1.1 | routerlogin.net | Netgear | router / gateway / wifi |
| 192.168.1.10 | fridays-macbook | Apple | the scanning machine |
| 192.168.1.20 | HPDA41C2 | Hewlett Packard | printer |
| 192.168.1.30 | DESKTOP-X7Q | Dell | the "web server" (windows desktop + mysql) |
| 192.168.1.40 | chaibyte-nas | Synology | NAS file storage |
| 192.168.1.50 | BOSS-LAPTOP | Apple | boss's laptop |

## how host discovery actually works
nmap picks a method depending on **where** the target is and **who** you are:
| situation | probes sent |
|---|---|
| root/admin, same local network | **ARP requests** (fastest, most reliable, can't be ignored) |
| root/admin, remote network | ICMP echo, TCP SYN to 443, TCP ACK to 80, ICMP timestamp |
| normal user | TCP connect() to ports 80 and 443 |

you can choose probes yourself:
- \`-PE\` ICMP echo · \`-PP\` timestamp · \`-PM\` netmask
- \`-PS22,80,443\` TCP SYN to given ports · \`-PA80\` TCP ACK · \`-PU53\` UDP
- \`-PR\` ARP ping (default on local ethernet)
- \`-Pn\` skip discovery, treat every host as up (useful when a firewall blocks pings, but much slower)
- \`--disable-arp-ping\` force IP-level probes on a LAN

## where the names come from
nmap does a **reverse DNS lookup** for each live host. on small networks the router's DNS knows the names devices sent when they requested an ip from DHCP (that's why we see DESKTOP-X7Q). use \`-n\` to skip DNS (faster, quieter) or \`-R\` to always resolve.

## where the vendor comes from
the first 3 bytes of a MAC address are the **OUI** (organizationally unique identifier), registered by the manufacturer with IEEE. nmap ships a database (\`nmap-mac-prefixes\`). note: MACs only travel inside the local network, so you only get vendors for hosts on your own subnet. modern phones use **randomized MACs** for privacy, so they often show as "Unknown".

## useful variations
\`\`\`
nmap -sn 192.168.1.1-50              # range
nmap -sn 192.168.1.0/24 --exclude 192.168.1.10
nmap -sn -iL targets.txt             # targets from a file
nmap -sn 192.168.1.0/24 -oG - | grep "Up"   # quick list
nmap -sL 192.168.1.0/24              # list scan: resolve names, send no probes
\`\`\`

## why DESKTOP-X7Q is a problem (preview)
- **shadow IT**: production service (website + database) on an unmanaged desktop.
- desktops aren't hardened like servers: extra services, shared folders, remote desktop.
- nobody patches it because nobody knew it existed.

## drawing the network
nmap gives you a list, not a picture. after a sweep, draw the topology: internet -> router -> wifi/switch -> devices. later \`--traceroute\` (part of \`-A\`) shows hop paths, and zenmap's "topology" tab draws a graph automatically.

## remember
- discovery first, always. it builds your target list.
- \`-sn\` is quiet: no ports touched.
- run as root/admin on a LAN for ARP discovery.
`;

export const chapterThree: Chapter = { title: "chapter 03", subtitle: "who is on the network", scenes, quiz, notes };
