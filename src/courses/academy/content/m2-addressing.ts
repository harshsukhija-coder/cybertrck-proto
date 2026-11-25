import { deviceNamed, hostWithIp, need, pcAt, pingBetween, switchPortOf } from "../lab-kit";
import type { LabContext, Module } from "../types";

const PCS = ["192.168.10.11", "192.168.10.12", "192.168.10.13"];

const allOnS1 = ({ net }: LabContext) => {
  const s1 = deviceNamed(net, "S1");
  if (!s1) return "no switch called S1";
  for (const ip of PCS) {
    const pc = hostWithIp(net, ip);
    if (!pc) return `no PC uses ${ip}`;
    if (switchPortOf(net, pc)?.sw !== s1) return `${pc.name} (${ip}) isn't cabled to S1`;
  }
  return true;
};

const allPing = (ctx: LabContext) => {
  for (const a of PCS) {
    for (const b of PCS) {
      if (a === b) continue;
      const r = pingBetween(a, b)(ctx);
      if (r !== true) return `${a} → ${b}: ${r}`;
    }
  }
  return true;
};

export const addressing: Module = {
  id: "addressing",
  number: 2,
  title: "ip addresses and subnetting",
  tagline: "the numbers that make the internet findable",
  color: "#2ee6a6",
  lessons: [
    {
      kind: "article",
      id: "ip-explained",
      title: "ip addresses, explained like a postcode",
      minutes: 6,
      summary: "what the 4 numbers mean, public vs private, and why your PC needs a mask and a gateway.",
      blocks: [
        { kind: "p", text: "An IPv4 address like `192.168.1.25` is four numbers from 0 to 255, separated by dots. Each number is called an **octet** because, inside the computer, it's 8 bits. Four octets make 32 bits in total." },
        { kind: "p", text: "Every address has two parts: the **network part** (which street) and the **host part** (which house on that street). The **subnet mask** tells you where one part ends and the other begins." },
        { kind: "table", head: ["", "network part", "host part"], rows: [
          ["IP 192.168.1.25", "192.168.1", ".25"],
          ["mask 255.255.255.0", "255.255.255", ".0"],
        ] },
        { kind: "callout", tone: "tip", text: "Mask rule of thumb: wherever the mask says **255**, that octet is part of the network. Wherever it says **0**, that octet is for hosts." },
        { kind: "h", text: "the 3 settings every device needs" },
        { kind: "list", items: [
          "**IP address**: who am I?",
          "**Subnet mask**: who are my neighbours (the devices on my own network)?",
          "**Default gateway**: who do I ask about everyone else? (this is the router's IP on my network)",
        ] },
        { kind: "p", text: "Two devices can talk directly only if they're in the **same network**, meaning their network parts match. If not, the packet must go through the gateway." },
        { kind: "check", q: "PC A is 192.168.1.10/24 and PC B is 192.168.2.10/24. Can they talk without a router?", options: ["yes, same network", "no, different networks"], answer: 1, why: "With a /24 mask the first three octets are the network. 192.168.1 ≠ 192.168.2, so a router is needed." },
        { kind: "h", text: "private vs public" },
        { kind: "p", text: "There aren't enough IPv4 addresses for every device on Earth (only ~4.3 billion). So homes and offices use **private** ranges inside, and the router swaps them for one **public** address on the internet (that trick is called NAT)." },
        { kind: "table", head: ["private range", "common use"], rows: [
          ["10.0.0.0 – 10.255.255.255", "big companies"],
          ["172.16.0.0 – 172.31.255.255", "medium networks"],
          ["192.168.0.0 – 192.168.255.255", "homes and small offices"],
        ] },
        { kind: "h", text: "special addresses" },
        { kind: "table", head: ["address", "meaning"], rows: [
          ["127.0.0.1", "localhost: \"me, myself\""],
          ["the first address (e.g. 192.168.1.0)", "the network address. Can't be given to a device"],
          ["the last address (e.g. 192.168.1.255)", "broadcast: \"everyone on this network\""],
          ["169.254.x.x", "the device wanted DHCP but nobody answered"],
        ] },
        { kind: "callout", tone: "fact", text: "**IPv6** addresses are 128 bits long and look like `2001:db8::1`. There are enough of them to give every grain of sand on Earth trillions of addresses." },
      ],
    },
    {
      kind: "article",
      id: "binary",
      title: "binary in 10 minutes (promise)",
      minutes: 7,
      summary: "flip 8 switches and you'll understand every IP address and mask forever.",
      blocks: [
        { kind: "p", text: "Computers only know **on (1)** and **off (0)**. An octet is 8 of these switches. Each switch has a value, and you add up the ones that are on." },
        { kind: "table", head: ["bit", "8th", "7th", "6th", "5th", "4th", "3rd", "2nd", "1st"], rows: [["value", "128", "64", "32", "16", "8", "4", "2", "1"]] },
        { kind: "anim", id: "binary-octet", caption: "tap the bits to turn them on and off. Try to make 192, then 255, then 10." },
        { kind: "h", text: "converting decimal → binary" },
        { kind: "p", text: "Start from the left (128). If the number is at least that big, write 1 and subtract. Otherwise write 0. Move right and repeat." },
        { kind: "table", head: ["168", "≥128?", "≥64?", "≥32?", "≥16?", "≥8?", "≥4?", "≥2?", "≥1?"], rows: [
          ["left over", "40 → 1", "40 → 0", "8 → 1", "8 → 0", "0 → 1", "0", "0", "0"],
        ] },
        { kind: "p", text: "So 168 = `10101000`. Check: 128 + 32 + 8 = 168 ✓" },
        { kind: "check", q: "What is 11000000 in decimal?", options: ["128", "192", "224", "64"], answer: 1, why: "128 + 64 = 192." },
        { kind: "h", text: "why masks look the way they do" },
        { kind: "p", text: "A subnet mask is always a run of 1s followed by 0s. That's why only a few numbers ever show up in masks:" },
        { kind: "table", head: ["binary", "decimal"], rows: [
          ["10000000", "128"], ["11000000", "192"], ["11100000", "224"], ["11110000", "240"],
          ["11111000", "248"], ["11111100", "252"], ["11111110", "254"], ["11111111", "255"],
        ] },
        { kind: "callout", tone: "tip", text: "**CIDR notation** just counts the 1s. `255.255.255.0` = 24 ones = **/24**. `255.255.255.252` = 30 ones = **/30**." },
        { kind: "check", q: "What's 255.255.255.192 in slash notation?", options: ["/24", "/25", "/26", "/27"], answer: 2, why: "24 ones from the three 255s, plus 2 more from 192 (11000000) = 26." },
      ],
    },
    {
      kind: "article",
      id: "subnetting",
      title: "subnetting without tears",
      minutes: 8,
      summary: "split one network into smaller ones, and work out ranges in your head.",
      blocks: [
        { kind: "p", text: "**Subnetting** means cutting one big network into smaller ones. Why? Smaller networks mean less broadcast noise, better security (HR doesn't need to see Sales) and less wasted addresses." },
        { kind: "h", text: "the 3 numbers that matter" },
        { kind: "list", items: [
          "**host bits** = 32 − prefix. A /26 has 6 host bits.",
          "**block size** = 2^(host bits). A /26 has blocks of 64.",
          "**usable hosts** = block size − 2 (network and broadcast are taken). A /26 has 62 usable.",
        ] },
        { kind: "anim", id: "subnet-calc", caption: "drag the slider to change the prefix and watch the network, range and broadcast update live." },
        { kind: "h", text: "worked example" },
        { kind: "p", text: "You have `192.168.10.0/24` and need 4 equal subnets. 4 = 2², so borrow 2 bits: /24 → **/26**. Block size = 64." },
        { kind: "table", head: ["subnet", "network", "usable range", "broadcast"], rows: [
          ["1", "192.168.10.0", ".1 – .62", ".63"],
          ["2", "192.168.10.64", ".65 – .126", ".127"],
          ["3", "192.168.10.128", ".129 – .190", ".191"],
          ["4", "192.168.10.192", ".193 – .254", ".255"],
        ] },
        { kind: "callout", tone: "tip", text: "**The magic number trick:** 256 − the interesting mask octet = block size. Mask 255.255.255.**224** → 256 − 224 = **32**. Networks go up in 32s: .0, .32, .64, .96 …" },
        { kind: "check", q: "Which subnet does 192.168.10.100/26 belong to?", options: ["192.168.10.0", "192.168.10.64", "192.168.10.96", "192.168.10.128"], answer: 1, why: "Blocks of 64: 0, 64, 128 … 100 falls between 64 and 127." },
        { kind: "h", text: "cheat sheet" },
        { kind: "table", head: ["prefix", "mask", "block", "usable hosts", "typical use"], rows: [
          ["/24", "255.255.255.0", "256", "254", "an office LAN"],
          ["/25", "255.255.255.128", "128", "126", "half a LAN"],
          ["/26", "255.255.255.192", "64", "62", "a department"],
          ["/27", "255.255.255.224", "32", "30", "a small team"],
          ["/28", "255.255.255.240", "16", "14", "servers"],
          ["/30", "255.255.255.252", "4", "2", "router-to-router links"],
        ] },
        { kind: "callout", tone: "warn", text: "Classic mistake: giving a device the **network** or **broadcast** address. Packet Tracer will refuse, and real devices will misbehave." },
      ],
    },
    {
      kind: "quiz",
      id: "quiz",
      title: "module 2 quiz",
      questions: [
        { q: "How many bits are in an IPv4 address?", options: ["8", "16", "32", "128"], answer: 2, why: "4 octets × 8 bits = 32 bits." },
        { q: "What does the default gateway do?", options: ["gives out IPs", "is where a device sends traffic for other networks", "blocks viruses", "names devices"], answer: 1, why: "Anything not on the local network goes to the gateway (the router)." },
        { q: "Which of these is a private address?", options: ["8.8.8.8", "172.20.4.1", "52.1.1.1", "200.10.10.10"], answer: 1, why: "172.16.0.0 – 172.31.255.255 is private. 172.20 is inside that range." },
        { q: "255.255.255.0 is the same as…", options: ["/8", "/16", "/24", "/30"], answer: 2, why: "Three 255s = 24 ones." },
        { q: "How many usable hosts are in a /27?", options: ["32", "30", "62", "14"], answer: 1, why: "5 host bits → 32 addresses − 2 = 30." },
        { q: "What is 10101010 in decimal?", options: ["170", "160", "85", "190"], answer: 0, why: "128 + 32 + 8 + 2 = 170." },
        { q: "What's the broadcast address of 192.168.1.64/26?", options: ["192.168.1.127", "192.168.1.255", "192.168.1.128", "192.168.1.63"], answer: 0, why: "Block of 64 starting at .64 ends at .127." },
        { q: "A PC shows 169.254.12.7. What happened?", options: ["it's on the internet", "it asked DHCP for an address but no one answered", "it's a server", "it's using IPv6"], answer: 1, why: "169.254.x.x is the self-assigned address a device picks when DHCP fails." },
      ],
    },
    {
      kind: "lab",
      id: "lab",
      title: "your first office LAN",
      minutes: 15,
      level: "easy",
      story: "A tiny design studio just moved in. They have 3 PCs and one switch. Wire them up, name the switch S1 using the command line, and make sure every PC can reach every other PC.",
      goals: ["one switch with hostname S1", "3 PCs plugged into S1", "addresses from the table", "every PC can ping every other PC"],
      topology: {
        height: 230,
        nodes: [
          { id: "s1", kind: "switch", label: "S1", sub: "2960", x: 200, y: 60 },
          { id: "a", kind: "pc", label: "PC1", sub: ".11", x: 70, y: 180 },
          { id: "b", kind: "pc", label: "PC2", sub: ".12", x: 200, y: 180 },
          { id: "c", kind: "pc", label: "PC3", sub: ".13", x: 330, y: 180 },
        ],
        links: [{ a: "s1", b: "a", label: "Fa0/1" }, { a: "s1", b: "b", label: "Fa0/2" }, { a: "s1", b: "c", label: "Fa0/3" }],
        zones: [{ x: 20, y: 18, w: 360, h: 200, label: "192.168.10.0/24", color: "#2ee6a6" }],
      },
      addressing: {
        head: ["device", "IP address", "subnet mask"],
        rows: [
          ["PC1", "192.168.10.11", "255.255.255.0"],
          ["PC2", "192.168.10.12", "255.255.255.0"],
          ["PC3", "192.168.10.13", "255.255.255.0"],
        ],
      },
      steps: [
        { title: "place the devices", text: "Drag a **2960** switch and three **PC**s onto the workspace." },
        { title: "cable them", text: "Connect each PC's FastEthernet0 to a switch port (Fa0/1, Fa0/2, Fa0/3) using the lightning bolt or a straight-through cable. Wait ~30 seconds for the dots to turn green." },
        { title: "name the switch", text: "Click the switch → **CLI** tab, press Enter, and type:", cli: { prompt: "Switch>", lines: ["enable", "configure terminal", "hostname S1", "end", "copy running-config startup-config"] } },
        { title: "address the PCs", text: "Set each PC's IP and mask from the table (Desktop → IP Configuration)." },
        { title: "test everything", text: "From PC1, ping PC2 and PC3. From PC2, ping PC3.", cli: { prompt: "C:\\>", lines: ["ping 192.168.10.12", "ping 192.168.10.13"] } },
        { title: "save and upload", text: "Save as `lab2.pkt` and upload it below." },
      ],
      checks: [
        { label: "a switch is named S1", points: 15, hint: "Switch CLI: enable → configure terminal → hostname S1", run: ({ net }) => need(net.devices.some(d => d.kind === "switch" && d.hostname?.toLowerCase() === "s1"), "no switch has the hostname S1 (renaming it on the canvas isn't enough, use the hostname command)") },
        { label: "PC1 is 192.168.10.11 /24", points: 15, hint: "Desktop → IP Configuration.", run: pcAt("192.168.10.11", "255.255.255.0") },
        { label: "PC2 is 192.168.10.12 /24", points: 15, hint: "Desktop → IP Configuration.", run: pcAt("192.168.10.12", "255.255.255.0") },
        { label: "PC3 is 192.168.10.13 /24", points: 15, hint: "Desktop → IP Configuration.", run: pcAt("192.168.10.13", "255.255.255.0") },
        { label: "all 3 PCs are plugged into S1", points: 15, hint: "Each PC needs its own cable to the switch.", run: allOnS1 },
        { label: "every PC can ping every other PC", points: 25, hint: "Same mask everywhere, and every cable shows green.", run: allPing },
      ],
    },
  ],
};
