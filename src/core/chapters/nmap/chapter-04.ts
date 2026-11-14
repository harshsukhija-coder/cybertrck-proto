import knockKnockMeme from "../../../assets/memes/knock-knock.gif";
import sneakyHomerMeme from "../../../assets/memes/sneaky-homer.gif";
import surprisedPikachuMeme from "../../../assets/memes/surprised-pikachu.gif";
import waitingSkeletonMeme from "../../../assets/memes/waiting-skeleton.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 4 · step 2: knocking on every door" },
    { from: "ramesh", text: "remember: every device is a house, and {green:ports} are its doors. each house has {yellow:65,535} doors." },
    { from: "ramesh", text: "behind an open door, a program is waiting for visitors. web server on door {pink:80}, database on {red:3306}, remote desktop on {orange:3389}..." },
    { from: "friday", text: "so we knock on doors and see which ones open?", image: knockKnockMeme, caption: "nmap, knocking on port 80" },
  ],
  [
    { from: "ramesh", text: "exactly. the simplest port scan is just nmap + the ip. let's knock on DESKTOP-X7Q:" },
    {
      from: "system",
      terminal: {
        command: "sudo nmap 192.168.1.30",
        output: `Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-13 10:51 IST
Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0031s latency).
Not shown: {purple:994 filtered tcp ports (no-response)}
{cyan:PORT}     {cyan:STATE} {cyan:SERVICE}
{pink:80/tcp}   {green:open}  http
{yellow:135/tcp}  {green:open}  msrpc
{yellow:139/tcp}  {green:open}  netbios-ssn
{yellow:445/tcp}  {green:open}  microsoft-ds
{red:3306/tcp} {green:open}  mysql
{orange:3389/tcp} {green:open}  ms-wbt-server
MAC Address: 18:66:DA:2E:7C:91 (Dell)

Nmap done: 1 IP address (1 host up) scanned in 4.87 seconds`,
      },
    },
  ],
  [
    { from: "ramesh", text: "three columns. that's all you need to read:" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "reading a port scan",
        text: "{cyan:PORT} -> the door number + protocol (tcp).\n{cyan:STATE} -> {green:open} = someone answers · closed = nobody home, but the house replied · {purple:filtered} = a firewall ate the knock, no reply at all.\n{cyan:SERVICE} -> nmap's {yellow:guess} from the port number. 3306 is 'usually' mysql. it's not confirmed yet!\n{purple:Not shown: 994 filtered} -> the boring doors, hidden to keep the output short.",
      },
    },
    { from: "system", text: "DESKTOP-X7Q's doors:", visual: "port-doors" },
  ],
  [
    { from: "ramesh", text: "what we see: {pink:80} = a website. {yellow:135/139/445} = windows file sharing (SMB). {red:3306} = mysql, open to the {red:whole office wifi}. {orange:3389} = remote desktop. anyone could try to log in." },
    { from: "friday", text: "that's... a lot of open doors for a 'server'." },
  ],
  // SYN vs connect
  [
    { from: "ramesh", text: "now a secret. when you run nmap as {pink:root/admin}, the default scan is a {pink:SYN scan} ({pink:-sS})." },
    { from: "ramesh", text: "a normal connection is a 3-step handshake: {cyan:SYN} ('hi') -> {yellow:SYN/ACK} ('hi, come in') -> {green:ACK} ('thanks, i'm in')." },
    { from: "ramesh", text: "a SYN scan says 'hi', hears 'come in'... and then {red:runs away} ({red:RST}). it {pink:starts} the connection but never {pink:finishes} it. the door opened, that's all we needed to know." },
    { from: "system", text: "the two handshakes side by side:", visual: "handshake" },
  ],
  [
    { from: "ramesh", text: "the other option is {orange:-sT}, the {orange:TCP connect scan}. it completes the full handshake, like a polite visitor. let's compare them with -v (verbose) on:" },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -sS -v 192.168.1.30",
        title: "syn scan (stealthy)",
        output: `Initiating {pink:SYN Stealth Scan} at 10:53
Scanning DESKTOP-X7Q (192.168.1.30) [1000 ports]
Discovered open port 80/tcp on 192.168.1.30
Discovered open port 3306/tcp on 192.168.1.30
...
Completed {pink:SYN Stealth Scan} at 10:53, {green:4.21s elapsed} (1000 total ports)`,
      },
    },
    {
      from: "system",
      terminal: {
        command: "nmap -sT -v 192.168.1.30",
        title: "connect scan (full handshake)",
        output: `Initiating {orange:Connect Scan} at 10:54
Scanning DESKTOP-X7Q (192.168.1.30) [1000 ports]
Discovered open port 80/tcp on 192.168.1.30
Discovered open port 3306/tcp on 192.168.1.30
...
Completed {orange:Connect Scan} at 10:54, {yellow:7.93s elapsed} (1000 total ports)`,
      },
    },
    { from: "ramesh", text: "same open ports. but look at what DESKTOP-X7Q's own logs recorded during the {orange:-sT} scan:" },
    {
      from: "system",
      terminal: {
        command: "type C:\\xampp\\apache\\logs\\access.log",
        prompt: "DESKTOP-X7Q>",
        title: "on the target",
        output: `{red:192.168.1.10} - - [13/Nov/2026:10:54:02 +0530] "-" 408 -
{red:192.168.1.10} - - [13/Nov/2026:10:54:02 +0530] "-" 408 -
[mysql] {red:Aborted connection} 31 to db: 'unconnected' host: '{red:192.168.1.10}' (Got an error reading communication packets)`,
      },
    },
    { from: "ramesh", text: "during the {pink:-sS} scan? {green:nothing} in those logs. apache and mysql never saw a finished connection, so they had nothing to write down." },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "-sS vs -sT",
        text: "{pink:-sS SYN scan}          | {orange:-sT connect scan}\nSYN -> SYN/ACK -> RST    | SYN -> SYN/ACK -> ACK -> RST\nhalf-open, never finishes | full connection\nfast + quiet              | slower + noisy\nslips past app logs       | shows up in app logs\nneeds root/admin          | works as a normal user\ndefault when root         | default when not root",
      },
    },
    { from: "friday", text: "so -sT is more reliable but louder. is it worth it?" },
    { from: "ramesh", text: "for an attacker? {red:almost never}. a real hacker wants to stay under the radar, so they prefer the stealthy {pink:SYN scan}. -sT is for when you can't be root." },
    { from: "ramesh", text: "but 'stealth' isn't invisibility. a firewall or an IDS can still spot thousands of half-open knocks. it's quiet, not silent.", image: sneakyHomerMeme, caption: "a SYN scan backing away before the handshake completes" },
  ],
  // Multiple targets
  [
    { from: "friday", text: "do i have to scan one ip at a time?" },
    { from: "ramesh", text: "nope. commas work in the last number. this scans .1, .20, .40 and .50 in one go:" },
    {
      from: "system",
      terminal: {
        command: "sudo nmap 192.168.1.1,20,40,50",
        output: `Nmap scan report for routerlogin.net ({yellow:192.168.1.1})
PORT    STATE SERVICE
53/tcp  open  domain
80/tcp  open  http
443/tcp open  https

Nmap scan report for HPDA41C2 ({blue:192.168.1.20})
PORT     STATE SERVICE
80/tcp   open  http
443/tcp  open  https
631/tcp  open  ipp
{orange:9100/tcp open  jetdirect}

Nmap scan report for chaibyte-nas ({purple:192.168.1.40})
PORT     STATE SERVICE
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
{orange:5000/tcp open  upnp}
{orange:5001/tcp open  commplex-link}

Nmap scan report for BOSS-LAPTOP ({orange:192.168.1.50})
All 1000 scanned ports on BOSS-LAPTOP (192.168.1.50) are in ignored states.
Not shown: 1000 {green:filtered} tcp ports (no-response)

Nmap done: 4 IP addresses (4 hosts up) scanned in 9.12 seconds`,
      },
    },
    { from: "ramesh", text: "the boss's laptop: {green:all filtered}. its firewall is on. good boss. the nas on {orange:5000/5001} is the synology admin panel. remember that one." },
  ],
  [
    { from: "ramesh", text: "all the ways to tell nmap who to scan:" },
    {
      from: "system",
      terminal: {
        command: `nmap 192.168.1.30                    # {pink:one host}
nmap 192.168.1.1 192.168.1.30        # {cyan:a list, separated by spaces}
nmap 192.168.1.1,20,40,50            # {yellow:commas in the last number}
nmap 192.168.1.1-50                  # {orange:a range}
nmap 192.168.1.0/24                  # {green:the whole subnet (CIDR)}
nmap -iL targets.txt                 # {purple:read targets from a file}
nmap 192.168.1.0/24 --exclude 192.168.1.10   # {red:skip yourself}`,
      },
    },
  ],
  // All ports
  [
    { from: "ramesh", text: "one more secret. by default nmap only checks the {yellow:1000 most common ports}. out of 65,535." },
    { from: "friday", text: "so it skipped 98% of the doors??" },
    { from: "ramesh", text: "yep. lazy admins love hiding things on weird ports. so attackers check {red:all} of them with {yellow:-p-}." },
    { from: "system", text: "the 1000 default ports vs everything:", visual: "port-coverage" },
  ],
  [
    { from: "ramesh", text: "{yellow:-p} = which ports. {yellow:-} = all of them (1-65535). same thing as -p 1-65535:" },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -p- 192.168.1.30",
        output: `Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-13 11:02 IST
Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0030s latency).
Not shown: {purple:65524 filtered tcp ports (no-response)}
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
445/tcp   open  microsoft-ds
3306/tcp  open  mysql
3389/tcp  open  ms-wbt-server
{yellow:33060/tcp open  mysqlx}
{yellow:49664/tcp open  unknown}
{yellow:49665/tcp open  unknown}
{yellow:49668/tcp open  unknown}
{yellow:49669/tcp open  unknown}
MAC Address: 18:66:DA:2E:7C:91 (Dell)

Nmap done: 1 IP address (1 host up) scanned in {red:118.40 seconds}`,
      },
    },
    { from: "friday", text: "{yellow:5 new doors} the default scan never saw!", image: surprisedPikachuMeme, caption: "friday seeing port 33060" },
  ],
  [
    { from: "ramesh", text: "{yellow:33060} is mysql's newer 'x protocol'. a second door into the same database. {yellow:4966x} are windows' internal RPC doors." },
    { from: "ramesh", text: "the price: {red:2 minutes} instead of 5 seconds. checking 65,535 doors takes a while.", image: waitingSkeletonMeme, caption: "you, waiting for -p- on a /24 network" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "the -p option",
        text: "{yellow:-p 80} -> one port\n{yellow:-p 22,80,443} -> a list\n{yellow:-p 1-1024} -> a range\n{yellow:-p-} -> all 65,535\n{yellow:-F} -> fast: only the top 100\n{yellow:--top-ports 20} -> the 20 most common",
      },
    },
  ],
  [
    { from: "friday", text: "so now we know DESKTOP-X7Q has 11 open doors. we know what's behind them!" },
    { from: "ramesh", text: "do we? an open port only tells us {red:something is listening}. not {red:what}." },
    { from: "ramesh", text: "'mysql' in the SERVICE column is just nmap's guess from the number. anyone can run anything on 3306. next we make them tell us their real name and version." },
    { from: "system", text: "chapter 4 complete. next: the full picture." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "how many TCP ports does one device have?",
    options: ["1,000", "1,024", "65,535", "unlimited"],
    answer: 2,
    explanation: "ports go from 1 to 65,535 (port 0 is reserved).",
  },
  {
    question: "what does STATE 'filtered' mean?",
    options: ["the port is open", "a program refused the connection", "a firewall dropped the probe, no reply came back", "the port is broken"],
    answer: 2,
    explanation: "filtered = no answer at all, usually a firewall. closed = the host replied 'nobody here'.",
  },
  {
    question: "what is the default scan type when you run nmap as root/admin?",
    options: ["-sT connect scan", "-sS SYN scan", "-sn ping scan", "-sU UDP scan"],
    answer: 1,
    explanation: "with raw packet privileges nmap uses the SYN (half-open) scan by default.",
  },
  {
    question: "how does a SYN scan end the conversation after getting SYN/ACK?",
    options: ["it sends ACK", "it sends RST, never completing the handshake", "it sends another SYN", "it waits forever"],
    answer: 1,
    explanation: "SYN -> SYN/ACK -> RST. the connection is never finished.",
  },
  {
    question: "why did apache and mysql log the -sT scan but not the -sS scan?",
    options: [
      "-sT completes the full handshake, so the application sees a real connection",
      "-sS uses a vpn",
      "-sT is faster",
      "the logs were deleted",
    ],
    answer: 0,
    explanation: "applications only see finished connections. -sS never finishes them.",
  },
  {
    question: "which scan would a stealthy attacker usually prefer?",
    options: ["-sT", "-sS", "-A with -v", "a broadcast ping"],
    answer: 1,
    explanation: "the SYN scan is faster and quieter. but firewalls/IDS can still detect it.",
  },
  {
    question: "which command scans 192.168.1.1, .20, .40 and .50?",
    options: ["nmap 192.168.1.1-50", "nmap 192.168.1.1,20,40,50", "nmap 192.168.1.0/50", "nmap -p 1,20,40,50 192.168.1.0"],
    answer: 1,
    explanation: "commas in the last number list specific hosts. 1-50 would scan all 50.",
  },
  {
    question: "by default, how many ports does nmap scan?",
    options: ["all 65,535", "the 1,000 most common", "only port 80", "the first 1,024"],
    answer: 1,
    explanation: "the top 1,000 most common ports, from nmap's own statistics.",
  },
  {
    question: "what does -p- mean?",
    options: ["skip all ports", "scan all ports 1-65535", "scan only privileged ports", "print the port list"],
    answer: 1,
    explanation: "-p chooses ports; '-' alone means every port.",
  },
  {
    question: "after a port scan shows 3306/tcp open mysql, what do we know for sure?",
    options: [
      "it's mysql version 5.7",
      "something is listening on port 3306, but not exactly what",
      "the database has no password",
      "the os is linux",
    ],
    answer: 1,
    explanation: "the SERVICE column is a guess from the port number. version detection confirms it.",
  },
];

const notes = `# chapter 04 · step 2: knocking on every door

> offtrck · nmap module · study notes

## ports in one minute
- a port is a 16-bit number (1-65535) that identifies a program on a host.
- **well-known** 0-1023 (http 80, https 443, ssh 22, smb 445) · **registered** 1024-49151 (mysql 3306, rdp 3389) · **dynamic/ephemeral** 49152-65535 (temporary, windows RPC uses 49664+).
- TCP and UDP each have their own 65,535 ports. nmap scans TCP by default; \`-sU\` scans UDP (slow, but finds DNS 53, SNMP 161, etc.).

## the basic scan
\`\`\`
sudo nmap 192.168.1.30
\`\`\`
| port | service | meaning on DESKTOP-X7Q |
|---|---|---|
| 80 | http | the company website (apache) |
| 135 | msrpc | windows RPC |
| 139 / 445 | netbios / smb | windows file sharing |
| 3306 | mysql | database, reachable by the whole office |
| 3389 | ms-wbt-server | remote desktop (RDP) |

### the 6 port states
| state | what happened |
|---|---|
| open | an application accepted the probe (SYN/ACK) |
| closed | host answered with RST, nothing listens |
| filtered | no answer or ICMP unreachable, a firewall dropped it |
| unfiltered | reachable, but open/closed unknown (ACK scan only) |
| open\\|filtered | can't tell (common in UDP / null / fin / xmas scans) |
| closed\\|filtered | can't tell (idle scan) |

add \`--reason\` to see why nmap chose each state, \`--open\` to only show open ports.

## the TCP 3-way handshake
\`\`\`
client  --- SYN --->      server   "can i connect?"
client  <-- SYN/ACK ---   server   "yes" (port open)   or RST (port closed)
client  --- ACK --->      server   "connected"
\`\`\`

## -sS (SYN / half-open / stealth) vs -sT (connect)
| | -sS | -sT |
|---|---|---|
| packets | SYN -> SYN/ACK -> **RST** | SYN -> SYN/ACK -> ACK -> RST |
| connection completed? | no | yes |
| speed | fast | slower (OS does full connects) |
| application logs | usually nothing | logged (apache 408, mysql "aborted connection") |
| privileges | root/admin (raw packets) | any user (uses the OS connect() call) |
| default when | running as root | running as normal user |

**detection:** stealth is relative. firewalls, IDS (snort/suricata) and EDR easily flag bursts of SYNs to many ports from one ip. timing (\`-T0\` to \`-T5\`) trades speed for subtlety. \`-T4\` is common on LANs, \`-T2\` or lower when trying to avoid notice.

## specifying targets
\`\`\`
nmap 192.168.1.30                       # single host
nmap 192.168.1.1 192.168.1.30           # space separated
nmap 192.168.1.1,20,40,50               # comma list in an octet
nmap 192.168.1.1-50                     # range
nmap 192.168.1-3.1                      # ranges in any octet
nmap 192.168.1.0/24                     # CIDR
nmap scanme.nmap.org                    # hostname
nmap -iL targets.txt                    # from a file (one per line)
nmap 192.168.1.0/24 --exclude 192.168.1.10
nmap -iR 10 -p 80                       # 10 random internet hosts (don't!)
\`\`\`

## choosing ports
\`\`\`
-p 80                 single
-p 22,80,443          list
-p 1-1024             range
-p-                   all 65535
-p U:53,T:80          udp + tcp
-F                    top 100 (fast)
--top-ports 2000      top N
-r                    in order (default is random)
\`\`\`

### why scan all ports?
the top 1000 ports cover ~93% of what's normally open, but admins hide things (dev servers on 8081, databases on 33060, ssh on 2222, backdoors on 31337). a full \`-p-\` scan found 5 extra ports on DESKTOP-X7Q:
- 33060 mysqlx: MySQL X protocol, a second door to the same database
- 49664-49669: windows RPC dynamic ports

cost: 65x more probes. on a /24 that adds up. a common approach: fast full scan first (\`-p- --min-rate 1000\`), then deep scan only the open ports.

## remember
- an open port = **something is listening**. not *what*. the SERVICE column is just a lookup in \`nmap-services\` by port number.
- next step: version detection (\`-sV\`) makes services tell us their real name and version.
`;

export const chapterFour: Chapter = { title: "chapter 04", subtitle: "knocking on every door", scenes, quiz, notes };
