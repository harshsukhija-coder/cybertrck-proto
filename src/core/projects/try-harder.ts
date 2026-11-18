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


export const COMMANDS_CHEATSHEET = `# try harder firewall · command + reading list
> lab only · only test machines you own

## who’s who
- **Target** — your cloud VPS (example: 167.99.10.42)
- **Attacker** — your second machine for practice scans (example: 167.99.10.117)

## rent a VPS (starter picks)
- DigitalOcean Droplets — https://docs.digitalocean.com/products/droplets/
- Linode / Akamai — https://www.linode.com/docs/products/compute/compute-instances/
- Hetzner Cloud — https://docs.hetzner.com/cloud/
- AWS EC2 (steeper) — https://docs.aws.amazon.com/ec2/

## further reading
- TCP 3-way handshake — https://developer.mozilla.org/en-US/docs/Glossary/TCP
- How Linux netfilter/iptables works — https://www.netfilter.org/documentation/
- nmap port scanning basics — https://nmap.org/book/man-port-scanning-basics.html
- DigitalOcean: secure your droplet — https://docs.digitalocean.com/products/droplets/how-to/add-firewalls/

## on Target · identity
\`\`\`bash
hostname
ip -br a
ss -tuln | head
\`\`\`

## on Target · watch SYN knocks
\`\`\`bash
tcpdump -i eth0 -n 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0'
\`\`\`

## on Target · install + run defense
\`\`\`bash
apt-get update && apt-get install -y python3-venv python3-pip
python3 -m venv .venv && source .venv/bin/activate
pip install scapy
sudo .venv/bin/python firewall_try_harder.py
\`\`\`

## on Attacker · scan + read payload
\`\`\`bash
nmap -p21,22,25,80,443 -sS 167.99.10.42
tcpdump -i eth0 -n -A host 167.99.10.42 and tcp -c 30
\`\`\`

## block / unblock
\`\`\`bash
iptables -L INPUT -n -v | head
iptables -D INPUT -s 167.99.10.117 -j DROP
\`\`\`
`;

const pages: ProjectPage[] = [
  {
    kind: "cover",
    kicker: "from zero · VPS → packets → defense",
    title: "try harder firewall",
    tagline:
      "we start at the basics: what a VPS is, how a request reaches Linux, how SYN / SYN-ACK / ACK really work — then we build a small lab defense you can reproduce.",
  },

  // ── mission ───────────────────────────────────────────
  {
    kind: "comic",
    act: "mission",
    headline: "characters · goals · how we win",
    strips: [
      {
        type: "narrator",
        text: "before any terminal: know the cast, what each wants, and the plan. that is the map for everything that follows.",
      },
      {
        type: "goals",
        rows: [
          {
            who: "narrator",
            goal: "make the tech readable — VPS, OS, handshake, firewall — so nothing feels like magic.",
            plan: "explain → quiz → interactive packet lab → live samples → script → one-stop playbook.",
          },
          {
            who: "target",
            goal: "stay online for real users on a rented cloud server, without becoming an easy scan target.",
            plan: "run website + SSH; later confuse scanners; block IPs that knock too much.",
          },
          {
            who: "attacker",
            goal: "practice scanning {yellow:our own} Target so we can see what bots see.",
            plan: "use nmap + tcpdump on a second machine we own. never scan strangers.",
          },
          {
            who: "bot",
            goal: "find weak / interesting servers on the public internet as fast as possible.",
            plan: "auto-knock common ports on every new IP. not our friend.",
          },
        ],
      },
      {
        type: "fix",
        title: "success looks like",
        text: "you can explain a VPS, the OS path of a packet, the three handshake steps without mixing names, play the packet lab, run sample commands, and download a working lab script.",
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "In this project, what is Attacker’s goal?",
    options: [
      "hack random companies on the internet",
      "practice scanning a machine we own, to learn",
      "delete Target’s website",
      "sell Target’s IP address",
    ],
    answer: 1,
    roastWrong: "Attacker is our lab scanner — not a criminal plot.",
    explain: "Attacker = second machine {yellow:you own}. the point is learning what a scan looks like from both sides.",
  },

  // ── VPS basics ────────────────────────────────────────
  {
    kind: "comic",
    act: "basics · VPS",
    headline: "what is a VPS?",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "i’m a {green:VPS} — Virtual Private Server. a slice of a real computer in a data center that acts like my own machine: CPU, RAM, disk, and a {cyan:public IP}.",
      },
      {
        type: "narrator",
        text: "compare: your laptop is private on home Wi‑Fi. a VPS is a computer that lives on the public internet 24/7. websites, APIs, game servers, and lab boxes are often VPSes.",
      },
      {
        type: "decode",
        text: "words you’ll hear: {yellow:droplet} (DigitalOcean), {yellow:instance} (AWS/Linode), {yellow:cloud VM}. same idea — rent a computer with a public address.",
      },
    ],
  },
  {
    kind: "comic",
    act: "basics · VPS",
    headline: "how people rent one (real steps)",
    strips: [
      {
        type: "narrator",
        text: "typical flow (DigitalOcean / Linode / Hetzner are beginner-friendly): 1) create account 2) pick region near you 3) pick a small Linux image (Ubuntu LTS) 4) choose size (1 GB RAM is enough for this lab) 5) add your SSH key 6) create → copy the public IP.",
      },
      {
        type: "bubble",
        who: "attacker",
        text: "for this project you ideally want {red:two} small VPS boxes — or one VPS (Target) plus your laptop (Attacker) if your network allows outbound scans to your own IP.",
      },
      {
        type: "boom",
        title: "money + safety",
        text: "expect a few dollars/month for a tiny droplet. turn it off when done. {yellow:never} put real production secrets on a throwaway lab VPS.",
      },
      {
        type: "links",
        title: "resources · rent + harden",
        items: [
          {
            label: "DigitalOcean Droplets docs",
            href: "https://docs.digitalocean.com/products/droplets/",
            note: " clearest beginner VPS docs",
          },
          {
            label: "Hetzner Cloud docs",
            href: "https://docs.hetzner.com/cloud/",
            note: " popular EU cloud VMs",
          },
          {
            label: "Secure a Droplet (DO)",
            href: "https://docs.digitalocean.com/products/droplets/how-to/add-firewalls/",
            note: " cloud firewall basics",
          },
          {
            label: "SSH keys explained (DO)",
            href: "https://docs.digitalocean.com/products/droplets/how-to/add-ssh-keys/",
            note: " login without passwords",
          },
        ],
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "What does a brand-new VPS usually get that your home laptop often does not?",
    options: [
      "a free pizza",
      "a public IP address reachable from the internet",
      "immunity to scanning",
      "no operating system",
    ],
    answer: 1,
    roastWrong: "the whole point of a VPS for websites is being reachable.",
    explain: "a public IP is why bots find you minutes after create. that reachability is useful — and risky.",
  },

  // ── OS + packet path ──────────────────────────────────
  {
    kind: "comic",
    act: "basics · OS",
    headline: "a request reaches the VPS — what does the OS do?",
    strips: [
      {
        type: "narrator",
        text: "“OS” here means Linux on Target. the operating system owns the network stack: it receives bits from the network card, decides if a packet is allowed, and whether any app should see it.",
      },
      {
        type: "path",
        title: "one inbound packet’s journey",
        steps: [
          {
            name: "NIC (network card)",
            detail: "hardware receives the Ethernet frame from the internet / cloud network.",
          },
          {
            name: "driver → kernel",
            detail: "Linux pulls the packet into the kernel networking stack.",
          },
          {
            name: "netfilter / firewall hooks",
            detail: "rules (iptables/nftables, or cloud firewall) can {red:ACCEPT}, {red:DROP}, or {orange:REJECT} before an app ever wakes up.",
          },
          {
            name: "socket lookup",
            detail: "kernel checks: is any process {yellow:LISTEN}ing on this IP:port? if yes, queue the packet for that app (nginx, sshd, our script…).",
          },
          {
            name: "application",
            detail: "only now can the program read bytes (HTTP request, SSH, etc.). if nothing listens and firewall didn’t drop — kernel may reply RST for TCP.",
          },
        ],
      },
      {
        type: "decode",
        text: "key idea: {yellow:apps don’t catch packets first}. the OS does. firewalls sit in that OS path. that’s why {red:DROP} can make a port “invisible.”",
      },
    ],
  },
  {
    kind: "comic",
    act: "basics · OS",
    headline: "when and how packets are dropped",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "DROP means: “throw this packet in the trash.” no reply. the sender often waits, then gives up. nmap labels that {orange:filtered}.",
      },
      {
        type: "narrator",
        text: "common places a drop happens: 1) {yellow:cloud security group / cloud firewall} in front of the VPS 2) {yellow:iptables/nftables} on Linux 3) sometimes a provider DDoS layer. REJECT is different — it sends an explicit “no” (like ICMP unreachable or TCP RST).",
      },
      {
        type: "run",
        setup: "sample: add / list a DROP rule (lab only)",
        term: {
          title: "Target · iptables",
          host: "root@vps:~#",
          side: "target",
          lines: [
            {
              command: "iptables -A INPUT -s 167.99.10.117 -j DROP",
              output: "",
              tone: "ok",
            },
            {
              command: "iptables -L INPUT -n -v | head -5",
              output: "Chain INPUT (policy ACCEPT)\n pkts bytes target prot opt in out source\n    0     0 {red:DROP}   all  --  *   *   167.99.10.117",
              tone: "warn",
            },
          ],
        },
        decode:
          "{yellow:-A INPUT} = append rule on inbound traffic. {yellow:-s} = source IP. {red:-j DROP} = action. packets matching this never become a friendly SYN-ACK.",
      },
      {
        type: "links",
        title: "further reading · firewalls",
        items: [
          {
            label: "netfilter documentation",
            href: "https://www.netfilter.org/documentation/",
            note: " where iptables lives in Linux",
          },
          {
            label: "iptables tutorial (frozentux)",
            href: "https://www.frozentux.net/iptables-tutorial/iptables-tutorial.html",
            note: " deep but classic",
          },
        ],
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "A TCP SYN hits the VPS and iptables DROP matches. What usually happens next?",
    options: [
      "nginx still sees the request",
      "the kernel sends SYN-ACK automatically",
      "the packet is discarded; sender gets no useful reply",
      "the packet turns into UDP",
    ],
    answer: 2,
    roastWrong: "DROP means trash — apps don’t get a turn.",
    explain: "firewall hooks run in the OS path. DROP ends the journey early. that’s why scanners report filtered/silence.",
  },

  // ── handshake (clear naming) ──────────────────────────
  {
    kind: "comic",
    act: "handshake",
    headline: "three-way handshake — names that stick",
    strips: [
      {
        type: "narrator",
        text: "people write it many ways and it gets confusing. memorize {yellow:three steps}, not the slash spelling:",
      },
      {
        type: "path",
        title: "TCP handshake = 3 packets",
        steps: [
          {
            name: "Step 1 — SYN (client → server)",
            detail: "client knocks: “Want to sync a new connection on this port?” SYN = synchronize.",
          },
          {
            name: "Step 2 — SYN-ACK (server → client)",
            detail: "server answers: “Yes, I’m here, let’s sync.” This is {green:one packet} with two flags set: SYN and ACK. also written SYN+ACK — {pink:not} “ACK-SYN” as a separate second step name.",
          },
          {
            name: "Step 3 — ACK (client → server)",
            detail: "client confirms: “Got your answer.” Now both sides agree. connection is established.",
          },
        ],
      },
      {
        type: "fix",
        title: "naming trap",
        text: "you may see “SYN, SYN-ACK, ACK” or “SYN, ACK-SYN, ACK.” same three packets. the middle one is always {yellow:server’s SYN combined with ACK} — one reply, two flags.",
      },
      {
        type: "links",
        title: "further reading · TCP",
        items: [
          {
            label: "MDN: TCP glossary",
            href: "https://developer.mozilla.org/en-US/docs/Glossary/TCP",
            note: " short + clear",
          },
          {
            label: "nmap port scanning basics",
            href: "https://nmap.org/book/man-port-scanning-basics.html",
            note: " how scanners interpret replies",
          },
        ],
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "What is the middle packet of a normal TCP handshake?",
    options: [
      "two separate packets: ACK then SYN",
      "one packet from the server with SYN and ACK flags together (SYN-ACK)",
      "only ACK from the client",
      "a DROP from iptables",
    ],
    answer: 1,
    roastWrong: "it’s one reply with two flags — SYN-ACK.",
    explain: "Step 2 is a single server packet: SYN+ACK. Step 3 is the client’s ACK.",
  },

  // ── every packet (page that was confusing) ────────────
  {
    kind: "comic",
    act: "every packet",
    headline: "every packet · shown and explained",
    strips: [
      {
        type: "narrator",
        text: "stop guessing. below is a lab that lists {yellow:every packet} in the exchange — direction, flags, plain English, a sample wire line, and what a scanner thinks. start with mode ①.",
      },
      {
        type: "playground",
        title: "packet-by-packet lab",
        hint: "All packets stay on screen. Tap a card to highlight it. Switch modes ①–④ to compare open / closed / DROP / fake.",
      },
      {
        type: "decode",
        text: "cheat sheet: {green:SYN+ACK} ⇒ open · {orange:RST} ⇒ closed · {red:no reply} ⇒ filtered · forged SYN+ACK ⇒ looks open but isn’t a real service.",
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "In the playground, which scenario makes nmap most likely to say “filtered”?",
    options: ["normal handshake", "closed port RST", "firewall DROP (silence)", "fake SYN-ACK"],
    answer: 2,
    roastWrong: "filtered is the “no useful reply” bucket — that’s DROP/silence.",
    explain: "DROP produces silence. scanners often map that to filtered.",
  },

  // ── cast reminder + live world ────────────────────────
  {
    kind: "comic",
    act: "live world",
    headline: "back to our story · bots find Target",
    strips: [
      {
        type: "bubble",
        who: "target",
        text: "my VPS just got public IP {cyan:167.99.10.42}. website on :{green:80}, SSH on :{green:22}.",
      },
      {
        type: "bubble",
        who: "bot",
        text: "new IP on the internet? knocking common ports now.",
      },
      {
        type: "wire",
        from: "bot",
        to: "target",
        packets: [
          { label: "SYN → :22", kind: "knock" },
          { label: "SYN → :80", kind: "knock" },
          { label: "SYN → :25", kind: "knock" },
        ],
        note: "these are Step‑1 SYN knocks. if Target’s OS/app answers with SYN-ACK, bots mark that port interesting.",
      },
      {
        type: "narrator",
        text: "this is why we rented a VPS in the first place for the lab — to watch real internet noise safely on {yellow:our} machine.",
      },
    ],
  },

  // ── sample terminals ──────────────────────────────────
  {
    kind: "comic",
    act: "samples",
    headline: "sample · Target looks at itself",
    strips: [
      {
        type: "run",
        term: {
          title: "Target",
          host: "root@vps:~#",
          side: "target",
          lines: [
            { command: "hostname", output: "shop-server", tone: "ok" },
            {
              command: "ip -br a",
              output: "lo    UNKNOWN  127.0.0.1/8\neth0  UP       {cyan:167.99.10.42/20}",
              tone: "info",
            },
            {
              command: "ss -tuln",
              output: "State   Local Address:Port\nLISTEN  0.0.0.0:{yellow:22}\nLISTEN  0.0.0.0:{yellow:80}",
              tone: "warn",
            },
          ],
        },
        decode: "{yellow:LISTEN} = an app asked the OS to accept connections on that port. no LISTEN on :25 → email isn’t running — bots still knock.",
      },
    ],
  },
  {
    kind: "comic",
    act: "samples",
    headline: "sample · watch knocks with tcpdump",
    strips: [
      {
        type: "run",
        term: {
          title: "Target · tcpdump",
          host: "root@vps:~#",
          side: "target",
          lines: [
            {
              command: "tcpdump -i eth0 -n 'tcp[tcpflags] & tcp-syn != 0 and tcp[tcpflags] & tcp-ack == 0'",
              output:
                "IP {orange:185.220.101.44}.49152 > 167.99.10.42.{yellow:22}: Flags [{red:S}]\nIP {orange:45.33.32.156}.53012 > 167.99.10.42.{yellow:80}: Flags [{red:S}]\nIP {orange:89.248.165.77}.44123 > 167.99.10.42.{yellow:25}: Flags [{red:S}]",
              tone: "warn",
              pause: 260,
            },
          ],
        },
        decode: "Flags [S] = SYN only = handshake Step 1. filter excludes packets that already have ACK — so we see knocks, not replies.",
      },
    ],
  },
  {
    kind: "comic",
    act: "samples",
    headline: "sample · Attacker nmap (before defense)",
    strips: [
      {
        type: "run",
        term: {
          title: "Attacker · nmap",
          host: "root@lab:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -p21,22,25,80,443 -sS 167.99.10.42",
              output:
                "PORT    STATE    SERVICE\n21/tcp  {orange:closed}   ftp\n22/tcp  {green:open}     ssh\n25/tcp  {orange:closed}   smtp\n80/tcp  {green:open}     http\n443/tcp {orange:closed}   https",
              tone: "warn",
              pause: 280,
            },
          ],
        },
        decode: "{yellow:-sS} = SYN scan (send Step 1, watch for Step 2). open ≈ got SYN-ACK. closed ≈ got RST. this is the honest map before we lie.",
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "nmap shows 22/tcp open. What packet did Target most likely send back?",
    options: ["only ACK", "SYN-ACK (Step 2)", "DROP", "UDP hello"],
    answer: 1,
    roastWrong: "open usually means the scanner saw a SYN-ACK.",
    explain: "Step 2 SYN-ACK is what makes a port look open to a SYN scan.",
  },

  // ── plan + demo ───────────────────────────────────────
  {
    kind: "comic",
    act: "plan",
    headline: "how we achieve Target’s goal",
    strips: [
      {
        type: "goals",
        rows: [
          {
            who: "target",
            goal: "confuse scanners + stop noisy IPs",
            plan: "for the first few SYNs from an IP: forge SYN-ACK + send “try harder”. after >5: iptables DROP that IP for ~10 minutes.",
          },
          {
            who: "attacker",
            goal: "prove the trap works",
            plan: "scan again, read “try harder” with tcpdump -A, then see filtered after the block.",
          },
        ],
      },
      {
        type: "tool",
        name: "scapy",
        who: "target",
        does: "sniff SYNs and craft fake SYN-ACK + payload packets from Python.",
        why: "lets Target role-play “open” on ports with no real service.",
      },
      {
        type: "tool",
        name: "iptables",
        who: "target",
        does: "DROP matching source IPs in the OS firewall path.",
        why: "serious stop after the joke.",
      },
    ],
  },
  {
    kind: "comic",
    act: "setup",
    headline: "sample · install path (errors included)",
    strips: [
      {
        type: "run",
        term: {
          title: "Target",
          host: "root@vps:~#",
          side: "target",
          lines: [
            {
              command: "python3 firewall_try_harder.py",
              output: "ModuleNotFoundError: No module named '{yellow:scapy}'",
              tone: "err",
            },
            {
              command: "python3 -m venv .venv && source .venv/bin/activate && pip install scapy",
              output: "({cyan:.venv}) ready\nSuccessfully installed {green:scapy}",
              tone: "ok",
              pause: 220,
            },
            {
              command: "sudo .venv/bin/python firewall_try_harder.py",
              output: "listening for TCP SYNs…\nblock after >5 knocks / IP",
              tone: "ok",
              pause: 220,
            },
          ],
        },
        decode: "venv isolates packages. sudo is needed because iptables DROP requires admin. now the defense process is in the path of knocks (via sniffing) and can also edit firewall rules.",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "live · fake open + try harder",
    strips: [
      {
        type: "duel",
        setup: "bot knocks SMTP :25 — Target has no mail service.",
        target: {
          title: "Target · script",
          host: "script#",
          side: "target",
          lines: [
            {
              output: "SYN on :{yellow:25} from 89.248.165.77\nsent forged {green:SYN-ACK}\nsent payload '{pink:try harder}'",
              tone: "ok",
              pause: 200,
            },
          ],
        },
        attacker: {
          title: "bot",
          host: "bot#",
          side: "bot",
          lines: [{ command: "nmap -p25 -sS 167.99.10.42", output: "25/tcp {green:open} smtp", tone: "warn" }],
        },
        wire: {
          from: "bot",
          to: "target",
          packets: [
            { label: "SYN :25", kind: "knock" },
            { label: "forged SYN-ACK", kind: "answer" },
            { label: "try harder", kind: "roast" },
          ],
        },
        decode: "compare to playground mode “try-harder fake open”. nmap’s open is a lie — but a useful one for wasting scanners.",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "sample · nmap after the trap",
    strips: [
      {
        type: "run",
        term: {
          title: "Attacker",
          host: "root@lab:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -p21,22,25,80,443 -sS 167.99.10.42",
              output: "21 {green:open}\n22 {green:open}\n25 {green:open}\n80 {green:open}\n443 {green:open}",
              tone: "warn",
              pause: 260,
            },
            {
              command: "tcpdump -A host 167.99.10.42 -c 12",
              output: ".......{pink:try harder}",
              tone: "info",
              pause: 220,
            },
          ],
        },
        decode: "map is polluted vs the earlier honest scan. tcpdump -A shows the payload string on the wire.",
      },
    ],
  },
  {
    kind: "comic",
    act: "live demo",
    headline: "sample · too many knocks → DROP",
    strips: [
      {
        type: "duel",
        target: {
          title: "Target",
          host: "script#",
          side: "target",
          lines: [
            {
              output: "count > 5 for {red:167.99.10.117}\niptables {red:DROP} added",
              tone: "ok",
            },
          ],
        },
        attacker: {
          title: "Attacker",
          host: "root@lab:~#",
          side: "attacker",
          lines: [
            {
              command: "nmap -Pn -p22,80 167.99.10.42",
              output: "22/tcp {orange:filtered}\n80/tcp {orange:filtered}",
              tone: "err",
              pause: 260,
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
        decode: "OS firewall now discards Attacker’s packets early in the path you learned. playground mode “firewall DROP” is this outcome.",
      },
    ],
  },
  {
    kind: "choice",
    act: "quiz",
    prompt: "After DROP, Attacker’s new SYNs are discarded. Where in the journey does that happen?",
    options: [
      "inside nginx after reading HTTP",
      "in the OS firewall / netfilter path (before the app)",
      "only in the bot’s imagination",
      "in DNS",
    ],
    answer: 1,
    roastWrong: "DROP is an OS/netfilter decision — apps never see it.",
    explain: "remember the path: NIC → kernel → firewall hooks → (maybe) socket. DROP cuts in at the firewall hooks.",
  },

  // ── script after live ─────────────────────────────────
  {
    kind: "comic",
    act: "script",
    headline: "script · important parts (after you’ve seen it live)",
    strips: [
      {
        type: "narrator",
        text: "now the code matches behavior you already watched.",
      },
      {
        type: "codebit",
        title: "count SYNs per IP",
        code: `scan_tracker[src_ip]["count"] += 1
if scan_tracker[src_ip]["count"] > 5:
    block_ip(src_ip)   # iptables -A INPUT -s ip -j DROP
    return`,
        decode: "goal wiring: too much knocking → OS DROP.",
      },
      {
        type: "codebit",
        title: "forge Step 2 + payload",
        code: `syn_ack = IP(...)/TCP(..., flags="SA", ...)
send(syn_ack)
send(IP(...)/TCP(..., flags="PA", ...)/Raw(load="try harder"))`,
        decode: "flags SA = SYN-ACK (handshake Step 2 forged). PA = push data including the text try harder.",
      },
      {
        type: "codebit",
        title: "listen",
        code: `sniff(filter="tcp", prn=handle_packet)`,
        decode: "scapy asks the OS for copies of TCP packets and calls your function — that’s how the script “hears” knocks.",
      },
      {
        type: "fix",
        title: "limits",
        text: "teaching tool, not a full production firewall. use cloud SG + real hardening too. lab machines only.",
      },
    ],
  },

  // ── conclude ──────────────────────────────────────────
  {
    kind: "choice",
    act: "final",
    prompt: "What is the full learning path this project was built around?",
    options: [
      "memes first, commands never",
      "VPS basics → OS/DROP → clear handshake → interactive lab → samples → script → playbook",
      "only read iptables man pages",
      "skip Target and only use bots",
    ],
    answer: 1,
    roastWrong: "we started from renting a VPS and ended with a reproducible playbook.",
    explain: "that path is the one-stop solution: concepts, interaction, practice samples, then code.",
  },
  {
    kind: "loot",
    title: "one-stop solution",
    outro:
      "you met the cast and goals, learned what a VPS is and how to rent one, followed a packet through Linux, fixed the SYN / SYN-ACK / ACK confusion, played the packet lab, ran sample commands, then read the script that implements the trap.",
    bullets: [
      "{green:characters} — Target protects · Attacker practices on owned kit · bots hunt · narrator translates",
      "{yellow:VPS} — rented public computer; resources linked for DO / Hetzner / hardening",
      "{cyan:OS path} — NIC → kernel → firewall hooks → socket → app; DROP dies at firewall",
      "{pink:handshake} — 1 SYN · 2 SYN-ACK (one packet, two flags) · 3 ACK",
      "{red:defense} — fake Step 2 + try harder → then iptables DROP · download commands + script",
    ],
    commandsFile: { name: "offtrck-try-harder-commands.md", text: COMMANDS_CHEATSHEET },
    scriptFile: { name: "firewall_try_harder.py", text: FIREWALL_TRY_HARDER_PY },
  },
];

export const tryHarderProject: Project = {
  id: "try-harder",
  title: "try harder firewall",
  badge: "VPS · packets · lab",
  blurb: "basics → handshake lab → samples → script playbook",
  Icon: TryHarderIcon,
  pages,
};
