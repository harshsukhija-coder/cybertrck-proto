import { TryHarderIcon } from "../../icons/DesktopIcons";
import type { Project, ProjectPage } from "../project";

export const FIREWALL_TRY_HARDER_PY = `from scapy.all import *
import subprocess
from collections import defaultdict
from datetime import datetime, timedelta
import threading
import time

scan_tracker = defaultdict(lambda: {"count": 0, "timestamp": None})
BLOCK_DURATION = timedelta(minutes=10)

def is_ip_blocked(ip):
    result = subprocess.run(["sudo", "iptables", "-L", "-n"], stdout=subprocess.PIPE, text=True)
    return ip in result.stdout

def block_ip(ip):
    if is_ip_blocked(ip):
        print(f"IP {ip} is already blocked. Skipping...")
        return
    print(f"Blocking IP: {ip}")
    try:
        subprocess.run(["sudo", "iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error blocking IP {ip}: {e}")

def unblock_ip(ip):
    print(f"Unblocking IP: {ip}")
    try:
        subprocess.run(["sudo", "iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error unblocking IP {ip}: {e}")

def handle_packet(packet):
    if TCP in packet and packet[TCP].flags == "S":
        src_ip = packet[IP].src
        port = packet[TCP].dport
        src_port = packet[TCP].sport
        print(f"Scan detected on port {port} from {src_ip}")

        current_time = datetime.now()
        if scan_tracker[src_ip]["timestamp"] and current_time - scan_tracker[src_ip]["timestamp"] > BLOCK_DURATION:
            scan_tracker[src_ip] = {"count": 0, "timestamp": None}

        scan_tracker[src_ip]["count"] += 1
        scan_tracker[src_ip]["timestamp"] = current_time

        if scan_tracker[src_ip]["count"] > 5:
            print(f"IP {src_ip} exceeded scan limit, blocking for 10 minutes...")
            block_ip(src_ip)
            unblock_time = datetime.now() + BLOCK_DURATION
            print(f"IP {src_ip} will be unblocked at {unblock_time.strftime('%Y-%m-%d %H:%M:%S')}")
            sniff_thread.unblock_tasks.append({"ip": src_ip, "unblock_time": unblock_time})
            return

        syn_ack = (
            IP(dst=src_ip, src=packet[IP].dst) /
            TCP(sport=port, dport=src_port, flags="SA", seq=100, ack=packet[TCP].seq + 1)
        )
        send(syn_ack, verbose=0)
        print(f"Sent SYN-ACK to {src_ip} on port {port}")

        data_packet = (
            IP(dst=src_ip, src=packet[IP].dst) /
            TCP(sport=port, dport=src_port, flags="PA", seq=101, ack=packet[TCP].seq + 1) /
            Raw(load="try harder")
        )
        send(data_packet, verbose=0)
        print(f"Sent data packet with message 'try harder' to {src_ip} on port {port}")

def unblock_expired_ips():
    now = datetime.now()
    for task in list(sniff_thread.unblock_tasks):
        if now >= task["unblock_time"]:
            unblock_ip(task["ip"])
            sniff_thread.unblock_tasks.remove(task)

class SniffThread:
    def __init__(self):
        self.unblock_tasks = []

    def start_sniffing(self):
        sniff(filter="tcp", prn=handle_packet)

sniff_thread = SniffThread()

if __name__ == "__main__":
    sniff_thread = SniffThread()
    sniff_thread_thread = threading.Thread(target=sniff_thread.start_sniffing, daemon=True)
    sniff_thread_thread.start()
    try:
        while True:
            unblock_expired_ips()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\\nStopping...")
`;

export const COMMANDS_CHEATSHEET = `# try harder firewall · command list
> lab only · only test machines you own

## who’s who
- **Target** — your cloud server (example IP: 167.99.10.42)
- **Attacker** — your second machine used for practice scans (example: 167.99.10.117)

## on Target · see your address and open doors
\`\`\`bash
hostname
ip -br a
ss -tuln | head
\`\`\`

## on Target · watch knocks arrive
\`\`\`bash
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0' -n
\`\`\`

## on Target · install the script’s library
\`\`\`bash
apt-get update && apt-get install -y python3-venv python3-pip
python3 -m venv .venv
source .venv/bin/activate
pip install scapy
\`\`\`

## on Target · start the defense (needs admin)
\`\`\`bash
sudo .venv/bin/python firewall_try_harder.py
\`\`\`

## on Attacker · scan Target’s common doors
\`\`\`bash
nmap -p21,22,25,80,443 167.99.10.42
\`\`\`

## on Attacker · read the “try harder” text on the wire
\`\`\`bash
tcpdump -i eth0 host 167.99.10.42 -A -c 40
\`\`\`

## on Target · see who is blocked
\`\`\`bash
iptables -L INPUT -n -v | head
\`\`\`

## on Attacker · scan again after a block
\`\`\`bash
nmap -Pn -p22,80 167.99.10.42
\`\`\`

## reset the lab block
\`\`\`bash
iptables -D INPUT -s 167.99.10.117 -j DROP
\`\`\`

## plain English
1. strangers knock on numbered doors (ports)
2. for the first few knocks: pretend doors are open + send “try harder”
3. after too many knocks from one IP: block that IP for a while
`;

const pages: ProjectPage[] = [
  {
    kind: "cover",
    kicker: "live lab · happening on a real public IP",
    title: "try harder firewall",
    tagline:
      "a brand-new cloud server goes online. within minutes, strangers knock on its ports. we watch the traffic, run the same commands you’d run, then build one small defense — and leave with a complete playbook.",
  },

  // ── CAST ──────────────────────────────────────────────
  {
    kind: "comic",
    act: "cast",
    headline: "who’s who",
    strips: [
      {
        type: "bubble",
        who: "narrator",
        text: "i’m the {yellow:narrator}. i translate terminals and packets into plain language after you see them.",
      },
      {
        type: "bubble",
        who: "target",
        text: "i’m {green:Target} — your rented cloud server (DigitalOcean / AWS / any VPS). i run a website on port {green:80} and SSH login on port {green:22}.",
      },
      {
        type: "bubble",
        who: "attacker",
        text: "i’m {red:Attacker} — your second machine. i scan Target on purpose so we can learn. lab only.",
      },
      {
        type: "bubble",
        who: "bot",
        text: "we’re {orange:internet bots}. we don’t know you. new public IP? we knock common ports looking for easy wins.",
      },
      {
        type: "boom",
        title: "lab rule",
        text: "Target + Attacker are {yellow:machines you own}. scanning strangers without permission is illegal.",
      },
    ],
  },

  // ── LIVE NOW ──────────────────────────────────────────
  {
    kind: "comic",
    act: "live now",
    headline: "this is happening right now",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "my public IP just went live: {cyan:167.99.10.42}. i expected quiet.",
      },
      {
        type: "bubble",
        who: "bot",
        text: "found you. knocking {orange:22}, {orange:80}, {orange:443}, {orange:25}…",
      },
      {
        type: "wire",
        from: "bot",
        to: "target",
        packets: [
          { label: "TCP SYN :22", kind: "knock" },
          { label: "TCP SYN :80", kind: "knock" },
          { label: "TCP SYN :25", kind: "knock" },
        ],
        note: "each label is a real packet type: {yellow:TCP SYN} = “is anyone listening on this port?” bots spray these at new IPs every day.",
      },
      {
        type: "narrator",
        text: "this isn’t fiction. rent a droplet and check logs — you’ll see unknown IPs probing within minutes. they’re building a map of “which doors answered.”",
      },
    ],
  },

  // ── SAMPLE: Target identity ───────────────────────────
  {
    kind: "comic",
    act: "sample · Target",
    headline: "Target checks itself (sample commands)",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "first i confirm who i am on the network — address + which ports are listening.",
      },
      {
        type: "run",
        term: {
          title: "Target · live shell",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "hostname",
              output: "shop-server",
              tone: "ok",
            },
            {
              command: "ip -br a",
              output: "lo               UNKNOWN        127.0.0.1/8\neth0             UP             {cyan:167.99.10.42/20}",
              tone: "info",
            },
            {
              command: "ss -tuln",
              output:
                "Netid  State   Local Address:Port\ntcp    LISTEN  0.0.0.0:{yellow:22}\ntcp    LISTEN  0.0.0.0:{yellow:80}",
              tone: "warn",
            },
          ],
        },
        decode:
          "{cyan:167.99.10.42} is the public address anyone can try to reach. {yellow:LISTEN :22} means SSH is accepting connections. {yellow:LISTEN :80} means a web server is accepting connections. no LISTEN on :25 → Target is {pink:not} running email — but bots will still knock there.",
      },
    ],
  },

  // ── SAMPLE: watch knocks ──────────────────────────────
  {
    kind: "comic",
    act: "sample · knocks",
    headline: "watch knocks arrive (tcpdump sample)",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "i’ll sniff for TCP SYN packets — the “knock” flag — without answering yet.",
      },
      {
        type: "run",
        term: {
          title: "Target · tcpdump",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "tcpdump -i eth0 -n 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0'",
              output:
                "15:02:01.102 IP {orange:185.220.101.44}.49152 > 167.99.10.42.{yellow:22}: Flags [{red:S}]\n15:02:01.340 IP {orange:45.33.32.156}.53012 > 167.99.10.42.{yellow:80}: Flags [{red:S}]\n15:02:02.011 IP {orange:89.248.165.77}.44123 > 167.99.10.42.{yellow:25}: Flags [{red:S}]",
              tone: "warn",
              pause: 280,
            },
          ],
        },
        decode:
          "filter meaning: show TCP packets where {red:SYN} is set and {yellow:ACK} is not — pure connection attempts (knocks), not replies. each line = one stranger asking “is port N open?” source IPs ({orange:185…}, {orange:45…}, {orange:89…}) are not Attacker — Attacker hasn’t scanned yet.",
      },
      {
        type: "narrator",
        text: "technical note: a full TCP handshake is SYN → SYN-ACK → ACK. scanners often only need your {green:SYN-ACK} (“i’m here”) to mark the port {green:open}. silence or RST usually means closed/filtered.",
      },
    ],
  },

  // ── PACKET TECH ───────────────────────────────────────
  {
    kind: "comic",
    act: "packets",
    headline: "packets explained clearly",
    strips: [
      {
        type: "narrator",
        text: "imagine Target as an apartment building. a {yellow:port} is a numbered door. a {yellow:packet} is a tiny envelope with from/to addresses + which door + flags (like SYN).",
      },
      {
        type: "wire",
        from: "attacker",
        to: "target",
        packets: [
          { label: "① SYN knock", kind: "knock" },
          { label: "② SYN-ACK home", kind: "answer" },
          { label: "③ ACK ok", kind: "data" },
        ],
        note: "① client: “can we talk on this port?” ② server: “yes, i’m listening.” ③ client: “cool.” scanners care most about ②.",
      },
      {
        type: "decode",
        text: "nmap status cheat-sheet: {green:open} = got SYN-ACK (something answered). {orange:closed} = got RST (door says no). {orange:filtered} = no useful reply (firewall dropped it, or path blocked). our later defense turns noisy scanners into {orange:filtered}.",
      },
    ],
  },
  {
    kind: "choice",
    act: "check",
    prompt: "A scanner sends SYN. The server replies SYN-ACK. What does the scanner usually record?",
    options: ["port closed", "port open", "DNS failed", "server wants coffee"],
    answer: 1,
    roastWrong: "SYN-ACK is an answer — that maps to open.",
    explain:
      "SYN-ACK is the technical “i’m here.” most port scanners treat that as {green:open}. that’s why faking SYN-ACKs can poison a scan map.",
  },

  // ── SAMPLE: Attacker scan ─────────────────────────────
  {
    kind: "comic",
    act: "sample · Attacker",
    headline: "Attacker scans (sample nmap output)",
    strips: [
      {
        type: "bubble",
        who: "attacker",
        text: "i’m on {red:167.99.10.117}. i’ll scan common ports on Target the same way a curious stranger might — on our lab only.",
      },
      {
        type: "run",
        term: {
          title: "Attacker · nmap",
          host: "root@lab-scanner:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -p21,22,25,80,443 -sS 167.99.10.42",
              output:
                "Starting Nmap 7.94\nNmap scan report for 167.99.10.42\nPORT    STATE    SERVICE\n21/tcp  {orange:closed}   ftp\n22/tcp  {green:open}     ssh\n25/tcp  {orange:closed}   smtp\n80/tcp  {green:open}     http\n443/tcp {orange:closed}   https\n\nNmap done: 1 IP address (1 host up)",
              tone: "warn",
              pause: 300,
            },
          ],
        },
        decode:
          "{yellow:-p21,22,25,80,443} = only check these doors. {yellow:-sS} = SYN scan (send SYN, watch for SYN-ACK/RST; often needs root). sample result: SSH + HTTP really answer; FTP/SMTP/HTTPS do not — yet. after we run the defense script, this report will look very different.",
      },
    ],
  },

  // ── THE PLAN (before script) ──────────────────────────
  {
    kind: "comic",
    act: "plan",
    headline: "defense idea — before we open the script",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "plan: listen for SYN knocks → for the first few from an IP, send fake SYN-ACK + a data packet saying {pink:try harder} → after more than 5 knocks from the same IP, {red:iptables DROP} that IP for ~10 minutes.",
      },
      {
        type: "narrator",
        text: "why it helps in the real world: scanners trust answers. fake answers waste their time and muddy “what’s really open.” the block is the serious part — stop the noisy IP from reaching real services.",
      },
      {
        type: "tool",
        name: "nmap",
        who: "attacker",
        does: "sends SYNs, classifies ports open/closed/filtered, fingerprints services.",
        why: "Attacker (and bots) use it — or tools like it — to build a door map.",
      },
      {
        type: "tool",
        name: "tcpdump",
        who: "attacker",
        does: "captures packets; {yellow:-A} prints payload as ASCII so you can read strings like “try harder”.",
        why: "proof on the wire, not just a log line.",
      },
      {
        type: "tool",
        name: "scapy",
        who: "target",
        does: "Python library to sniff and craft packets (SYN-ACK, payload, etc.).",
        why: "lets the script act like a fake receptionist on many ports.",
      },
      {
        type: "tool",
        name: "iptables",
        who: "target",
        does: "Linux netfilter firewall. {red:-j DROP} discards matching packets.",
        why: "the bouncer after the jokes.",
      },
    ],
  },

  // ── SETUP SAMPLES ─────────────────────────────────────
  {
    kind: "comic",
    act: "setup",
    headline: "install path (sample errors + fixes)",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "real first runs fail. here’s what you’ll actually see.",
      },
      {
        type: "run",
        term: {
          title: "Target · first run",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "python3 firewall_try_harder.py",
              output: "Traceback (most recent call last):\n  ...\nModuleNotFoundError: No module named '{yellow:scapy}'",
              tone: "err",
            },
          ],
        },
        decode: "the script imports scapy. no library → crash before it can sniff anything.",
      },
      {
        type: "run",
        setup: "fix: private toolbox (venv) + install scapy",
        term: {
          title: "Target · venv",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "apt-get update && apt-get install -y python3-venv python3-pip",
              output: "python3-venv is already the newest version.\npython3-pip is already the newest version.",
              tone: "dim",
            },
            {
              command: "python3 -m venv .venv && source .venv/bin/activate",
              output: "({cyan:.venv}) ready",
              tone: "ok",
            },
            {
              command: "pip install scapy",
              output: "Collecting scapy\nInstalling collected packages: scapy\nSuccessfully installed {green:scapy-2.5.0}",
              tone: "ok",
              pause: 220,
            },
          ],
        },
        decode: "({cyan:.venv}) means packages install into ./.venv, not system Python. keeps the server clean.",
      },
      {
        type: "run",
        setup: "second real error: firewall changes need root",
        term: {
          title: "Target · permission",
          host: "(.venv) user@shop-server:~$",
          side: "target",
          lines: [
            {
              command: "python firewall_try_harder.py",
              output: "Scan detected…\nBlocking IP: 185.220.101.44\n{red:Permission denied} · iptables needs admin",
              tone: "err",
            },
          ],
        },
        decode: "sniffing/crafting can work in some setups without root; editing {yellow:iptables} almost never does. use sudo for the lab process.",
      },
      {
        type: "run",
        term: {
          title: "Target · live defense",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "sudo .venv/bin/python firewall_try_harder.py",
              output: "listening for TCP SYNs on eth0…\nready · block after >5 knocks / IP · duration 10 min",
              tone: "ok",
              pause: 240,
            },
          ],
        },
        decode: "defense is live. next we provoke it with Attacker and show sample responses.",
      },
    ],
  },

  // ── LIVE DEMO WITH SAMPLES ────────────────────────────
  {
    kind: "comic",
    act: "live demo",
    headline: "live: fake answer + try harder",
    strips: [
      {
        type: "bubble",
        who: "bot",
        text: "knocking SMTP port {orange:25} even though Target never installed mail.",
      },
      {
        type: "duel",
        setup: "script is running on Target. bot probes :25.",
        target: {
          title: "Target · script log",
          host: "script#",
          side: "target",
          lines: [
            {
              output:
                "Scan detected on port {yellow:25} from 89.248.165.77\nSent SYN-ACK to 89.248.165.77 on port 25\nSent data packet with message '{pink:try harder}'",
              tone: "ok",
              pause: 220,
            },
          ],
        },
        attacker: {
          title: "bot · probe",
          host: "bot#",
          side: "bot",
          lines: [
            {
              command: "nmap -p25 -sS 167.99.10.42",
              output: "PORT   STATE SERVICE\n25/tcp {green:open}  smtp",
              tone: "warn",
            },
          ],
        },
        wire: {
          from: "bot",
          to: "target",
          packets: [
            { label: "SYN :25", kind: "knock" },
            { label: "SYN-ACK", kind: "answer" },
            { label: "try harder", kind: "roast" },
          ],
        },
        decode:
          "Target has {pink:no} SMTP service. the script forged a SYN-ACK anyway, so nmap records {green:open}. then it sent a TCP packet whose payload is the ASCII string try harder — you’ll see that next with tcpdump.",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "sample: Attacker’s full scan after the trap",
    strips: [
      {
        type: "bubble",
        who: "attacker",
        text: "same nmap as before — but Target’s script is answering now.",
      },
      {
        type: "run",
        term: {
          title: "Attacker · nmap again",
          host: "root@lab-scanner:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -p21,22,25,80,443 -sS 167.99.10.42",
              output:
                "PORT    STATE SERVICE\n21/tcp  {green:open}  ftp\n22/tcp  {green:open}  ssh\n25/tcp  {green:open}  smtp\n80/tcp  {green:open}  http\n443/tcp {green:open}  https\n\n{orange:WARNING}: every probed port answered SYN-ACK",
              tone: "warn",
              pause: 300,
            },
          ],
        },
        decode:
          "compare to the earlier sample: FTP/SMTP/HTTPS flipped from closed → {green:open}. only some of those are real services. the scan map is now {yellow:untrustworthy} — which is the point of the trap.",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "sample: prove the message on the wire",
    strips: [
      {
        type: "bubble",
        who: "attacker",
        text: "tcpdump -A prints packet payloads as text. if Target really sent “try harder”, we’ll see it.",
      },
      {
        type: "run",
        term: {
          title: "Attacker · tcpdump -A",
          host: "root@lab-scanner:~#",
          side: "attacker",
          lines: [
            {
              command: "tcpdump -i eth0 -n -A host 167.99.10.42 and tcp -c 30",
              output:
                "15:10:44.221 IP 167.99.10.42.25 > 167.99.10.117.44123: Flags [P.]\n.........E..try harder\n15:10:44.221 IP 167.99.10.42.22 > 167.99.10.117.53001: Flags [P.]\n.........E..{pink:try harder}",
              tone: "warn",
              pause: 260,
            },
          ],
        },
        decode:
          "{yellow:-A} = ASCII dump of payload. the string is inside a TCP segment from Target → Attacker. it’s not a fake log — it’s bytes on the network. Flags [P.] means PSH+ACK (data push).",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "sample: knock #6 → iptables DROP",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "Attacker kept knocking. count crossed 5. adding a DROP rule.",
      },
      {
        type: "duel",
        target: {
          title: "Target · script + iptables",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              output:
                "IP {red:167.99.10.117} exceeded scan limit\nBlocking IP: 167.99.10.117\nwill unblock at 2026-11-18 15:20:44",
              tone: "ok",
              pause: 200,
            },
            {
              command: "iptables -L INPUT -n -v | head -5",
              output:
                "Chain INPUT (policy ACCEPT)\n pkts bytes target  prot opt in out source\n   12   720 {red:DROP}    all  --  *  *   {red:167.99.10.117}",
              tone: "ok",
            },
          ],
        },
        attacker: {
          title: "Attacker · after block",
          host: "root@lab-scanner:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -Pn -p22,80 167.99.10.42",
              output: "PORT   STATE    SERVICE\n22/tcp {orange:filtered} ssh\n80/tcp {orange:filtered} http",
              tone: "err",
              pause: 280,
            },
          ],
        },
        wire: {
          from: "attacker",
          to: "target",
          packets: [
            { label: "SYN…", kind: "knock" },
            { label: "DROP", kind: "block" },
          ],
        },
        decode:
          "{red:DROP} = kernel throws the packet away; no RST, no SYN-ACK. Attacker’s nmap therefore says {orange:filtered}. {yellow:-Pn} skips host-discovery pings (useful when ICMP is ignored).",
      },

    ],
  },
  {
    kind: "comic",
    act: "cleanup",
    headline: "sample: reset the lab block",
    strips: [
      {
        type: "run",
        term: {
          title: "Target · unblock",
          host: "root@shop-server:~#",
          side: "target",
          lines: [
            {
              command: "iptables -D INPUT -s 167.99.10.117 -j DROP",
              output: "",
              tone: "ok",
            },
            {
              command: "iptables -L INPUT -n | grep 167.99.10.117 || echo clean",
              output: "{green:clean}",
              tone: "ok",
            },
          ],
        },
        decode: "{yellow:-D} deletes that one rule. prefer surgical deletes over {pink:iptables -F} on anything that isn’t a throwaway lab box.",
      },
    ],
  },

  // ── SCRIPT WALKTHROUGH (after live) ───────────────────
  {
    kind: "comic",
    act: "script",
    headline: "now the script — important parts",
    strips: [
      {
        type: "narrator",
        text: "you’ve seen the behavior live. here’s what {yellow:firewall_try_harder.py} is doing under the hood — the pieces that matter.",
      },
      {
        type: "codebit",
        title: "1 · track knocks per IP",
        code: `scan_tracker = defaultdict(lambda: {"count": 0, "timestamp": None})
BLOCK_DURATION = timedelta(minutes=10)

# each SYN from an IP:
scan_tracker[src_ip]["count"] += 1
scan_tracker[src_ip]["timestamp"] = datetime.now()`,
        decode: "a dictionary keyed by source IP. count how many SYN knocks you’ve seen. after 10 minutes of quiet, the sample script resets that IP’s count.",
      },
    ],
  },
  {
    kind: "comic",
    act: "script",
    headline: "script · fake SYN-ACK + payload",
    strips: [
      {
        type: "codebit",
        title: "2 · lie “i’m home” + send try harder",
        code: `syn_ack = (
  IP(dst=src_ip, src=packet[IP].dst) /
  TCP(sport=port, dport=src_port, flags="SA",
      seq=100, ack=packet[TCP].seq + 1)
)
send(syn_ack, verbose=0)

data_packet = (
  IP(dst=src_ip, src=packet[IP].dst) /
  TCP(sport=port, dport=src_port, flags="PA",
      seq=101, ack=packet[TCP].seq + 1) /
  Raw(load="try harder")
)
send(data_packet, verbose=0)`,
        decode:
          "scapy builds packets in layers: {yellow:IP} / {yellow:TCP} / optional {yellow:Raw}. flags {green:SA} = SYN+ACK (fake open). flags {green:PA} = PSH+ACK with payload bytes {pink:try harder}. {yellow:sport=port} makes it look like the service port is talking.",
      },
    ],
  },
  {
    kind: "comic",
    act: "script",
    headline: "script · block with iptables",
    strips: [
      {
        type: "codebit",
        title: "3 · DROP after >5 knocks",
        code: `if scan_tracker[src_ip]["count"] > 5:
  subprocess.run(
    ["sudo", "iptables", "-A", "INPUT",
     "-s", ip, "-j", "DROP"],
    check=True
  )
  # schedule unblock ~10 minutes later
  return  # stop faking answers for this knock`,
        decode:
          "{yellow:-A INPUT} appends a rule on inbound traffic. {yellow:-s ip} matches that source. {red:-j DROP} discards. the script also remembers an unblock time and later runs {yellow:iptables -D} to remove the rule.",
      },
      {
        type: "codebit",
        title: "4 · listen forever",
        code: `sniff(filter="tcp", prn=handle_packet)
# prn=callback runs handle_packet for each TCP packet`,
        decode: "scapy’s sniff loop is the heart of the process. filter {yellow:tcp} keeps noise down; {yellow:handle_packet} only acts when TCP flags == SYN (a fresh knock).",
      },
      {
        type: "fix",
        title: "limits (read this)",
        text: "this is a {yellow:teaching} firewall: it can confuse scanners and rate-limit SYNs, but it is not a full IDS/IPS. run only on lab boxes. production needs layered controls (cloud SG, fail2ban, real firewall policy, patching).",
      },
    ],
  },

  // ── ONE-STOP CONCLUSION ───────────────────────────────
  {
    kind: "choice",
    act: "final",
    prompt: "What is the one-stop pattern this project teaches?",
    options: [
      "only send jokes forever",
      "watch real knocks → understand packets → trap with fake answers → block noisy IPs → know the script",
      "turn the server off and hope",
      "nmap blocks people automatically",
    ],
    answer: 1,
    roastWrong: "the full loop is observe → understand → confuse → block → own the code.",
    explain:
      "one-stop solution: see live traffic, run the sample commands, understand SYN/SYN-ACK/DROP, then keep the script + cheatsheet so you can reproduce the lab.",
  },
  {
    kind: "loot",
    title: "one-stop solution",
    outro:
      "you now have the full loop in one place: cast roles, live “it’s happening now,” sample commands with real-looking responses, packet meaning, the defense behavior, and the script’s important parts.",
    bullets: [
      "{green:observe} — tcpdump SYN knocks on a new public IP (bots arrive fast)",
      "{yellow:understand} — open = SYN-ACK · filtered ≈ DROP · ports are doors",
      "{pink:trap} — scapy fakes SYN-ACK + “try harder” to poison scan maps",
      "{red:block} — after >5 knocks/IP, iptables DROP for ~10 minutes",
      "{cyan:reproduce} — download commands.md + firewall_try_harder.py · lab machines only",
    ],
    commandsFile: { name: "offtrck-try-harder-commands.md", text: COMMANDS_CHEATSHEET },
    scriptFile: { name: "firewall_try_harder.py", text: FIREWALL_TRY_HARDER_PY },
  },
];

export const tryHarderProject: Project = {
  id: "try-harder",
  title: "try harder firewall",
  badge: "one-stop lab",
  blurb: "live knocks → sample terminals → packets → script → playbook",
  Icon: TryHarderIcon,
  pages,
};
