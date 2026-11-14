import csiSunglassesMeme from "../../../assets/memes/csi-sunglasses.gif";
import detectivePikachuMeme from "../../../assets/memes/detective-pikachu.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import imInMeme from "../../../assets/memes/im-in.gif";
import shutItDownMeme from "../../../assets/memes/shut-it-down.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 5 · steps 3-5: the full picture" },
    { from: "ramesh", text: "so far: we know {cyan:who's alive} and which {green:doors are open}. but not {orange:who answers} them." },
  ],
  // Step 3: -sV
  [
    { from: "ramesh", text: "step 3: {orange:-sV}, version detection. nmap knocks, waits for an answer, and compares the reply against thousands of known 'voices'." },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -sV 192.168.1.30",
        output: `Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0029s latency).
Not shown: 994 filtered tcp ports (no-response)
PORT     STATE SERVICE       {orange:VERSION}
80/tcp   open  http          {pink:Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)}
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3306/tcp open  mysql         {red:MySQL 5.7.33}
3389/tcp open  ms-wbt-server Microsoft Terminal Services
MAC Address: 18:66:DA:2E:7C:91 (Dell)
Service Info: OS: {cyan:Windows}; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 17.92 seconds`,
      },
    },
  ],
  [
    { from: "ramesh", text: "now the doors have names and ages:" },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "what -sV revealed",
        text: "{pink:Apache 2.4.58 + PHP 8.2.12 on Win64} -> that's {pink:XAMPP}, a 'web server in a box' meant for {pink:developers' laptops}, not production.\n{red:MySQL 5.7.33} -> mysql 5.7 reached {red:end of life in october 2023}. no more security fixes. attackers google 'mysql 5.7.33 exploit' next.\n{cyan:Service Info: OS: Windows} -> the services themselves leak the os.\n{yellow:microsoft-ds?} -> the '?' means nmap isn't sure.",
      },
    },
    { from: "friday", text: "so the version number is basically a shopping list for hackers?" },
    { from: "ramesh", text: "exactly. old version = known bugs = public exploits. that's why patching matters so much.", image: csiSunglassesMeme, caption: "ramesh reading 'MySQL 5.7.33'" },
  ],
  // Step 4: OS fingerprinting
  [
    { from: "ramesh", text: "step 4. i know the {green:open ports}, the {orange:services} and their {orange:versions}. the next question: what {purple:operating system} is this house built with?" },
    { from: "ramesh", text: "this is {purple:OS fingerprinting}. nmap sends specially crafted, slightly weird packets. every os has little {purple:quirks} in how it replies: the starting TTL, the window size, which options it likes. together they're like a fingerprint." },
    { from: "system", text: "how nmap reads the fingerprint:", visual: "os-fingerprint" },
  ],
  [
    {
      from: "system",
      terminal: {
        command: "sudo nmap -O 192.168.1.30",
        output: `Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0031s latency).
Not shown: 994 filtered tcp ports (no-response)
PORT     STATE SERVICE
80/tcp   open  http
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
445/tcp  open  microsoft-ds
3306/tcp open  mysql
3389/tcp open  ms-wbt-server
MAC Address: 18:66:DA:2E:7C:91 (Dell)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: {purple:general purpose}
Running: {purple:Microsoft Windows 10}
OS CPE: cpe:/o:microsoft:windows_10
OS details: {pink:Microsoft Windows 10 1607 - 11 23H2}
Network Distance: {yellow:1 hop}

OS detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.40 seconds`,
      },
    },
    { from: "ramesh", text: "{purple:Running: Windows 10}. {pink:OS details} gives the possible versions. {yellow:Network Distance: 1 hop} = it's on our street, no router in between." },
    { from: "ramesh", text: "see that {orange:warning}? fingerprinting works best with at least one {green:open} and one {red:closed} port. the firewall made everything else 'filtered', so nmap is a little less sure. it needs root/admin too." },
  ],
  [
    { from: "friday", text: "can i fingerprint the whole office at once?" },
    { from: "ramesh", text: "of course. any target syntax works. {cyan:--osscan-limit} skips hosts that don't look promising, to save time:" },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -O --osscan-limit 192.168.1.1,20,30,40",
        output: `Nmap scan report for routerlogin.net (192.168.1.1)
Running: {yellow:Linux 3.X|4.X}
OS details: {yellow:Linux 3.2 - 4.14} (embedded, Netgear firmware)

Nmap scan report for HPDA41C2 (192.168.1.20)
Device type: {blue:printer}
Running: {blue:HP embedded}
OS details: {blue:HP LaserJet printer}

Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Running: {red:Microsoft Windows 10}
OS details: {red:Microsoft Windows 10 1607 - 11 23H2}

Nmap scan report for chaibyte-nas (192.168.1.40)
Running: {purple:Linux 4.X}
OS details: {purple:Linux 4.4} (Synology DiskStation Manager)

Nmap done: 4 IP addresses (4 hosts up) scanned in 14.83 seconds`,
      },
    },
    { from: "friday", text: "the router and the nas are secretly linux?", image: detectivePikachuMeme, caption: "friday learning his printer has an os" },
    { from: "ramesh", text: "most 'boxes' are tiny linux computers. which means they need updates too." },
  ],
  // Step 5: -A
  [
    { from: "ramesh", text: "step 5. notice something? i've been running scans {yellow:one at a time}: hosts, then ports, then services, then versions, then os." },
    { from: "ramesh", text: "nmap can do it all in {red:one shot}: {red:-A}, the {red:aggressive scan}. os detection + version detection + default scripts + traceroute. and {blue:-oN} saves the result to a file so we have a report." },
    {
      from: "system",
      terminal: {
        command: "sudo nmap -A -oN friday_network.txt 192.168.1.30",
        output: `Starting Nmap 7.95 ( https://nmap.org ) at 2026-11-13 11:20 IST
Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0028s latency).
Not shown: 994 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
80/tcp   open  http          Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
|_http-server-header: Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12
| http-title: {pink:Welcome to XAMPP}
|_Requested resource was http://192.168.1.30/dashboard/
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
445/tcp  open  microsoft-ds?
3306/tcp open  mysql         MySQL 5.7.33
| mysql-info:
|   Protocol: 10
|   Version: {red:5.7.33}
|   Thread ID: 41
|   Status: Autocommit
|_  Auth Plugin Name: mysql_native_password
3389/tcp open  ms-wbt-server Microsoft Terminal Services
| rdp-ntlm-info:
|   Target_Name: DESKTOP-X7Q
|   NetBIOS_Computer_Name: {red:DESKTOP-X7Q}
|   DNS_Computer_Name: DESKTOP-X7Q
|   Product_Version: {purple:10.0.19045}
|_  System_Time: 2026-11-13T05:50:41+00:00
MAC Address: 18:66:DA:2E:7C:91 (Dell)
Device type: general purpose
Running: Microsoft Windows 10
OS details: Microsoft Windows 10 1607 - 11 23H2
Network Distance: 1 hop
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-security-mode:
|   3:1:1:
|_    {orange:Message signing enabled but not required}
|_nbstat: NetBIOS name: DESKTOP-X7Q, NetBIOS user: <unknown>, NetBIOS MAC: 18:66:da:2e:7c:91 (Dell)

{cyan:TRACEROUTE}
HOP RTT     ADDRESS
1   2.84 ms DESKTOP-X7Q (192.168.1.30)

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in {yellow:41.27 seconds}`,
      },
    },
  ],
  [
    { from: "ramesh", text: "the lines starting with {green:|} are {green:scripts} (nmap's plug-ins, called NSE). they asked each service extra questions:" },
    {
      from: "system",
      callout: {
        tone: "warning",
        title: "what -A added",
        text: "{pink:http-title: Welcome to XAMPP} -> the default XAMPP dashboard is still on the 'website'.\n{red:mysql-info} -> the database happily describes itself to anyone who asks.\n{purple:Product_Version 10.0.19045} -> windows 10 22H2, exactly. remote desktop spilled it.\n{orange:message signing not required} -> SMB traffic can be tampered with (relay attacks).\n{cyan:TRACEROUTE} -> 1 hop: same network.",
      },
    },
    { from: "friday", text: "one command and it knows the exact windows build??", image: imInMeme, caption: "friday after his first -A scan" },
  ],
  [
    { from: "ramesh", text: "and the report got saved. let's check:" },
    {
      from: "system",
      terminal: {
        command: "ls",
        output: "Desktop  Documents  Downloads  {blue:friday_network.txt}",
      },
    },
    {
      from: "system",
      terminal: {
        command: "cat friday_network.txt",
        output: `{green:# Nmap 7.95 scan initiated Fri Nov 13 11:20:02 2026 as: nmap -A -oN friday_network.txt 192.168.1.30}
Nmap scan report for DESKTOP-X7Q (192.168.1.30)
Host is up (0.0028s latency).
Not shown: 994 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
80/tcp   open  http          Apache httpd 2.4.58 ((Win64) OpenSSL/3.1.3 PHP/8.2.12)
...
{green:# Nmap done at Fri Nov 13 11:20:43 2026 -- 1 IP address (1 host up) scanned in 41.27 seconds}`,
      },
    },
    { from: "ramesh", text: "{blue:-oN} = 'normal' output, exactly what you saw on screen. also handy: {cyan:grep open friday_network.txt} to only see open ports. ({cyan:type} instead of cat on windows.)" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "saving results",
        text: "{blue:-oN file.txt} -> normal, for humans\n{blue:-oX file.xml} -> xml, for other tools\n{blue:-oG file.gnmap} -> grepable, one line per host\n{blue:-oA basename} -> all three at once",
      },
    },
  ],
  [
    { from: "system", text: "everything we did, as one pipeline:", visual: "recon-pipeline" },
    { from: "ramesh", text: "and here's the thing, friday. we didn't break anything. we didn't log in anywhere. we didn't guess a single password." },
    { from: "ramesh", text: "all of this is {cyan:recon} (reconnaissance). {green:no breaking. just looking.} and we already know enough to write a scary report." },
  ],
  // Defense
  [
    { from: "friday", text: "ok i'm scared now. how do i make our network {green:less transparent}?" },
    { from: "ramesh", text: "five moves. in order of 'do this today':", image: shutItDownMeme, caption: "friday walking to DESKTOP-X7Q" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "1 · reduce the attack surface",
        text: "close every port you don't need. shut down unused services.\non DESKTOP-X7Q: does the website need {orange:SMB (445)}? {orange:RDP (3389)}? {red:mysql open to everyone (3306, 33060)}? no. mysql should listen on {green:127.0.0.1} only.\nfewer doors = fewer ways in.",
      },
    },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "2 · firewall + network segmentation",
        text: "turn the windows firewall on and only allow port 80/443 in.\nsplit the network into zones (VLANs): {cyan:staff laptops} · {red:servers} · {blue:printers/iot} · {purple:guest wifi}. a hacked printer shouldn't be able to reach the database.",
      },
    },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "3 · intrusion detection (IDS)",
        text: "tools like {yellow:snort} and {yellow:suricata} watch network traffic and raise an alarm on patterns like '1000 SYNs from one ip in 5 seconds'. that's our nmap scan. we'll learn these tools in a later module.",
      },
    },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "4 · patch and update everything",
        text: "{red:mysql 5.7} -> upgrade to 8.x. old apache/php -> update. router, printer, nas firmware too (remember: they're all secretly linux).\nbetter: move the website to a {green:real server} or a hosting provider, and retire XAMPP.",
      },
    },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "5 · hide admin panels behind a vpn",
        text: "the nas admin page ({orange:5000/5001}), the router panel, remote desktop: none of them should face the office wifi directly. put them behind a {purple:vpn}, so you must connect securely first. that's our next module.",
      },
    },
  ],
  [
    { from: "friday", text: "so after all that, if someone runs nmap on us again..." },
    { from: "ramesh", text: "they'll see a few {purple:filtered} doors, a boring website, and an IDS alert will ping {green:you}. that's the goal. not invisible, just {green:boring and noisy to attack}.", image: hackermanMeme, caption: "friday, a few chapters ago vs now" },
    { from: "system", text: "nmap module complete. next module: vpn · how it hides your doors." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "which option makes nmap detect service names and versions?",
    options: ["-sn", "-sV", "-O", "-p-"],
    answer: 1,
    explanation: "-sV = service/version detection.",
  },
  {
    question: "why is 'MySQL 5.7.33' a problem?",
    options: [
      "mysql is always insecure",
      "5.7 is end-of-life: no more security fixes, known public bugs",
      "the version number is too long",
      "mysql only works on linux",
    ],
    answer: 1,
    explanation: "old, unsupported versions have known vulnerabilities and no patches coming.",
  },
  {
    question: "what does OS fingerprinting rely on?",
    options: [
      "asking the user",
      "the quirks in how each os replies to specially crafted packets",
      "the wallpaper of the target",
      "the MAC address only",
    ],
    answer: 1,
    explanation: "ttl, tcp window size, options and other quirks form a fingerprint nmap matches against its database.",
  },
  {
    question: "which option enables OS detection?",
    options: ["-O", "-os", "-sO", "-V"],
    answer: 0,
    explanation: "capital O for OS. (-sO is an ip protocol scan, -V prints nmap's version.)",
  },
  {
    question: "OS detection works best when the target has...",
    options: [
      "only filtered ports",
      "at least one open and one closed port",
      "no open ports",
      "a static ip",
    ],
    answer: 1,
    explanation: "nmap compares replies from open and closed ports. that's why it warned us.",
  },
  {
    question: "what does -A include?",
    options: [
      "only a faster ping",
      "os detection, version detection, default scripts and traceroute",
      "a password attack",
      "all 65535 ports",
    ],
    answer: 1,
    explanation: "-A = aggressive: -O + -sV + -sC + --traceroute. (it does NOT scan all ports.)",
  },
  {
    question: "in sudo nmap -A -oN friday_network.txt 192.168.1.30, what does -oN do?",
    options: [
      "turns off networking",
      "saves the normal output to friday_network.txt",
      "only scans open ports",
      "scans the network named 'friday'",
    ],
    answer: 1,
    explanation: "-oN writes normal (human-readable) output to the file.",
  },
  {
    question: "lines starting with '|' in nmap output come from...",
    options: ["errors", "NSE scripts", "the firewall", "the router's logs"],
    answer: 1,
    explanation: "the nmap scripting engine (NSE) asked services extra questions, like http-title and mysql-info.",
  },
  {
    question: "everything friday and ramesh did with nmap is called...",
    options: ["exploitation", "reconnaissance: just looking, no breaking", "phishing", "a ddos attack"],
    answer: 1,
    explanation: "recon gathers information without breaking in.",
  },
  {
    question: "which is NOT one of ramesh's defense moves?",
    options: [
      "close unused ports and services",
      "firewall + network segmentation",
      "turn off all logs so hackers can't read them",
      "hide admin panels behind a vpn",
    ],
    answer: 2,
    explanation: "logs help you detect attacks. the five moves: reduce attack surface, firewall + segmentation, IDS, patch, vpn.",
  },
];

const notes = `# chapter 05 · steps 3-5: the full picture

> offtrck · nmap module · study notes

## step 3 · service + version detection (-sV)
\`\`\`
sudo nmap -sV 192.168.1.30
\`\`\`
**how it works:** for each open port nmap first listens for a banner (many services greet you), then sends probes from \`nmap-service-probes\` (~6,000 match patterns) and compares replies with regular expressions. it ignores the port number, so mysql on port 8080 is still identified as mysql.

- \`--version-intensity 0-9\` how many probes to try (default 7)
- \`--version-light\` (2) / \`--version-all\` (9)
- a \`?\` after the service (e.g. \`microsoft-ds?\`) = low confidence.

**what we learned:** Apache 2.4.58 + PHP 8.2.12 on Win64 = **XAMPP**, a development bundle. MySQL **5.7.33** is end-of-life (oct 2023). versions are searched in CVE databases (nvd.nist.gov, exploit-db, \`searchsploit\`).

## step 4 · os fingerprinting (-O)
\`\`\`
sudo nmap -O 192.168.1.30
\`\`\`
nmap sends ~16 specially crafted TCP, UDP and ICMP probes and measures things like:
| quirk | example |
|---|---|
| initial TTL | linux/macos 64, windows 128, cisco/printers 255 |
| TCP window size | windows 64240 / 65535, linux 29200 / 64240 |
| TCP options & their order | MSS, SACK, timestamps, window scale |
| IP ID sequence | incremental, random, zero |
| responses to odd flags | FIN/PSH/URG to closed ports, etc. |

the result is matched against \`nmap-os-db\` (thousands of fingerprints).

- needs **root/admin** (raw packets).
- needs **≥1 open and ≥1 closed port** for best accuracy.
- \`--osscan-guess\` shows best guesses with % when unsure. \`--osscan-limit\` skips unpromising hosts.
- **passive** fingerprinting (p0f) does the same just by watching traffic, without sending anything.

multiple hosts: any target syntax works: \`sudo nmap -O 192.168.1.1,20,30,40\` or \`192.168.1.0/24\`.

## step 5 · the aggressive scan (-A)
\`\`\`
sudo nmap -A -oN friday_network.txt 192.168.1.30
\`\`\`
\`-A\` = \`-O\` + \`-sV\` + \`-sC\` (default scripts) + \`--traceroute\`. it does **not** add \`-p-\`; combine them for a full audit: \`sudo nmap -A -p- -T4 -oA full 192.168.1.30\`.

### NSE (nmap scripting engine)
600+ lua scripts in categories: \`default\`, \`safe\`, \`discovery\`, \`version\`, \`vuln\`, \`auth\`, \`brute\`, \`intrusive\`, \`exploit\`, \`malware\`.
\`\`\`
nmap --script http-title 192.168.1.30
nmap --script "vuln" 192.168.1.30          # checks for known vulnerabilities (intrusive!)
nmap --script-help mysql-info
ls /usr/share/nmap/scripts | grep mysql     # browse scripts (linux)
\`\`\`
script output lines start with \`|\` (and \`|_\` for the last line).

### reading the -A results for DESKTOP-X7Q
| finding | why it matters |
|---|---|
| http-title "Welcome to XAMPP" | default dev setup exposed as production |
| mysql-info 5.7.33 | EOL database, reachable from the whole LAN |
| rdp-ntlm-info 10.0.19045 | exact windows build leaked, RDP exposed |
| smb2 signing not required | enables NTLM relay attacks |
| traceroute 1 hop | same broadcast domain as every laptop |

### output formats
| flag | format | use |
|---|---|---|
| \`-oN\` | normal | reading, reports |
| \`-oX\` | xml | import into tools (metasploit, ndiff, xsltproc to html) |
| \`-oG\` | grepable | \`grep open\`, quick scripting |
| \`-oA name\` | all three | the professional habit |

\`ls\` lists files, \`cat file\` prints it (\`type\` on windows cmd, \`Get-Content\` in powershell). \`grep open friday_network.txt\` filters lines. \`ndiff old.xml new.xml\` compares two scans, great for spotting new devices.

## recon: no breaking, just looking
the classic attack chain: **reconnaissance -> scanning -> gaining access -> maintaining access -> covering tracks**. everything in this module is the first two steps. it's also exactly what defenders do in an **asset inventory** and **vulnerability assessment**.

## defense: making the network less transparent
1. **reduce the attack surface:** disable unused services (SMB, RDP on a web host), bind databases to \`127.0.0.1\`, uninstall XAMPP extras (phpMyAdmin, FileZilla, Mercury).
2. **firewall + segmentation:** host firewall default-deny inbound; VLANs/zones for staff, servers, IoT/printers and guests; allow only required flows (e.g. web -> db on 3306 only from the web server).
3. **IDS/IPS:** **snort** and **suricata** detect scans and exploits with signatures; **zeek** logs network behaviour. alerts turn a quiet scan into a noisy one. (coming in a later module.)
4. **patch & update:** OS, apps, *and* firmware (router, printer, NAS). subscribe to vendor advisories. replace end-of-life software.
5. **hide admin panels behind a VPN:** router/NAS admin, RDP and SSH reachable only after VPN login (wireguard/openvpn), ideally with MFA. (next module: vpn.)

bonus: run nmap against **yourself** regularly (\`ndiff\` the results) so you notice the next DESKTOP-X7Q before your boss does.

## nmap cheat sheet (the whole module)
\`\`\`
sudo nmap -sn 192.168.1.0/24          # who is alive
sudo nmap 192.168.1.30                # top 1000 ports (SYN scan as root)
sudo nmap -sS 192.168.1.30            # explicit SYN (stealth) scan
nmap -sT 192.168.1.30                 # full connect scan
nmap 192.168.1.1,20,40,50             # several hosts
sudo nmap -p- 192.168.1.30            # all 65535 ports
sudo nmap -sV 192.168.1.30            # service versions
sudo nmap -O 192.168.1.30             # operating system
sudo nmap -A -oN report.txt 192.168.1.30   # everything + save
\`\`\`
`;

export const chapterFive: Chapter = { title: "chapter 05", subtitle: "the full picture", scenes, quiz, notes };
