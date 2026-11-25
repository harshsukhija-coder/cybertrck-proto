import { deviceNamed, endDevices, ipToIntSafe, need, routerIface } from "../lab-kit";
import type { LabContext, Module } from "../types";

const pool = ({ net }: LabContext) =>
  deviceNamed(net, "R1")?.dhcpPools.find(p => p.network === "192.168.50.0");

const dhcpPcs = ({ net }: LabContext) => endDevices(net).filter(d => d.host?.dhcp);

export const services: Module = {
  id: "services",
  number: 5,
  title: "dhcp and dns",
  tagline: "the invisible helpers that make networks just work",
  color: "#b36bff",
  lessons: [
    {
      kind: "article",
      id: "dhcp",
      title: "dhcp: the address vending machine",
      minutes: 6,
      summary: "how your phone gets an IP the second it joins Wi-Fi, in 4 messages.",
      blocks: [
        { kind: "p", text: "Imagine typing an IP, mask, gateway and DNS server into every phone that joins your Wi-Fi. Nightmare. **DHCP** (Dynamic Host Configuration Protocol) does it automatically: a device joins, asks, and gets everything it needs in a few milliseconds." },
        { kind: "h", text: "DORA: the 4-step conversation" },
        { kind: "anim", id: "dhcp-dora", caption: "Discover, Offer, Request, Acknowledge. Press play to watch a laptop get its address." },
        { kind: "table", head: ["step", "who", "says"], rows: [
          ["**D**iscover", "client → everyone (broadcast)", "\"is there a DHCP server out there?\""],
          ["**O**ffer", "server → client", "\"you can have 192.168.50.11\""],
          ["**R**equest", "client → everyone", "\"I'd like 192.168.50.11, please\""],
          ["**A**ck", "server → client", "\"it's yours for 24 hours. Here's your gateway and DNS too\""],
        ] },
        { kind: "callout", tone: "tip", text: "The client doesn't have an IP yet, so it **broadcasts**. That's why the DHCP server (or a relay) must be on the same network." },
        { kind: "h", text: "what's in a DHCP pool" },
        { kind: "table", head: ["setting", "example", "meaning"], rows: [
          ["network", "192.168.50.0 /24", "the range to hand out from"],
          ["default-router", "192.168.50.1", "the gateway clients should use"],
          ["dns-server", "8.8.8.8", "who clients ask for names"],
          ["excluded addresses", ".1 – .10", "reserved for routers, printers and servers"],
          ["lease time", "1 day", "how long before the client must renew"],
        ] },
        { kind: "h", text: "a Cisco router as DHCP server" },
        { kind: "cli", prompt: "R1(config)#", lines: ["ip dhcp excluded-address 192.168.50.1 192.168.50.10", "ip dhcp pool LAN", " network 192.168.50.0 255.255.255.0", " default-router 192.168.50.1", " dns-server 8.8.8.8", " exit"], note: "set the exclusions before the pool, so the router never hands out .1–.10" },
        { kind: "cli", prompt: "R1#", lines: ["show ip dhcp binding", "", "IP address       Client-ID/Hardware address   Lease expiration", "192.168.50.11    0001.6345.A1B2                --", "192.168.50.12    0060.2F81.3C44                --"] },
        { kind: "check", q: "A PC shows 169.254.33.8 after asking for DHCP. What's the most likely cause?", options: ["the PC is hacked", "no DHCP server answered", "the DNS server is down", "the gateway is wrong"], answer: 1, why: "169.254.x.x is what a device gives itself when DHCP fails." },
      ],
    },
    {
      kind: "article",
      id: "dns",
      title: "dns: the internet's contacts app",
      minutes: 6,
      summary: "how names turn into numbers, and why \"it's always DNS\" is a meme.",
      blocks: [
        { kind: "p", text: "You save friends in your phone by **name**, not number. DNS does the same for the internet: you type `github.com`, and DNS finds the IP behind it, like `140.82.121.4`." },
        { kind: "anim", id: "dns-lookup", caption: "a full lookup: your PC → resolver → root → .com → the site's own DNS server." },
        { kind: "h", text: "the chain of servers" },
        { kind: "list", ordered: true, items: [
          "**Resolver** (often your ISP, or 8.8.8.8 / 1.1.1.1): does the legwork for you and caches answers.",
          "**Root servers**: \"I don't know github.com, but here's who handles .com\".",
          "**TLD server (.com)**: \"github.com? ask their name server at ns1.github.com\".",
          "**Authoritative server**: \"github.com is 140.82.121.4\". This is the final answer.",
        ] },
        { kind: "callout", tone: "fact", text: "There are only **13** root server names (a.root-servers.net to m.root-servers.net), but they're copied to over 1,700 locations worldwide." },
        { kind: "h", text: "record types" },
        { kind: "table", head: ["record", "points a name to", "example"], rows: [
          ["A", "an IPv4 address", "github.com → 140.82.121.4"],
          ["AAAA", "an IPv6 address", "google.com → 2a00:1450::200e"],
          ["CNAME", "another name (an alias)", "www.site.com → site.com"],
          ["MX", "the mail server", "gmail.com → gmail-smtp-in.l.google.com"],
          ["TXT", "any text (used for verification)", "\"v=spf1 include:…\""],
        ] },
        { kind: "check", q: "Which record type tells the world where to deliver email for a domain?", options: ["A", "CNAME", "MX", "TXT"], answer: 2, why: "MX = Mail eXchanger." },
        { kind: "h", text: "\"it's always DNS\"" },
        { kind: "p", text: "When a website \"is down\" but you can still ping its IP, the problem is usually DNS. Quick test from any PC:" },
        { kind: "cli", prompt: "C:\\>", lines: ["nslookup github.com", "", "Server:  dns.google", "Address: 8.8.8.8", "", "Name:    github.com", "Address: 140.82.121.4"] },
        { kind: "callout", tone: "tip", text: "In Packet Tracer you can add a **Server**, turn on its DNS service (Services → DNS) and create your own A records, like `shop.lab → 192.168.50.5`." },
      ],
    },
    {
      kind: "quiz",
      id: "quiz",
      title: "module 5 quiz",
      questions: [
        { q: "What does DHCP give a device?", options: ["only a hostname", "an IP address, mask, gateway and DNS server", "a MAC address", "a password"], answer: 1, why: "DHCP hands out the full IP settings." },
        { q: "What's the correct DORA order?", options: ["Discover, Offer, Request, Ack", "Request, Offer, Discover, Ack", "Offer, Discover, Ack, Request", "Discover, Request, Offer, Ack"], answer: 0, why: "Discover → Offer → Request → Acknowledge." },
        { q: "Why does the DHCP Discover go out as a broadcast?", options: ["it's faster", "the client doesn't have an IP or know the server yet", "for security", "routers require it"], answer: 1, why: "With no address and no idea who the server is, shouting to everyone is the only option." },
        { q: "Why exclude addresses from a DHCP pool?", options: ["to save power", "to keep them for devices with fixed IPs, like routers and printers", "DNS needs them", "to make DHCP faster"], answer: 1, why: "Excluded addresses won't be handed out, so static devices don't clash." },
        { q: "What does DNS do?", options: ["turns names into IP addresses", "gives out IPs", "routes packets", "blocks ads"], answer: 0, why: "DNS resolves names to addresses." },
        { q: "Which DNS record maps a name to an IPv4 address?", options: ["MX", "A", "AAAA", "CNAME"], answer: 1, why: "A record = IPv4. AAAA = IPv6." },
        { q: "You can ping 140.82.121.4 but not github.com. The likely problem is…", options: ["the cable", "DNS", "the switch", "DHCP"], answer: 1, why: "The network works (the IP ping succeeds), so the name lookup is what's failing." },
        { q: "Which command shows DHCP leases on a Cisco router?", options: ["show dhcp", "show ip dhcp binding", "show leases", "show ip route"], answer: 1, why: "show ip dhcp binding lists who got which address." },
      ],
    },
    {
      kind: "lab",
      id: "lab",
      title: "automatic addresses with dhcp",
      minutes: 20,
      level: "medium",
      story: "The office is growing and the manager is tired of typing IP addresses. Turn the router into a DHCP server so every new PC configures itself, while keeping .1 to .10 free for network gear.",
      goals: ["R1 G0/0 = 192.168.50.1/24", "a DHCP pool for 192.168.50.0/24 with gateway and DNS", ".1–.10 excluded", "3 PCs get their address automatically"],
      topology: {
        height: 250,
        nodes: [
          { id: "r1", kind: "router", label: "R1", sub: "DHCP server", x: 200, y: 45 },
          { id: "s1", kind: "switch", label: "S1", x: 200, y: 125 },
          { id: "a", kind: "pc", label: "PC1", sub: "DHCP", x: 80, y: 205 },
          { id: "b", kind: "pc", label: "PC2", sub: "DHCP", x: 200, y: 205 },
          { id: "c", kind: "pc", label: "PC3", sub: "DHCP", x: 320, y: 205 },
        ],
        links: [{ a: "r1", b: "s1", label: "G0/0" }, { a: "s1", b: "a" }, { a: "s1", b: "b" }, { a: "s1", b: "c" }],
        zones: [{ x: 20, y: 90, w: 360, h: 150, label: "192.168.50.0/24", color: "#b36bff" }],
      },
      addressing: {
        head: ["setting", "value"],
        rows: [
          ["R1 G0/0", "192.168.50.1 / 255.255.255.0"],
          ["pool network", "192.168.50.0 255.255.255.0"],
          ["default-router", "192.168.50.1"],
          ["dns-server", "8.8.8.8"],
          ["excluded", "192.168.50.1 – 192.168.50.10"],
          ["PCs", "DHCP (no static IP)"],
        ],
      },
      steps: [
        { title: "build it", text: "A **2911** router, a **2960** switch, and 3 PCs. R1 G0/0 → switch, PCs → switch." },
        { title: "configure the router interface", text: "", cli: { prompt: "Router>", lines: ["enable", "configure terminal", "hostname R1", "interface g0/0", " ip address 192.168.50.1 255.255.255.0", " no shutdown", " exit"] } },
        { title: "create the DHCP pool", text: "", cli: { prompt: "R1(config)#", lines: ["ip dhcp excluded-address 192.168.50.1 192.168.50.10", "ip dhcp pool LAN", " network 192.168.50.0 255.255.255.0", " default-router 192.168.50.1", " dns-server 8.8.8.8", " end"] } },
        { title: "switch the PCs to DHCP", text: "On each PC: **Desktop → IP Configuration → DHCP**. After a moment it should show an address like 192.168.50.11." },
        { title: "check", text: "On R1 run `show ip dhcp binding`. You should see 3 leases. Then ping 192.168.50.1 from a PC." },
        { title: "save and upload", text: "Save as `lab5.pkt` and upload it." },
      ],
      checks: [
        { label: "R1 G0/0 is 192.168.50.1 /24 and up", points: 10, hint: "ip address 192.168.50.1 255.255.255.0 + no shutdown", run: routerIface("R1", "192.168.50.1", "255.255.255.0") },
        { label: "a DHCP pool covers 192.168.50.0 /24", points: 15, hint: "ip dhcp pool LAN → network 192.168.50.0 255.255.255.0", run: ctx => {
          const p = pool(ctx);
          if (!p) return "R1 has no DHCP pool with network 192.168.50.0";
          return need(p.mask === "255.255.255.0", `the pool mask is ${p.mask}, it should be 255.255.255.0`);
        } },
        { label: "the pool hands out gateway 192.168.50.1", points: 10, hint: "inside the pool: default-router 192.168.50.1", run: ctx => need(pool(ctx)?.defaultRouter === "192.168.50.1", "the pool has no default-router 192.168.50.1") },
        { label: "the pool hands out a DNS server", points: 10, hint: "inside the pool: dns-server 8.8.8.8", run: ctx => need(pool(ctx)?.dns, "the pool has no dns-server") },
        { label: "192.168.50.1 – .10 are excluded", points: 15, hint: "ip dhcp excluded-address 192.168.50.1 192.168.50.10", run: ({ net }) => {
          const r1 = deviceNamed(net, "R1");
          const lo = ipToIntSafe("192.168.50.1");
          const hi = ipToIntSafe("192.168.50.10");
          const ok = r1?.excluded.some(([a, b]) => ipToIntSafe(a) <= lo && ipToIntSafe(b) >= hi);
          return need(ok, "no excluded-address range covers .1 to .10");
        } },
        { label: "at least 3 PCs are set to DHCP", points: 15, hint: "Desktop → IP Configuration → DHCP on each PC", run: ctx => need(dhcpPcs(ctx).length >= 3, `only ${dhcpPcs(ctx).length} PC(s) are set to DHCP`) },
        { label: "every DHCP PC gets a lease from R1", points: 15, hint: "The PCs must be on the same network as R1 G0/0 (through the switch).", run: ctx => {
          const pcs = dhcpPcs(ctx);
          if (!pcs.length) return "no PCs are set to DHCP";
          const missing = pcs.find(pc => !ctx.sim.leaseOf(pc));
          return missing ? `${missing.name} wouldn't get an address. Is it cabled to the same switch as R1?` : true;
        } },
        { label: "the PCs can ping their gateway", points: 10, hint: "Check the cables and that G0/0 is up.", run: ctx => {
          const r1 = deviceNamed(ctx.net, "R1");
          if (!r1) return "no R1";
          for (const pc of dhcpPcs(ctx)) {
            const result = ctx.sim.ping(pc, r1);
            if (!result.ok) return `${pc.name}: ${result.reason}`;
          }
          return true;
        } },
      ],
    },
  ],
};
