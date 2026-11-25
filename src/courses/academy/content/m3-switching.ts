import { hostWithIp, pcAt, pingBetween, switchPortOf } from "../lab-kit";
import type { LabContext, Module } from "../types";

const vlanNamed = (number: number, name: string) => ({ net }: LabContext) => {
  const sw = net.devices.find(d => d.kind === "switch" && d.vlans.some(v => v.number === number));
  if (!sw) return `no switch has VLAN ${number}. create it with: vlan ${number}`;
  const vlan = sw.vlans.find(v => v.number === number)!;
  return vlan.name.toLowerCase() === name.toLowerCase() ? true : `VLAN ${number} is named "${vlan.name}", it should be "${name}"`;
};

const pcsInVlan = (ips: string[], vlan: number) => ({ net }: LabContext) => {
  for (const ip of ips) {
    const pc = hostWithIp(net, ip);
    if (!pc) return `no PC uses ${ip}`;
    const port = switchPortOf(net, pc);
    if (!port) return `${pc.name} isn't plugged into a switch`;
    const actual = port.iface?.accessVlan ?? 1;
    if (actual !== vlan) return `${pc.name} is on ${port.port}, which is in VLAN ${actual} (should be ${vlan})`;
  }
  return true;
};

const isolated = ({ net, sim }: LabContext) => {
  const sales = hostWithIp(net, "192.168.10.11");
  const hr = hostWithIp(net, "192.168.20.11");
  if (!sales || !hr) return "couldn't find a Sales PC and an HR PC";
  return sim.sameSegment(sales, hr) ? "Sales and HR are still in the same broadcast domain, so check the access VLANs" : true;
};

export const switching: Module = {
  id: "switching",
  number: 3,
  title: "switching and vlans",
  tagline: "how switches think, and splitting one switch into many",
  color: "#ffb020",
  lessons: [
    {
      kind: "article",
      id: "how-switches-learn",
      title: "how a switch learns who's who",
      minutes: 6,
      summary: "MAC addresses, the MAC table, flooding, and ARP, the protocol that links IP to MAC.",
      blocks: [
        { kind: "p", text: "Every network card has a **MAC address** burned in at the factory, like `00:1A:2B:3C:4D:5E`. It's 48 bits, written in hex. IP addresses can change; MAC addresses (usually) don't." },
        { kind: "p", text: "A switch has one job: get each **frame** out of the right port. To do that it builds a **MAC address table**, a list of \"which MAC lives behind which port\"." },
        { kind: "h", text: "the learning process" },
        { kind: "list", ordered: true, items: [
          "A frame arrives. The switch looks at the **source** MAC and writes down: \"this MAC is on this port\".",
          "It looks at the **destination** MAC. Is it in the table? Send it out of that one port only.",
          "Not in the table yet? **Flood** it out of every port except the one it came in on.",
          "When the reply comes back, the switch learns that MAC too. Next time, no flooding.",
        ] },
        { kind: "anim", id: "mac-learning", caption: "step through: watch the MAC table fill up and flooding turn into direct delivery." },
        { kind: "check", q: "A switch gets a frame for a MAC it hasn't seen yet. What does it do?", options: ["drops it", "sends it back", "floods it out of all other ports", "asks the router"], answer: 2, why: "Unknown destination means flood. Once it learns the MAC, it stops flooding." },
        { kind: "h", text: "ARP: finding the MAC for an IP" },
        { kind: "p", text: "Your PC knows the destination **IP**, but Ethernet needs a **MAC**. So it shouts to everyone: \"Who has 192.168.1.20? Tell 192.168.1.10.\" That's an **ARP request** (a broadcast). Only the owner answers with its MAC." },
        { kind: "anim", id: "arp", caption: "ARP in action: one broadcast question, one direct answer." },
        { kind: "callout", tone: "tip", text: "On a PC, `arp -a` shows the ARP cache. On a Cisco switch, `show mac address-table` shows what it learned." },
        { kind: "cli", prompt: "S1#", lines: ["show mac address-table", "", "Vlan    Mac Address       Type        Ports", "----    -----------       --------    -----", "   1    0001.4321.aa01    DYNAMIC     Fa0/1", "   1    0001.4321.aa02    DYNAMIC     Fa0/2"] },
      ],
    },
    {
      kind: "article",
      id: "vlans",
      title: "vlans: one switch, many networks",
      minutes: 7,
      summary: "split a switch into separate virtual networks without buying more hardware.",
      blocks: [
        { kind: "p", text: "By default every port on a switch is in **VLAN 1**, which means one big network. Every broadcast (like ARP) reaches every device. In a 300-person office that's a lot of noise, and it means Sales can see HR's traffic." },
        { kind: "p", text: "A **VLAN** (virtual LAN) lets you split one physical switch into several separate networks. Ports in VLAN 10 can only talk to other ports in VLAN 10. To go between VLANs you need a **router**." },
        { kind: "anim", id: "vlan-split", caption: "flip VLANs on and watch the broadcast stay inside its own colour." },
        { kind: "h", text: "why companies use them" },
        { kind: "list", items: [
          "**security**: guests can't reach the finance servers.",
          "**less noise**: broadcasts stay inside each VLAN.",
          "**flexibility**: move someone to another team by changing a port, not a cable.",
        ] },
        { kind: "h", text: "creating VLANs on a Cisco switch" },
        { kind: "cli", prompt: "S1(config)#", lines: ["vlan 10", " name SALES", "vlan 20", " name HR", "exit"], note: "creates the VLANs and gives them names" },
        { kind: "h", text: "putting ports into VLANs" },
        { kind: "cli", prompt: "S1(config)#", lines: ["interface range fa0/1 - 2", " switchport mode access", " switchport access vlan 10", "interface range fa0/3 - 4", " switchport mode access", " switchport access vlan 20", "end"], note: "\"access\" ports carry one VLAN and connect to PCs" },
        { kind: "cli", prompt: "S1#", lines: ["show vlan brief", "", "VLAN Name      Status    Ports", "1    default   active    Fa0/5, Fa0/6, ...", "10   SALES     active    Fa0/1, Fa0/2", "20   HR        active    Fa0/3, Fa0/4"] },
        { kind: "check", q: "Two PCs are on the same switch, one in VLAN 10 and one in VLAN 20. Can they talk directly?", options: ["yes, same switch", "no, they need a router"], answer: 1, why: "Different VLANs are different networks. Only a router (or layer-3 switch) can connect them." },
        { kind: "h", text: "trunks: carrying many VLANs on one cable" },
        { kind: "p", text: "When two switches (or a switch and a router) need to share several VLANs, you use a **trunk** port. Each frame gets a small **802.1Q tag** with its VLAN number, so the other side knows where it belongs." },
        { kind: "cli", prompt: "S1(config)#", lines: ["interface g0/1", " switchport mode trunk", " switchport trunk allowed vlan 10,20"] },
        { kind: "callout", tone: "fact", text: "The tag is just 4 bytes. VLAN numbers go from 1 to 4094, so a single cable can carry thousands of separate networks." },
        { kind: "h", text: "router-on-a-stick" },
        { kind: "p", text: "To route **between** VLANs with one router cable, you split the router's port into **sub-interfaces**, one per VLAN, each with its own gateway IP:" },
        { kind: "cli", prompt: "R1(config)#", lines: ["interface g0/0.10", " encapsulation dot1Q 10", " ip address 192.168.10.1 255.255.255.0", "interface g0/0.20", " encapsulation dot1Q 20", " ip address 192.168.20.1 255.255.255.0"] },
      ],
    },
    {
      kind: "quiz",
      id: "quiz",
      title: "module 3 quiz",
      questions: [
        { q: "What does a switch use to forward frames?", options: ["IP addresses", "MAC addresses", "port numbers", "hostnames"], answer: 1, why: "Switches are layer 2 devices: they read MAC addresses." },
        { q: "A switch learns MAC addresses from the…", options: ["destination of frames", "source of frames", "router", "DNS server"], answer: 1, why: "It records the source MAC of each frame against the port it came in on." },
        { q: "ARP is used to…", options: ["find a MAC address for a known IP", "find an IP for a name", "give out IPs", "encrypt frames"], answer: 0, why: "ARP: \"who has this IP? tell me your MAC\"." },
        { q: "By default, all switch ports are in VLAN…", options: ["0", "1", "10", "100"], answer: 1, why: "VLAN 1 is the default VLAN." },
        { q: "Which command puts a port into VLAN 20?", options: ["vlan 20 port", "switchport access vlan 20", "ip vlan 20", "set vlan 20"], answer: 1, why: "Inside the interface: switchport access vlan 20." },
        { q: "A port that carries many VLANs between switches is a…", options: ["access port", "trunk port", "console port", "serial port"], answer: 1, why: "Trunks carry tagged traffic for multiple VLANs." },
        { q: "What adds the VLAN tag to frames on a trunk?", options: ["802.1Q", "802.11", "ARP", "OSPF"], answer: 0, why: "802.1Q is the VLAN tagging standard." },
        { q: "Main benefit of VLANs?", options: ["faster cables", "separating groups of users into different networks", "free IPs", "better Wi-Fi"], answer: 1, why: "VLANs split one switch into separate, isolated networks." },
      ],
    },
    {
      kind: "lab",
      id: "lab",
      title: "split the office with vlans",
      minutes: 20,
      level: "medium",
      story: "Sales and HR share one switch, and HR is not happy that Sales can see their traffic. Put each team in its own VLAN so they're completely separated, while teammates can still reach each other.",
      goals: ["VLAN 10 named SALES, VLAN 20 named HR", "Sales PCs in VLAN 10, HR PCs in VLAN 20", "teammates can ping each other", "Sales and HR are separated"],
      topology: {
        height: 250,
        nodes: [
          { id: "s1", kind: "switch", label: "S1", sub: "2960", x: 200, y: 60 },
          { id: "a", kind: "pc", label: "Sales1", sub: "Fa0/1", x: 45, y: 195 },
          { id: "b", kind: "pc", label: "Sales2", sub: "Fa0/2", x: 140, y: 195 },
          { id: "c", kind: "pc", label: "HR1", sub: "Fa0/3", x: 260, y: 195 },
          { id: "d", kind: "pc", label: "HR2", sub: "Fa0/4", x: 355, y: 195 },
        ],
        links: [
          { a: "s1", b: "a", color: "#4f8cff" }, { a: "s1", b: "b", color: "#4f8cff" },
          { a: "s1", b: "c", color: "#ff4d6d" }, { a: "s1", b: "d", color: "#ff4d6d" },
        ],
        zones: [
          { x: 8, y: 150, w: 180, h: 92, label: "VLAN 10 SALES", color: "#4f8cff" },
          { x: 212, y: 150, w: 180, h: 92, label: "VLAN 20 HR", color: "#ff4d6d" },
        ],
      },
      addressing: {
        head: ["device", "switch port", "VLAN", "IP address", "mask"],
        rows: [
          ["Sales1", "Fa0/1", "10", "192.168.10.11", "255.255.255.0"],
          ["Sales2", "Fa0/2", "10", "192.168.10.12", "255.255.255.0"],
          ["HR1", "Fa0/3", "20", "192.168.20.11", "255.255.255.0"],
          ["HR2", "Fa0/4", "20", "192.168.20.12", "255.255.255.0"],
        ],
      },
      steps: [
        { title: "build it", text: "One **2960** switch and four PCs. Cable the PCs to Fa0/1 – Fa0/4 as shown." },
        { title: "create the VLANs", text: "On the switch CLI:", cli: { prompt: "Switch>", lines: ["enable", "configure terminal", "hostname S1", "vlan 10", " name SALES", "vlan 20", " name HR", " exit"] } },
        { title: "assign the ports", text: "Put each pair of ports in its VLAN:", cli: { prompt: "S1(config)#", lines: ["interface range fa0/1 - 2", " switchport mode access", " switchport access vlan 10", "interface range fa0/3 - 4", " switchport mode access", " switchport access vlan 20", " end"] } },
        { title: "address the PCs", text: "Use the IPs from the table." },
        { title: "verify", text: "`show vlan brief` should list Fa0/1–2 under SALES and Fa0/3–4 under HR. Sales1 → Sales2 should ping; Sales1 → HR1 should not." },
        { title: "save and upload", text: "Save as `lab3.pkt` and upload it below." },
      ],
      checks: [
        { label: "VLAN 10 exists and is named SALES", points: 10, hint: "vlan 10 → name SALES", run: vlanNamed(10, "SALES") },
        { label: "VLAN 20 exists and is named HR", points: 10, hint: "vlan 20 → name HR", run: vlanNamed(20, "HR") },
        { label: "all 4 PCs have the right addresses", points: 10, hint: "Check the addressing table.", run: ctx => {
          for (const ip of ["192.168.10.11", "192.168.10.12", "192.168.20.11", "192.168.20.12"]) {
            const r = pcAt(ip, "255.255.255.0")(ctx);
            if (r !== true) return r;
          }
          return true;
        } },
        { label: "Sales PCs are on VLAN 10 ports", points: 15, hint: "interface range fa0/1 - 2 → switchport access vlan 10", run: pcsInVlan(["192.168.10.11", "192.168.10.12"], 10) },
        { label: "HR PCs are on VLAN 20 ports", points: 15, hint: "interface range fa0/3 - 4 → switchport access vlan 20", run: pcsInVlan(["192.168.20.11", "192.168.20.12"], 20) },
        { label: "Sales1 can ping Sales2", points: 15, hint: "Both must be in VLAN 10 with the same mask.", run: pingBetween("192.168.10.11", "192.168.10.12") },
        { label: "HR1 can ping HR2", points: 15, hint: "Both must be in VLAN 20 with the same mask.", run: pingBetween("192.168.20.11", "192.168.20.12") },
        { label: "Sales and HR are separated", points: 10, hint: "If they share a VLAN, broadcasts still mix.", run: isolated },
      ],
    },
  ],
};
