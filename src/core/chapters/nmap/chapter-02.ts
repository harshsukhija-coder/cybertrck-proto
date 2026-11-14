import mindBlownMeme from "../../../assets/memes/mind-blown.gif";
import sweatingMeme from "../../../assets/memes/sweating.gif";
import type { Chapter, ChoiceScene, QuizQuestion, Scene } from "../../story";

const OS_OPTIONS = ["windows", "macos", "linux"];

const whoAmI: ChoiceScene = {
  kind: "choice",
  key: "os",
  prompt: [
    { from: "ramesh", text: "before we scan anyone else, let's find {pink:you}. every device has an ip address, and so does yours." },
    { from: "ramesh", text: "quick question: which computer are {yellow:you} using right now? i'll show you the right command." },
  ],
  options: [
    {
      label: OS_OPTIONS[0],
      messages: [
        { from: "ramesh", text: "on windows: press {cyan:win + r}, type {cyan:cmd}, hit enter. then type:" },
        {
          from: "system",
          terminal: {
            prompt: "C:\\Users\\you>",
            command: "ipconfig",
            output: `Windows IP Configuration


Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . :
   Link-local IPv6 Address . . . . . : fe80::4c1a:9d2e:7b31:a0f2%12
   IPv4 Address. . . . . . . . . . . : {pink:192.168.1.10}
   Subnet Mask . . . . . . . . . . . : {cyan:255.255.255.0}
   Default Gateway . . . . . . . . . : {yellow:192.168.1.1}

Ethernet adapter Ethernet:

   Media State . . . . . . . . . . . : Media disconnected`,
          },
        },
        { from: "ramesh", text: "windows doesn't print the broadcast address, but we can work it out from the mask. you'll see how in a minute. want more detail (like your {purple:MAC address})? try {cyan:ipconfig /all}." },
      ],
    },
    {
      label: OS_OPTIONS[1],
      messages: [
        { from: "ramesh", text: "on a mac: press {cyan:cmd + space}, type {cyan:terminal}, hit enter. then type:" },
        {
          from: "system",
          terminal: {
            command: "ifconfig en0",
            output: `en0: flags=8863<UP,BROADCAST,SMART,RUNNING,SIMPLEX,MULTICAST> mtu 1500
    options=6460<TSO4,TSO6,CHANNEL_IO,PARTIAL_CSUM,ZEROINVERT_CSUM>
    ether {purple:a4:83:e7:1c:5d:20}
    inet6 fe80::1c8f:3a2b:9e4d:7f10%en0 prefixlen 64 secured scopeid 0xb
    inet {pink:192.168.1.10} netmask {cyan:0xffffff00} broadcast {orange:192.168.1.255}
    nd6 options=201<PERFORMNUD,DAD>
    media: autoselect
    status: active`,
          },
        },
        { from: "ramesh", text: "{cyan:en0} is usually the wifi card on a mac. and the router's address? ask the routing table:" },
        {
          from: "system",
          terminal: {
            command: "route -n get default | grep gateway",
            output: "    gateway: {yellow:192.168.1.1}",
          },
        },
      ],
    },
    {
      label: OS_OPTIONS[2],
      messages: [
        { from: "ramesh", text: "on linux: open a terminal ({cyan:ctrl + alt + t}). the modern command is {cyan:ip a}. old-school {cyan:ifconfig} still works if 'net-tools' is installed." },
        {
          from: "system",
          terminal: {
            command: "ip a show wlan0",
            output: `3: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether {purple:a4:83:e7:1c:5d:20} brd ff:ff:ff:ff:ff:ff
    inet {pink:192.168.1.10}/{cyan:24} brd {orange:192.168.1.255} scope global dynamic wlan0
       valid_lft 85934sec preferred_lft 85934sec
    inet6 fe80::1c8f:3a2b:9e4d:7f10/64 scope link
       valid_lft forever preferred_lft forever`,
          },
        },
        {
          from: "system",
          terminal: {
            command: "ip route | grep default",
            output: "default via {yellow:192.168.1.1} dev wlan0 proto dhcp metric 600",
          },
        },
      ],
    },
  ],
};

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 2 · know your network" },
    { from: "ramesh", text: "welcome back. you passed the test, so you're officially less confused than friday." },
    { from: "friday", text: "hey! ...fair." },
  ],
  whoAmI,
  [
    { from: "ramesh", text: "your numbers might be a little different, that's fine. here's how to read them:" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "decoding the output",
        text: "{pink:192.168.1.10} -> your ip address. your house number on the street.\n{cyan:255.255.255.0 = 0xffffff00 = /24} -> the subnet mask. which part is the street, which part is the house.\n{yellow:192.168.1.1} -> default gateway = the router. the way out to the internet.\n{orange:192.168.1.255} -> the broadcast address. hold that thought.\n{purple:a4:83:e7:1c:5d:20} -> MAC address. the device's serial number, burned in at the factory.",
      },
    },
  ],
  // Private vs public
  [
    { from: "friday", text: "so if i google 'what is my ip', i'll see 192.168.1.10?" },
    { from: "ramesh", text: "nope. you'll see something like {green:49.36.112.84}. that's your {green:public ip}, the one the internet sees. the whole office shares it." },
    { from: "ramesh", text: "{pink:192.168.1.10} is a {pink:private ip}. it only means something inside your office. the router swaps private <-> public on the way out. that trick is called {yellow:NAT}." },
    { from: "ramesh", text: "think of a company receptionist. outsiders only know the office address. only the receptionist knows which desk you sit at." },
  ],
  [
    { from: "friday", text: "how do i know if an ip is private?" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "the 3 private ranges (memorise these!)",
        text: "{pink:10.0.0.0 - 10.255.255.255}  (10.0.0.0/8) -> 16.7 million addresses. big companies.\n{pink:172.16.0.0 - 172.31.255.255}  (172.16.0.0/12) -> 1 million. companies, docker.\n{pink:192.168.0.0 - 192.168.255.255}  (192.168.0.0/16) -> 65,536. homes + small offices.\n\nthese are never routed on the public internet. if you see one, you're inside someone's network.",
      },
    },
  ],
  // IP ranges
  [
    { from: "ramesh", text: "now the important part: {cyan:ranges}. remember the target in the header? {cyan:192.168.1.0/24}. let's take it apart." },
    { from: "system", text: "anatomy of an ip address and a /24 network:", visual: "ip-anatomy" },
  ],
  [
    { from: "ramesh", text: "an ip is 4 numbers, each 0-255 (8 bits each, 32 bits total). {cyan:/24} means the first 24 bits, the first 3 numbers, are the {cyan:street}. only the last number changes: that's the {pink:house}." },
    { from: "friday", text: "so 192.168.1.x has 256 numbers?" },
    { from: "ramesh", text: "256 numbers, but only {green:254 houses}. {yellow:.0} is the name of the street (network address) and {orange:.255} is the megaphone (broadcast). the router usually takes {yellow:.1}." },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "CIDR cheat sheet",
        text: "{cyan:/32} -> exactly 1 ip           192.168.1.30/32\n{cyan:/24} -> 256 ips (254 usable)  192.168.1.0/24\n{cyan:/16} -> 65,536 ips           192.168.0.0/16\n{cyan:/8}  -> 16,777,216 ips       10.0.0.0/8\n\nsmaller number after the slash = bigger network.",
      },
    },
    { from: "friday", image: mindBlownMeme, caption: "friday realising /16 is bigger than /24" },
  ],
  // Packets
  [
    { from: "ramesh", text: "next: how does data actually move? when you hit print, your laptop doesn't send 'the document' in one piece." },
    { from: "ramesh", text: "it chops it into small {cyan:packets}. each one is like an envelope with a label on it." },
    { from: "system", text: "a packet's journey from friday's laptop to the printer:", visual: "packet-journey" },
  ],
  [
    { from: "ramesh", text: "the label says {pink:from: 192.168.1.10}, {yellow:to: 192.168.1.20}, {orange:port 9100} (which program on the printer should open it)." },
    { from: "ramesh", text: "the router reads the label and delivers it. if an envelope gets lost, TCP notices and sends it again. the printer puts the pieces back in order." },
    { from: "friday", text: "so the network is literally a postal service." },
    { from: "ramesh", text: "a very fast one. thousands of envelopes a second. the simplest envelope is a {green:ping}: 'are you there?' -> 'yes!'" },
    {
      from: "system",
      terminal: {
        command: "ping -c 3 192.168.1.20",
        output: `PING 192.168.1.20 (192.168.1.20): 56 data bytes
64 bytes from {blue:192.168.1.20}: icmp_seq=0 ttl=255 time={green:3.214 ms}
64 bytes from {blue:192.168.1.20}: icmp_seq=1 ttl=255 time={green:2.871 ms}
64 bytes from {blue:192.168.1.20}: icmp_seq=2 ttl=255 time={green:3.005 ms}

--- 192.168.1.20 ping statistics ---
3 packets transmitted, 3 packets received, {green:0.0% packet loss}
round-trip min/avg/max/stddev = 2.871/3.030/3.214/0.141 ms`,
      },
    },
    { from: "ramesh", text: "{green:time} = how long the round trip took. 3 ms = the printer is right next to us. (on windows, use {cyan:-n 3} instead of -c 3.)" },
  ],
  // Broadcast
  [
    { from: "ramesh", text: "now remember {orange:.255}? the {orange:broadcast address}. one packet sent there goes to {orange:every} house on the street. like shouting 'is anyone here?' in the office." },
    { from: "system", text: "one shout, many replies:", visual: "broadcast" },
  ],
  {
    kind: "choice",
    key: "os",
    prompt: [{ from: "ramesh", text: "let's try a {orange:broadcast ping} on your machine:" }],
    options: [
      {
        label: OS_OPTIONS[0],
        messages: [
          {
            from: "system",
            terminal: {
              prompt: "C:\\Users\\you>",
              command: "ping 192.168.1.255",
              output: `Pinging 192.168.1.255 with 32 bytes of data:
{red:Request timed out.}
{red:Request timed out.}
{red:Request timed out.}
{red:Request timed out.}`,
            },
          },
          { from: "ramesh", text: "windows' ping doesn't really do broadcast. but windows remembers who it has talked to. check its neighbour list:" },
          {
            from: "system",
            terminal: {
              prompt: "C:\\Users\\you>",
              command: "arp -a",
              output: `Interface: 192.168.1.10 --- 0xc
  Internet Address      Physical Address      Type
  {yellow:192.168.1.1}           a0-40-a0-3c-11-02     dynamic
  {blue:192.168.1.20}          3c-52-82-da-41-c2     dynamic
  {purple:192.168.1.40}          00-11-32-8f-2b-64     dynamic
  {orange:192.168.1.255}         ff-ff-ff-ff-ff-ff     static`,
            },
          },
        ],
      },
      {
        label: OS_OPTIONS[1],
        messages: [
          {
            from: "system",
            terminal: {
              command: "ping -c 2 192.168.1.255",
              output: `PING 192.168.1.255 (192.168.1.255): 56 data bytes
64 bytes from {yellow:192.168.1.1}: icmp_seq=0 ttl=64 time=1.921 ms
64 bytes from {purple:192.168.1.40}: icmp_seq=0 ttl=64 time=4.102 ms {orange:(DUP!)}
64 bytes from {blue:192.168.1.20}: icmp_seq=0 ttl=255 time=6.380 ms {orange:(DUP!)}
64 bytes from {yellow:192.168.1.1}: icmp_seq=1 ttl=64 time=2.044 ms

--- 192.168.1.255 ping statistics ---
2 packets transmitted, 2 packets received, +2 duplicates, 0.0% packet loss`,
            },
          },
        ],
      },
      {
        label: OS_OPTIONS[2],
        messages: [
          {
            from: "system",
            terminal: {
              command: "ping -b -c 2 192.168.1.255",
              output: `WARNING: pinging broadcast address
PING 192.168.1.255 (192.168.1.255) 56(84) bytes of data.
64 bytes from {yellow:192.168.1.1}: icmp_seq=1 ttl=64 time=1.92 ms
64 bytes from {purple:192.168.1.40}: icmp_seq=1 ttl=64 time=4.10 ms {orange:(DUP!)}
64 bytes from {blue:192.168.1.20}: icmp_seq=1 ttl=255 time=6.38 ms {orange:(DUP!)}
64 bytes from {yellow:192.168.1.1}: icmp_seq=2 ttl=64 time=2.04 ms

--- 192.168.1.255 ping statistics ---
2 packets transmitted, 2 received, +2 duplicates, 0% packet loss`,
            },
          },
        ],
      },
    ],
  },
  [
    { from: "ramesh", text: "{orange:(DUP!)} means 'more than one device answered the same shout'. that's broadcast working." },
    { from: "friday", text: "wait... only the {yellow:router}, the {blue:printer} and the {purple:nas} answered. where are the laptops? where's {red:DESKTOP-X7Q}?" },
    { from: "ramesh", text: "modern windows and macs ignore broadcast pings on purpose. attackers abused them in the 90s to flood networks (the {red:smurf attack})." },
    { from: "ramesh", text: "so shouting misses devices. we need something smarter. something that knocks on every door, one by one..." },
  ],
  // Install nmap
  {
    kind: "choice",
    key: "os",
    prompt: [{ from: "ramesh", text: "time to install {green:nmap}. step by step for your os:" }],
    options: [
      {
        label: OS_OPTIONS[0],
        messages: [
          { from: "ramesh", text: "step 1 -> open {cyan:https://nmap.org/download} in your browser\nstep 2 -> under 'microsoft windows binaries', download the {yellow:latest stable self-installer} (nmap-7.95-setup.exe)\nstep 3 -> run it. keep {pink:Npcap} ticked. nmap needs it to build its own packets\nstep 4 -> open a {orange:new} command prompt as administrator and check it worked:" },
          {
            from: "system",
            terminal: {
              prompt: "C:\\Windows\\system32>",
              command: "nmap --version",
              output: `Nmap version {green:7.95} ( https://nmap.org )
Platform: i686-pc-windows-windows
Compiled with: nmap-liblua-5.4.6 openssl-3.0.13 nmap-libssh2-1.11.0 nmap-libz-1.3.1 nmap-libpcre2-10.43 Npcap-1.79 nmap-libdnet-1.12 ipv6
Compiled without:
Available nsock engines: iocp poll select`,
            },
          },
          { from: "ramesh", text: "shortcut for people who like terminals: {cyan:winget install -e --id Insecure.Nmap}. bonus: the installer also gives you {purple:zenmap}, a point-and-click version." },
        ],
      },
      {
        label: OS_OPTIONS[1],
        messages: [
          { from: "ramesh", text: "the easiest way is {yellow:homebrew}, the mac package manager.\nstep 1 -> no homebrew yet? install it (one time only):" },
          {
            from: "system",
            terminal: {
              command: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
              output: "==> Installation successful!",
            },
          },
          { from: "ramesh", text: "step 2 -> install nmap:" },
          {
            from: "system",
            terminal: {
              command: "brew install nmap",
              output: `==> Downloading https://ghcr.io/v2/homebrew/core/nmap/manifests/7.95
==> Pouring nmap--7.95.arm64_sequoia.bottle.tar.gz
{green:🍺  /opt/homebrew/Cellar/nmap/7.95: 841 files, 27.6MB}`,
            },
          },
          { from: "ramesh", text: "step 3 -> check it worked:" },
          {
            from: "system",
            terminal: {
              command: "nmap --version",
              output: `Nmap version {green:7.95} ( https://nmap.org )
Platform: arm-apple-darwin24.0.0
Compiled with: liblua-5.4.6 openssl-3.3.1 libssh2-1.11.0 libz-1.2.12 libpcre2-10.44 nmap-libpcap-1.10.4 nmap-libdnet-1.12 ipv6
Compiled without:
Available nsock engines: kqueue poll select`,
            },
          },
          { from: "ramesh", text: "no homebrew? nmap.org/download also has a {cyan:.dmg} installer." },
        ],
      },
      {
        label: OS_OPTIONS[2],
        messages: [
          { from: "ramesh", text: "one line, depending on your distro:" },
          {
            from: "system",
            terminal: {
              command: "sudo apt update && sudo apt install nmap -y",
              title: "ubuntu / debian / kali / mint",
              output: `Reading package lists... Done
Setting up nmap (7.95+dfsg-1) ...
{green:Processing triggers for man-db ...}`,
            },
          },
          {
            from: "system",
            terminal: {
              command: "sudo dnf install nmap        # fedora / rhel\nsudo pacman -S nmap         # arch / manjaro",
            },
          },
          { from: "ramesh", text: "then check it worked:" },
          {
            from: "system",
            terminal: {
              command: "nmap --version",
              output: `Nmap version {green:7.95} ( https://nmap.org )
Platform: x86_64-pc-linux-gnu
Compiled with: liblua-5.4.6 openssl-3.0.13 libssh2-1.11.0 libz-1.3 libpcre2-10.42 libpcap-1.10.4 nmap-libdnet-1.12 ipv6
Compiled without:
Available nsock engines: epoll poll select`,
            },
          },
          { from: "ramesh", text: "on {purple:kali linux} it's already installed. hackers' favourite os." },
        ],
      },
    ],
  },
  // nmap --help
  [
    { from: "ramesh", text: "installed? good. every tool has a manual. let's look at nmap's:" },
    {
      from: "system",
      terminal: {
        command: "nmap --help",
        output: `Nmap 7.95 ( https://nmap.org )
Usage: nmap [Scan Type(s)] [Options] {target specification}
TARGET SPECIFICATION:
  Can pass hostnames, IP addresses, networks, etc.
  Ex: scanme.nmap.org, microsoft.com/24, 192.168.0.1; 10.0.0-255.1-254
  {yellow:-iL <inputfilename>}: Input from list of hosts/networks
  -iR <num hosts>: Choose random targets
  {yellow:--exclude <host1[,host2][,host3],...>}: Exclude hosts/networks
  --excludefile <exclude_file>: Exclude list from file
HOST DISCOVERY:
  -sL: List Scan - simply list targets to scan
  {cyan:-sn: Ping Scan - disable port scan}
  -Pn: Treat all hosts as online -- skip host discovery
  -PS/PA/PU/PY[portlist]: TCP SYN/ACK, UDP or SCTP discovery to given ports
  -PE/PP/PM: ICMP echo, timestamp, and netmask request discovery probes
  -PO[protocol list]: IP Protocol Ping
  -n/-R: Never do DNS resolution/Always resolve [default: sometimes]
  --dns-servers <serv1[,serv2],...>: Specify custom DNS servers
  --system-dns: Use OS's DNS resolver
  --traceroute: Trace hop path to each host
SCAN TECHNIQUES:
  {pink:-sS}/{orange:sT}/sA/sW/sM: TCP {pink:SYN}/{orange:Connect()}/ACK/Window/Maimon scans
  -sU: UDP Scan
  -sN/sF/sX: TCP Null, FIN, and Xmas scans
  --scanflags <flags>: Customize TCP scan flags
  -sI <zombie host[:probeport]>: Idle scan
  -sY/sZ: SCTP INIT/COOKIE-ECHO scans
  -sO: IP protocol scan
  -b <FTP relay host>: FTP bounce scan
PORT SPECIFICATION AND SCAN ORDER:
  {yellow:-p <port ranges>: Only scan specified ports}
    Ex: -p22; -p1-65535; -p U:53,111,137,T:21-25,80,139,8080,S:9
  --exclude-ports <port ranges>: Exclude the specified ports from scanning
  -F: Fast mode - Scan fewer ports than the default scan
  -r: Scan ports sequentially - don't randomize
  --top-ports <number>: Scan <number> most common ports
  --port-ratio <ratio>: Scan ports more common than <ratio>
SERVICE/VERSION DETECTION:
  {green:-sV: Probe open ports to determine service/version info}
  --version-intensity <level>: Set from 0 (light) to 9 (try all probes)
  --version-light: Limit to most likely probes (intensity 2)
  --version-all: Try every single probe (intensity 9)
  --version-trace: Show detailed version scan activity (for debugging)
SCRIPT SCAN:
  -sC: equivalent to --script=default
  --script=<Lua scripts>: <Lua scripts> is a comma separated list of
           directories, script-files or script-categories
  --script-args=<n1=v1,[n2=v2,...]>: provide arguments to scripts
  --script-args-file=filename: provide NSE script args in a file
  --script-trace: Show all data sent and received
  --script-updatedb: Update the script database.
  --script-help=<Lua scripts>: Show help about scripts.
OS DETECTION:
  {purple:-O: Enable OS detection}
  --osscan-limit: Limit OS detection to promising targets
  --osscan-guess: Guess OS more aggressively
TIMING AND PERFORMANCE:
  Options which take <time> are in seconds, or append 'ms' (milliseconds),
  's' (seconds), 'm' (minutes), or 'h' (hours) to the value (e.g. 30m).
  -T<0-5>: Set timing template (higher is faster)
  --min-hostgroup/max-hostgroup <size>: Parallel host scan group sizes
  --min-parallelism/max-parallelism <numprobes>: Probe parallelization
  --min-rtt-timeout/max-rtt-timeout/initial-rtt-timeout <time>: Specifies
      probe round trip time.
  --max-retries <tries>: Caps number of port scan probe retransmissions.
  --host-timeout <time>: Give up on target after this long
  --scan-delay/--max-scan-delay <time>: Adjust delay between probes
  --min-rate <number>: Send packets no slower than <number> per second
  --max-rate <number>: Send packets no faster than <number> per second
FIREWALL/IDS EVASION AND SPOOFING:
  -f; --mtu <val>: fragment packets (optionally w/given MTU)
  -D <decoy1,decoy2[,ME],...>: Cloak a scan with decoys
  -S <IP_Address>: Spoof source address
  -e <iface>: Use specified interface
  -g/--source-port <portnum>: Use given port number
  --proxies <url1,[url2],...>: Relay connections through HTTP/SOCKS4 proxies
  --data <hex string>: Append a custom payload to sent packets
  --data-string <string>: Append a custom ASCII string to sent packets
  --data-length <num>: Append random data to sent packets
  --ip-options <options>: Send packets with specified ip options
  --ttl <val>: Set IP time-to-live field
  --spoof-mac <mac address/prefix/vendor name>: Spoof your MAC address
  --badsum: Send packets with a bogus TCP/UDP/SCTP checksum
OUTPUT:
  {blue:-oN}/-oX/-oS/-oG <file>: Output scan in normal, XML, s|<rIpt kIddi3,
     and Grepable format, respectively, to the given filename.
  -oA <basename>: Output in the three major formats at once
  -v: Increase verbosity level (use -vv or more for greater effect)
  -d: Increase debugging level (use -dd or more for greater effect)
  --reason: Display the reason a port is in a particular state
  --open: Only show open (or possibly open) ports
  --packet-trace: Show all packets sent and received
  --iflist: Print host interfaces and routes (for debugging)
  --append-output: Append to rather than clobber specified output files
  --resume <filename>: Resume an aborted scan
  --noninteractive: Disable runtime interactions via keyboard
  --stylesheet <path/URL>: XSL stylesheet to transform XML output to HTML
  --webxml: Reference stylesheet from Nmap.Org for more portable XML
  --no-stylesheet: Prevent associating of XSL stylesheet w/XML output
MISC:
  -6: Enable IPv6 scanning
  {red:-A: Enable OS detection, version detection, script scanning, and traceroute}
  --datadir <dirname>: Specify custom Nmap data file location
  --send-eth/--send-ip: Send using raw ethernet frames or IP packets
  --privileged: Assume that the user is fully privileged
  --unprivileged: Assume the user lacks raw socket privileges
  -V: Print version number
  -h: Print this help summary page.
EXAMPLES:
  nmap -v -A scanme.nmap.org
  nmap -v -sn 192.168.0.0/16 10.0.0.0/8
  nmap -v -iR 10000 -Pn -p 80
SEE THE MAN PAGE (https://nmap.org/book/man.html) FOR MORE OPTIONS AND EXAMPLES`,
      },
    },
  ],
  [
    { from: "friday", text: "..." },
    { from: "friday", text: "ramesh. that's like a hundred options. am i supposed to learn ALL of that?", image: sweatingMeme, caption: "friday scrolling through nmap --help" },
    { from: "ramesh", text: "relax. nobody memorises this. not even me. pros use about 8 flags 95% of the time." },
    { from: "ramesh", text: "the ones i coloured in are all you need, and you'll learn every one of them in this course:\n{cyan:-sn} who's alive · {pink:-sS} stealth scan · {orange:-sT} connect scan · {yellow:-p} which ports\n{green:-sV} versions · {purple:-O} operating system · {red:-A} everything · {blue:-oN} save to file" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "the one rule",
        text: "only scan networks you own, or where you have {red:written permission}. scanning someone else's network can be illegal (in india: IT act section 43 / 66). friday has permission from his boss. you can practise on your own home network, or on {green:scanme.nmap.org}, which the nmap team set up for exactly this.",
      },
    },
    { from: "ramesh", text: "next time, we stop shouting and start knocking. let's find out exactly who's on this network." },
    { from: "system", text: "chapter 2 complete. next: who is on the network?" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "which command shows your ip address on windows?",
    options: ["ifconfig", "ipconfig", "nmap --ip", "showip"],
    answer: 1,
    explanation: "windows uses ipconfig. macos uses ifconfig, linux uses ip a (or ifconfig).",
  },
  {
    question: "which of these is a private ip address?",
    options: ["8.8.8.8", "49.36.112.84", "192.168.1.10", "142.250.183.14"],
    answer: 2,
    explanation: "192.168.x.x is one of the three private ranges. the others are public internet addresses.",
  },
  {
    question: "what is the 'default gateway' in friday's office?",
    options: ["the printer", "the router at 192.168.1.1", "the broadcast address", "the public ip"],
    answer: 1,
    explanation: "the default gateway is the router, the door from the office network to the internet.",
  },
  {
    question: "what does the router's NAT do?",
    options: [
      "blocks all hackers",
      "swaps private ips for the shared public ip on the way out",
      "makes the wifi faster",
      "gives every device its own public ip",
    ],
    answer: 1,
    explanation: "NAT translates private addresses to the office's one public ip, like a receptionist.",
  },
  {
    question: "how many usable device addresses are in 192.168.1.0/24?",
    options: ["24", "100", "254", "65,536"],
    answer: 2,
    explanation: "256 addresses minus .0 (network) and .255 (broadcast) = 254 usable.",
  },
  {
    question: "in 192.168.1.0/24, what is 192.168.1.255?",
    options: ["the router", "the broadcast address", "the network address", "friday's laptop"],
    answer: 1,
    explanation: ".255 is the broadcast address. a packet sent there reaches every device on the street.",
  },
  {
    question: "which network is the biggest?",
    options: ["10.0.0.0/8", "192.168.1.0/24", "172.16.0.0/16", "192.168.1.30/32"],
    answer: 0,
    explanation: "a smaller number after the slash means a bigger network. /8 = 16.7 million addresses.",
  },
  {
    question: "what is written on every packet's 'envelope'?",
    options: [
      "only the message",
      "the sender's password",
      "source ip, destination ip and port",
      "the wifi name",
    ],
    answer: 2,
    explanation: "routers read the source/destination ip, and the port says which program should open it.",
  },
  {
    question: "why didn't the laptops answer friday's broadcast ping?",
    options: [
      "they were switched off",
      "modern windows/macos ignore broadcast pings on purpose",
      "broadcast only works on printers",
      "the router blocked friday",
    ],
    answer: 1,
    explanation: "broadcast pings were abused (smurf attacks), so modern systems ignore them. that's why we need nmap.",
  },
  {
    question: "which nmap option shows the built-in manual of all options?",
    options: ["nmap -A", "nmap --help", "nmap -sn", "nmap --manual-please"],
    answer: 1,
    explanation: "nmap --help (or -h) prints every option. don't panic, you only need a few.",
  },
];

const notes = `# chapter 02 · know your network

> offtrck · nmap module · study notes

## 1. finding your own ip
| os | command | what to look for |
|---|---|---|
| windows | \`ipconfig\` (or \`ipconfig /all\`) | IPv4 Address, Subnet Mask, Default Gateway |
| macos | \`ifconfig en0\` or \`ipconfig getifaddr en0\` | inet, netmask, broadcast |
| linux | \`ip a\` (modern), \`ifconfig\` (net-tools) | inet x.x.x.x/24, brd |
| gateway | win: \`ipconfig\` · mac: \`route -n get default\` · linux: \`ip route\` | the router's address |

**MAC address** (\`a4:83:e7:1c:5d:20\`): a 48-bit hardware id. the first half (OUI) identifies the manufacturer. that's how nmap later knows a device is "Dell" or "Synology".

## 2. ipv4 addresses, properly
- an ipv4 address is **32 bits**, written as 4 octets (0-255): \`192.168.1.10\`.
- in binary: \`11000000.10101000.00000001.00001010\`.
- the **subnet mask** says which bits are network and which are host.
  - \`255.255.255.0\` = \`11111111.11111111.11111111.00000000\` = 24 ones = **/24**.
  - mac shows the same mask in hex: \`0xffffff00\`.

### CIDR notation
| cidr | mask | addresses | usable hosts |
|---|---|---|---|
| /32 | 255.255.255.255 | 1 | 1 (a single host) |
| /30 | 255.255.255.252 | 4 | 2 |
| /24 | 255.255.255.0 | 256 | 254 |
| /16 | 255.255.0.0 | 65,536 | 65,534 |
| /8 | 255.0.0.0 | 16,777,216 | 16,777,214 |

formula: addresses = 2^(32 - prefix). usable = addresses - 2.

### special addresses in a /24
- \`.0\` = **network address** (the name of the street)
- \`.1\` = usually the **router / default gateway** (convention, not a rule)
- \`.255\` = **broadcast address** (all hosts on the street)

## 3. private vs public
private ranges (RFC 1918), never routed on the internet:
- \`10.0.0.0/8\`
- \`172.16.0.0/12\` (172.16.0.0 to 172.31.255.255)
- \`192.168.0.0/16\`

other special ones worth knowing:
- \`127.0.0.1\` (localhost, your own machine)
- \`169.254.x.x\` (APIPA, "dhcp failed, i gave myself an address")
- \`100.64.0.0/10\` (carrier-grade NAT used by ISPs and mobile networks)

**NAT (network address translation):** the router rewrites the source ip of outgoing packets from private (192.168.1.10) to the office's single public ip, and remembers the mapping so replies come back to the right device. side effect: devices behind NAT are not directly reachable from the internet, unless someone opens a **port forward**.

**DHCP:** the router hands out ip addresses automatically (that's why linux showed "dynamic" and a lease time \`valid_lft\`).

## 4. how packets travel
1. an application (e.g. print dialog) hands data to the OS.
2. **TCP** splits it into segments, numbers them, adds source/destination **ports**.
3. **IP** adds source/destination **ip addresses** (the envelope).
4. **Ethernet/WiFi** adds source/destination **MAC addresses**. to learn the printer's MAC, the laptop asks the street with **ARP**: "who has 192.168.1.20? tell 192.168.1.10".
5. the router/switch forwards it. the receiver unwraps the layers in reverse and reassembles the data.
6. **TCP** retransmits anything lost. **UDP** doesn't bother (used for DNS, video, games).

simplified layers (OSI / TCP-IP): application -> transport (TCP/UDP, ports) -> network (IP) -> link (MAC, wifi/ethernet).

**ping** uses ICMP *echo request* / *echo reply*. \`time\` = round trip time. \`ttl\` = time-to-live, decreases by 1 at each router hop (a hint about the OS: linux/mac start at 64, windows at 128, network gear often 255).

## 5. broadcast
- sending to \`192.168.1.255\` delivers a packet to every host in the /24.
- linux: \`ping -b 192.168.1.255\` · macos: \`ping 192.168.1.255\` · windows: not supported, use \`arp -a\` to see neighbours you've already talked to.
- \`(DUP!)\` = multiple replies to the same request.
- modern OSes ignore broadcast ICMP because of the **smurf attack** (spoofing a victim's ip and broadcasting pings so every host floods the victim).
- important: ARP, DHCP and many discovery protocols still rely on broadcast. that's why a local nmap scan can still find everyone.

## 6. installing nmap
- **windows:** nmap.org/download, run the self-installer, keep **Npcap** (packet capture driver) ticked. or \`winget install -e --id Insecure.Nmap\`. run the terminal as administrator for raw packet scans.
- **macos:** \`brew install nmap\` (or the .dmg from nmap.org).
- **linux:** \`sudo apt install nmap\` · \`sudo dnf install nmap\` · \`sudo pacman -S nmap\`. preinstalled on kali / parrot.
- verify: \`nmap --version\`.

## 7. surviving nmap --help
the help is grouped into sections. the flags you'll actually use:
| flag | meaning | chapter |
|---|---|---|
| \`-sn\` | ping scan, who's alive | 3 |
| \`-sS\` | SYN "stealth" scan | 4 |
| \`-sT\` | TCP connect scan | 4 |
| \`-p\` | which ports | 4 |
| \`-sV\` | service versions | 5 |
| \`-O\` | os detection | 5 |
| \`-A\` | aggressive, all of the above | 5 |
| \`-oN\` | save normal output to a file | 5 |

full manual: \`man nmap\` or https://nmap.org/book/man.html

## practise safely
only scan what you own or have written permission for. legal practice target: \`scanme.nmap.org\`.
`;

export const chapterTwo: Chapter = { title: "chapter 02", subtitle: "know your network", scenes, quiz, notes };
