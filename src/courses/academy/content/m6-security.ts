import { deviceNamed, hasLine, need, pcAt, routerIface, section } from "../lab-kit";
import type { LabContext, Module } from "../types";

const r1 = ({ net }: LabContext) => deviceNamed(net, "R1");

const configHas = (re: RegExp, message: string) => (ctx: LabContext) => {
  const r = r1(ctx);
  return r ? need(hasLine(r, re), message) : "no router called R1";
};

export const security: Module = {
  id: "security",
  number: 6,
  title: "security basics",
  tagline: "lock the doors before someone else walks in",
  color: "#5ad1ff",
  lessons: [
    {
      kind: "article",
      id: "harden",
      title: "locking down a cisco device in 10 commands",
      minutes: 7,
      summary: "passwords, encryption, banners and SSH: the checklist every network engineer runs.",
      blocks: [
        { kind: "p", text: "A brand-new router has **no passwords at all**. Anyone who plugs a console cable in, or reaches it over the network, can change everything. Hardening is the first thing you do, before the device goes anywhere near production." },
        { kind: "h", text: "1. protect privileged mode" },
        { kind: "cli", prompt: "R1(config)#", lines: ["enable secret Cl@ss123"], note: "\"secret\" is stored as a strong hash. Never use the old \"enable password\"" },
        { kind: "h", text: "2. protect the console port" },
        { kind: "cli", prompt: "R1(config)#", lines: ["line console 0", " password C0nsole!", " login", " exit"], note: "\"login\" is what makes it actually ask for the password" },
        { kind: "h", text: "3. hide passwords in the config" },
        { kind: "cli", prompt: "R1(config)#", lines: ["service password-encryption"] },
        { kind: "callout", tone: "warn", text: "`service password-encryption` uses weak type-7 encoding that can be reversed in seconds. It stops shoulder-surfing, not hackers. That's why the enable password uses **secret**." },
        { kind: "h", text: "4. a legal warning banner" },
        { kind: "cli", prompt: "R1(config)#", lines: ["banner motd #Authorised access only!#"] },
        { kind: "h", text: "5. SSH instead of Telnet" },
        { kind: "p", text: "**Telnet** sends everything, passwords included, as plain text. Anyone sniffing the network can read it. **SSH** encrypts the whole session. Setting it up takes 6 commands:" },
        { kind: "cli", prompt: "R1(config)#", lines: ["ip domain-name offtrck.lab", "username admin secret Adm1n!", "crypto key generate rsa", "  How many bits in the modulus [512]: 1024", "ip ssh version 2", "line vty 0 4", " login local", " transport input ssh"], note: "vty = the virtual lines used for remote logins" },
        { kind: "table", head: ["command", "why"], rows: [
          ["ip domain-name", "RSA keys need a hostname + domain name"],
          ["username … secret", "a real user account for logins"],
          ["crypto key generate rsa", "creates the encryption keys (1024+ bits for SSH v2)"],
          ["login local", "check the local user list on login"],
          ["transport input ssh", "only allow SSH, so Telnet is blocked"],
        ] },
        { kind: "check", q: "Why is SSH preferred over Telnet?", options: ["it's faster", "it encrypts the session", "it uses less power", "Telnet needs a console cable"], answer: 1, why: "Telnet is plain text, so passwords can be sniffed. SSH encrypts everything." },
        { kind: "h", text: "6. turn off what you don't use" },
        { kind: "list", items: [
          "`shutdown` unused switch ports so nobody can plug in a rogue device.",
          "`no ip http server` turns off the web admin page if you're not using it.",
          "`exec-timeout 5 0` on lines logs idle sessions out after 5 minutes.",
        ] },
        { kind: "callout", tone: "tip", text: "Finish with `copy running-config startup-config` (or `wr`). Otherwise a reboot wipes all your hard work." },
      ],
    },
    {
      kind: "article",
      id: "acls",
      title: "acls: the bouncer at the door",
      minutes: 7,
      summary: "allow and block traffic with access control lists, and the hidden deny at the end.",
      blocks: [
        { kind: "p", text: "An **ACL** (access control list) is a list of rules on a router interface. Each packet is checked against the rules **top to bottom**. The first match wins: permit or deny. Like a bouncer with a guest list." },
        { kind: "anim", id: "acl-filter", caption: "packets arrive at the router. The ACL lets some in and drops the rest." },
        { kind: "callout", tone: "warn", text: "Every ACL ends with an invisible **deny any**. If a packet matches nothing, it's dropped. An ACL with only deny rules blocks **everything**." },
        { kind: "h", text: "standard vs extended" },
        { kind: "table", head: ["", "standard", "extended"], rows: [
          ["numbers", "1–99", "100–199"],
          ["matches on", "source IP only", "source, destination, protocol, port"],
          ["put it", "close to the destination", "close to the source"],
        ] },
        { kind: "h", text: "example: block one PC from the server network" },
        { kind: "cli", prompt: "R1(config)#", lines: ["access-list 10 deny host 192.168.1.66", "access-list 10 permit any", "interface g0/1", " ip access-group 10 out"] },
        { kind: "h", text: "example: only allow web traffic to the server" },
        { kind: "cli", prompt: "R1(config)#", lines: ["access-list 110 permit tcp any host 10.0.0.5 eq 443", "access-list 110 deny ip any host 10.0.0.5", "access-list 110 permit ip any any", "interface g0/0", " ip access-group 110 in"] },
        { kind: "h", text: "wildcard masks" },
        { kind: "p", text: "ACLs use **wildcard masks**, which are the opposite of subnet masks: 0 means \"must match\" and 255 means \"don't care\". To match the whole 192.168.1.0/24 network, use `192.168.1.0 0.0.0.255`." },
        { kind: "check", q: "An ACL has one line: \"deny host 10.1.1.5\". What happens to traffic from 10.1.1.9?", options: ["it's allowed", "it's blocked by the hidden deny any", "it's sent to 10.1.1.5", "the router crashes"], answer: 1, why: "Nothing permits it, so the implicit deny at the end blocks it. Always add a permit line." },
        { kind: "h", text: "the bigger picture" },
        { kind: "list", items: [
          "**Firewalls** are ACLs with memory: they track connections and let replies back in automatically.",
          "**Least privilege**: give every user and device only the access it needs.",
          "**Updates**: most real-world hacks use known bugs that already have patches.",
          "**MFA**: a stolen password is useless without the second factor.",
        ] },
        { kind: "callout", tone: "fact", text: "The most common way into a network is still **phishing**: one fake email and one click. Technology helps, but people are the first line of defence." },
      ],
    },
    {
      kind: "quiz",
      id: "quiz",
      title: "module 6 quiz",
      questions: [
        { q: "Which command stores the enable password as a strong hash?", options: ["enable password", "enable secret", "service password-encryption", "password 7"], answer: 1, why: "enable secret uses a proper hash. enable password is weak." },
        { q: "What does \"login\" under line console 0 do?", options: ["logs you out", "makes the line ask for the password", "enables SSH", "nothing"], answer: 1, why: "Without login, the password is set but never asked for." },
        { q: "Why use SSH instead of Telnet?", options: ["SSH is encrypted", "Telnet is newer", "SSH needs no password", "they're the same"], answer: 0, why: "Telnet sends passwords as readable text." },
        { q: "Which of these is required before generating RSA keys?", options: ["a DHCP pool", "a domain name", "a VLAN", "a static route"], answer: 1, why: "The key name is built from the hostname + domain name." },
        { q: "\"transport input ssh\" on the vty lines means…", options: ["only SSH is allowed for remote logins", "SSH is disabled", "Telnet is preferred", "the console uses SSH"], answer: 0, why: "It blocks Telnet and allows only SSH." },
        { q: "What's at the end of every ACL?", options: ["permit any", "an invisible deny any", "a log line", "nothing"], answer: 1, why: "The implicit deny drops anything that wasn't matched." },
        { q: "A standard ACL can filter on…", options: ["source IP only", "port numbers", "destination IP", "MAC addresses"], answer: 0, why: "Standard ACLs only look at the source address." },
        { q: "Wildcard mask for a /24 network?", options: ["255.255.255.0", "0.0.0.255", "0.0.0.0", "255.0.0.0"], answer: 1, why: "Wildcards are inverted: 0.0.0.255 means \"match the first 3 octets\"." },
      ],
    },
    {
      kind: "lab",
      id: "lab",
      title: "harden the router",
      minutes: 25,
      level: "hard",
      story: "An auditor found the office router wide open: no passwords, Telnet enabled, no warning banner. Lock it down so only the admin can log in, and only over SSH, while keeping the LAN working.",
      goals: ["enable secret + encrypted passwords", "console password with login", "a warning banner", "SSH v2 only, with a local admin user", "the LAN PC can still reach R1"],
      topology: {
        height: 170,
        nodes: [
          { id: "pc", kind: "pc", label: "Admin PC", sub: "192.168.1.10", x: 80, y: 85 },
          { id: "r1", kind: "router", label: "R1", sub: "🔒 SSH only", x: 310, y: 85 },
        ],
        links: [{ a: "pc", b: "r1", label: "G0/0 · 192.168.1.0/24" }],
      },
      addressing: {
        head: ["setting", "value"],
        rows: [
          ["R1 G0/0", "192.168.1.1 / 255.255.255.0"],
          ["Admin PC", "192.168.1.10 / 255.255.255.0, gateway 192.168.1.1"],
          ["domain name", "offtrck.lab"],
          ["SSH user", "admin (any secret)"],
          ["passwords", "anything you like (write them down!)"],
        ],
      },
      steps: [
        { title: "build and address", text: "A **2911** router and a PC, cabled PC → G0/0.", cli: { prompt: "Router>", lines: ["enable", "configure terminal", "hostname R1", "interface g0/0", " ip address 192.168.1.1 255.255.255.0", " no shutdown", " exit"] } },
        { title: "passwords and banner", text: "", cli: { prompt: "R1(config)#", lines: ["enable secret Cl@ss123", "service password-encryption", "banner motd #Authorised access only!#", "line console 0", " password C0nsole!", " login", " exit"] } },
        { title: "SSH", text: "Answer **1024** when asked for the key size.", cli: { prompt: "R1(config)#", lines: ["ip domain-name offtrck.lab", "username admin secret Adm1n!", "crypto key generate rsa", "ip ssh version 2", "line vty 0 4", " login local", " transport input ssh", " end", "copy running-config startup-config"] } },
        { title: "try it", text: "On the PC, set the IP, then in **Command Prompt** run `ssh -l admin 192.168.1.1`. You should see your banner and a password prompt." },
        { title: "save and upload", text: "Save as `lab6.pkt` and upload it." },
      ],
      checks: [
        { label: "R1 G0/0 is 192.168.1.1 /24 and up", points: 5, hint: "ip address + no shutdown", run: routerIface("R1", "192.168.1.1", "255.255.255.0") },
        { label: "an enable secret is set", points: 10, hint: "enable secret <password>", run: configHas(/^enable secret /, "no enable secret found (enable password doesn't count)") },
        { label: "service password-encryption is on", points: 10, hint: "service password-encryption", run: configHas(/^service password-encryption/, "passwords are stored as plain text") },
        { label: "a MOTD banner is set", points: 10, hint: "banner motd #your text#", run: configHas(/^banner motd/, "no banner motd") },
        { label: "the console asks for a password", points: 10, hint: "line console 0 → password … → login", run: ctx => {
          const con = section(r1(ctx), /^line con/);
          if (!con.some(l => /^password /.test(l))) return "line console 0 has no password";
          return need(con.some(l => /^login/.test(l)), "line console 0 has a password but no \"login\", so it's never asked for");
        } },
        { label: "a domain name is set", points: 10, hint: "ip domain-name offtrck.lab", run: configHas(/^ip domain[- ]name /, "no ip domain-name") },
        { label: "a local admin user exists", points: 10, hint: "username admin secret <password>", run: configHas(/^username \S+ (privilege \d+ )?(secret|password) /, "no username … secret … line") },
        { label: "SSH version 2 is enabled", points: 10, hint: "crypto key generate rsa (1024 bits), then ip ssh version 2", run: configHas(/^ip ssh version 2/, "no \"ip ssh version 2\". Did the RSA key get generated?") },
        { label: "remote logins use SSH and local users only", points: 15, hint: "line vty 0 4 → login local → transport input ssh", run: ctx => {
          const vty = section(r1(ctx), /^line vty/);
          if (!vty.length) return "no line vty section";
          if (!vty.some(l => /^login local/.test(l))) return "vty lines don't use \"login local\"";
          return need(vty.some(l => /^transport input ssh\s*$/.test(l)), "vty lines still allow Telnet (use: transport input ssh)");
        } },
        { label: "the admin PC can reach R1", points: 10, hint: "PC IP 192.168.1.10/24, gateway 192.168.1.1", run: ctx => {
          const pc = pcAt("192.168.1.10", "255.255.255.0")(ctx);
          if (pc !== true) return pc;
          const r = r1(ctx);
          const host = ctx.net.devices.find(d => d.host?.ip === "192.168.1.10");
          if (!r || !host) return "missing R1 or the PC";
          const result = ctx.sim.ping(host, r);
          return result.ok ? true : result.reason;
        } },
      ],
    },
  ],
};