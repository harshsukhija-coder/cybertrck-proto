import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AnimId } from "./types";

// ---------- shared bits ----------

const useInView = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
};

/** Steps 0..count-1 on a timer while playing and on screen */
const useStepper = (count: number, ms = 1500) => {
  const { ref, visible } = useInView<HTMLDivElement>();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing || !visible) return;
    const t = window.setTimeout(() => setStep(s => (s + 1) % count), step === count - 1 ? ms * 1.8 : ms);
    return () => window.clearTimeout(t);
  }, [playing, visible, step, count, ms]);
  return {
    ref,
    step,
    playing,
    toggle: () => setPlaying(p => !p),
    go: (delta: number) => {
      setPlaying(false);
      setStep(s => (s + delta + count) % count);
    },
  };
};

const Controls = ({ stepper, count }: { stepper: ReturnType<typeof useStepper>; count: number }) => (
  <div className="flex items-center gap-1.5">
    <button type="button" onClick={() => stepper.go(-1)} aria-label="previous step" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-sm text-white/70 transition hover:bg-white/10">
      ‹
    </button>
    <button type="button" onClick={stepper.toggle} aria-label={stepper.playing ? "pause" : "play"} className="grid h-8 w-8 place-items-center rounded-full bg-white text-xs text-black transition hover:bg-white/85">
      {stepper.playing ? "❚❚" : "▶"}
    </button>
    <button type="button" onClick={() => stepper.go(1)} aria-label="next step" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-sm text-white/70 transition hover:bg-white/10">
      ›
    </button>
    <span className="ml-1 font-jetbrains text-[11px] text-white/40">
      {stepper.step + 1}/{count}
    </span>
  </div>
);

const Frame = ({ label, controls, children, frameRef }: { label: string; controls?: ReactNode; children: ReactNode; frameRef?: React.Ref<HTMLDivElement> }) => (
  <div ref={frameRef} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c0f16]">
    <div className="flex items-center justify-between gap-3 border-b border-white/5 px-4 py-2.5">
      <span className="flex items-center gap-2 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--accent)">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--accent)" />
        {label}
      </span>
      {controls}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

const Narration = ({ text }: { text: string }) => (
  <p key={text} className="mt-4 min-h-[2.75rem] animate-pop text-[15px] leading-snug text-white/80">
    {text}
  </p>
);

const DeviceGlyph = ({ kind, active }: { kind: "pc" | "switch" | "router" | "server" | "cloud"; active?: boolean }) => {
  const icon = { pc: "💻", switch: "🔀", router: "📡", server: "🗄️", cloud: "☁️" }[kind];
  return (
    <span className={`grid h-11 w-11 place-items-center rounded-xl border text-xl transition sm:h-12 sm:w-12 ${active ? "border-(--accent) bg-(--accent)/15 scale-110" : "border-white/10 bg-white/5"}`}>
      {icon}
    </span>
  );
};

// ---------- packet trip ----------

const TRIP = [
  { at: 0, label: "GET /", text: "Your laptop wraps the request in a packet: from 192.168.1.20 to 142.250.1.1. Not on my network → send to the gateway." },
  { at: 1, label: "GET /", text: "The switch reads the destination MAC and sends the frame out of the one port where the router lives." },
  { at: 2, label: "GET /", text: "The router reads the destination IP, checks its routing table and sends it towards the internet." },
  { at: 3, label: "GET /", text: "After a few more routers, the server receives the request." },
  { at: 3, label: "video", text: "The server answers. The reply is chopped into packets addressed back to you." },
  { at: 2, label: "video", text: "Your router swaps the public address back to your private one (NAT) and passes it in." },
  { at: 1, label: "video", text: "The switch already knows your laptop's MAC, so it goes straight to your port." },
  { at: 0, label: "video", text: "Delivered. All of that took about 40 milliseconds." },
];
const TRIP_NODES = [
  { kind: "pc" as const, name: "laptop" },
  { kind: "switch" as const, name: "switch" },
  { kind: "router" as const, name: "router" },
  { kind: "server" as const, name: "server" },
];

const PacketTrip = () => {
  const s = useStepper(TRIP.length, 1700);
  const now = TRIP[s.step];
  return (
    <Frame frameRef={s.ref} label="packet trip" controls={<Controls stepper={s} count={TRIP.length} />}>
      <div className="relative pt-9">
        <div className="absolute left-[12.5%] right-[12.5%] top-[calc(2.25rem+22px)] h-0.5 bg-white/10 sm:top-[calc(2.25rem+24px)]" />
        <span
          className={`absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 font-jetbrains text-[10px] font-bold text-black shadow-lg transition-[left] duration-700 ease-in-out ${now.label === "video" ? "bg-[#2ee6a6]" : "bg-(--accent)"}`}
          style={{ left: `${12.5 + now.at * 25}%` }}
        >
          {now.label === "video" ? "◀ " : ""}
          {now.label}
          {now.label === "video" ? "" : " ▶"}
        </span>
        <div className="relative flex">
          {TRIP_NODES.map((n, i) => (
            <div key={n.name} className="flex w-1/4 flex-col items-center gap-2">
              <DeviceGlyph kind={n.kind} active={now.at === i} />
              <span className="font-jetbrains text-[10px] uppercase tracking-wider text-white/50">{n.name}</span>
            </div>
          ))}
        </div>
      </div>
      <Narration text={now.text} />
    </Frame>
  );
};

// ---------- encapsulation ----------

const LAYERS = [
  { name: "application", header: "", color: "#b36bff" },
  { name: "transport", header: "TCP :443", color: "#4f8cff" },
  { name: "network", header: "IP 10.0.0.5 → 8.8.8.8", color: "#2ee6a6" },
  { name: "data link", header: "ETH aa:01 → bb:02", color: "#ffb020" },
];
const STACK_STEPS = [
  { layer: 0, wrap: 0, text: "The app creates some data: a web request." },
  { layer: 1, wrap: 1, text: "Transport adds a TCP header with ports. Now it's a **segment**." },
  { layer: 2, wrap: 2, text: "Network adds an IP header with addresses. Now it's a **packet**." },
  { layer: 3, wrap: 3, text: "Data link adds MAC addresses. Now it's a **frame**." },
  { layer: 4, wrap: 3, text: "Physical turns it into bits (electricity, light or radio) and sends it." },
  { layer: 3, wrap: 2, text: "At the other end, each layer removes its own header…" },
  { layer: 1, wrap: 0, text: "…until only the original data reaches the app. Unwrapped!" },
];

const LayerStack = () => {
  const s = useStepper(STACK_STEPS.length, 1800);
  const now = STACK_STEPS[s.step];
  return (
    <Frame frameRef={s.ref} label="encapsulation" controls={<Controls stepper={s} count={STACK_STEPS.length} />}>
      <div className="grid gap-1.5">
        {[...LAYERS, { name: "physical", header: "", color: "#ffffff" }].map((l, i) => (
          <div key={l.name} className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${now.layer === i ? "bg-white/10" : ""}`}>
            <span className="w-20 shrink-0 font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: now.layer === i ? l.color : "rgba(255,255,255,0.35)" }}>
              {l.name}
            </span>
            {now.layer === i && i < 4 && (
              <div className="flex min-w-0 animate-pop flex-wrap items-stretch font-jetbrains text-[10px] font-bold text-black">
                {LAYERS.slice(1, now.wrap + 1)
                  .reverse()
                  .map(h => (
                    <span key={h.name} className="truncate px-1.5 py-1 first:rounded-l-md" style={{ background: h.color }}>
                      {h.header}
                    </span>
                  ))}
                <span className={`bg-white px-2 py-1 ${now.wrap === 0 ? "rounded-md" : "rounded-r-md"}`}>data</span>
              </div>
            )}
            {now.layer === i && i === 4 && <span className="animate-pop truncate font-jetbrains text-xs text-white/80">0110100101110010010111…</span>}
          </div>
        ))}
      </div>
      <Narration text={now.text.replace(/\*\*/g, "")} />
    </Frame>
  );
};

// ---------- sequence diagrams ----------

type Seq = { actors: { name: string; kind: "pc" | "switch" | "router" | "server" | "cloud" }[]; steps: { from: number; to: number | "all"; label: string; text: string }[] };

const SEQUENCES: Record<string, Seq> = {
  "tcp-handshake": {
    actors: [{ name: "you", kind: "pc" }, { name: "server", kind: "server" }],
    steps: [
      { from: 0, to: 1, label: "SYN", text: "\"Hi, can we talk? My sequence number starts at 100.\"" },
      { from: 1, to: 0, label: "SYN-ACK", text: "\"Got it (101). Sure, mine starts at 300.\"" },
      { from: 0, to: 1, label: "ACK", text: "\"Got yours too (301). We're connected!\"" },
      { from: 0, to: 1, label: "DATA", text: "Now the real data flows, and every piece gets acknowledged." },
    ],
  },
  arp: {
    actors: [{ name: "PC-A .10", kind: "pc" }, { name: "PC-B .20", kind: "pc" }, { name: "PC-C .30", kind: "pc" }],
    steps: [
      { from: 0, to: "all", label: "who has .20?", text: "PC-A knows the IP 192.168.1.20 but not its MAC. It broadcasts to everyone (MAC ff:ff:ff:ff:ff:ff)." },
      { from: 1, to: 0, label: ".20 is aa:bb:cc", text: "Only PC-B owns that IP, so only PC-B replies, and directly (unicast)." },
      { from: 0, to: 1, label: "frame", text: "PC-A saves the MAC in its ARP cache and sends the real frame. Next time: no question needed." },
    ],
  },
  "dhcp-dora": {
    actors: [{ name: "new laptop", kind: "pc" }, { name: "DHCP server", kind: "router" }],
    steps: [
      { from: 0, to: "all", label: "DISCOVER", text: "The laptop has no IP yet, so it broadcasts: \"Is there a DHCP server out there?\"" },
      { from: 1, to: 0, label: "OFFER", text: "The server picks a free address from its pool: \"You can have 192.168.50.11.\"" },
      { from: 0, to: "all", label: "REQUEST", text: "\"Yes please, I'll take .11!\" (Broadcast, so any other servers know it's taken.)" },
      { from: 1, to: 0, label: "ACK", text: "\"It's yours. Mask /24, gateway .1, DNS 8.8.8.8, lease 1 day.\" Done." },
    ],
  },
  "dns-lookup": {
    actors: [{ name: "your PC", kind: "pc" }, { name: "resolver", kind: "server" }, { name: "root", kind: "cloud" }, { name: ".com", kind: "cloud" }, { name: "github's", kind: "server" }],
    steps: [
      { from: 0, to: 1, label: "github.com?", text: "Your PC asks its resolver (e.g. 8.8.8.8). It doesn't know yet." },
      { from: 1, to: 2, label: "github.com?", text: "The resolver asks a root server." },
      { from: 2, to: 1, label: "ask .com", text: "Root: \"no idea, but here are the .com servers.\"" },
      { from: 1, to: 3, label: "github.com?", text: "The resolver asks the .com server." },
      { from: 3, to: 1, label: "ask ns1.github", text: ".com: \"github.com's own name server is ns1.github.com.\"" },
      { from: 1, to: 4, label: "github.com?", text: "The resolver asks GitHub's authoritative server." },
      { from: 4, to: 1, label: "140.82.121.4", text: "The final answer! The resolver caches it for next time." },
      { from: 1, to: 0, label: "140.82.121.4", text: "Your PC gets the IP and connects. All in ~30 ms." },
    ],
  },
};

const Sequence = ({ id }: { id: keyof typeof SEQUENCES }) => {
  const seq = SEQUENCES[id];
  const s = useStepper(seq.steps.length, 1900);
  const n = seq.actors.length;
  const x = (i: number) => ((i + 0.5) / n) * 100;

  return (
    <Frame frameRef={s.ref} label={id.replace("-", " ")} controls={<Controls stepper={s} count={seq.steps.length} />}>
      <div className="flex">
        {seq.actors.map((a, i) => {
          const now = seq.steps[s.step];
          const active = now.from === i || now.to === i || (now.to === "all" && now.from !== i);
          return (
            <div key={a.name} className="flex flex-1 flex-col items-center gap-1.5">
              <DeviceGlyph kind={a.kind} active={active} />
              <span className="truncate text-center font-jetbrains text-[9px] uppercase tracking-wider text-white/50 sm:text-[10px]">{a.name}</span>
            </div>
          );
        })}
      </div>
      <div className="relative mt-3">
        {seq.actors.map((a, i) => (
          <span key={a.name} className="absolute bottom-0 top-0 w-px bg-white/10" style={{ left: `${x(i)}%` }} />
        ))}
        {seq.steps.map((st, i) => {
          const to = st.to === "all" ? (st.from === 0 ? n - 1 : 0) : st.to;
          const left = Math.min(x(st.from), x(to));
          const width = Math.abs(x(to) - x(st.from));
          const rightward = to > st.from;
          const shown = i <= s.step;
          return (
            <div key={i} className={`relative h-8 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute top-1/2" style={{ left: `${left}%`, width: `${width}%` }}>
                <div className={`h-0.5 ${st.to === "all" ? "border-t-2 border-dashed border-(--accent)" : "bg-(--accent)"} ${i === s.step ? "" : "opacity-40"}`} />
                <span className={`absolute -top-[5px] text-[10px] text-(--accent) ${rightward ? "-right-1" : "-left-1"} ${i === s.step ? "" : "opacity-40"}`}>{rightward ? "▶" : "◀"}</span>
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-1.5 font-jetbrains text-[10px] font-bold ${i === s.step ? "bg-(--accent) text-black" : "text-white/40"}`}>
                  {st.label}
                  {st.to === "all" ? " 📣" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Narration text={seq.steps[s.step].text} />
    </Frame>
  );
};

// ---------- binary octet ----------

const BITS = [128, 64, 32, 16, 8, 4, 2, 1];
const TARGETS = [192, 255, 10, 168, 172, 224];

const BinaryOctet = () => {
  const [on, setOn] = useState<boolean[]>(() => BITS.map((_, i) => i < 2));
  const [target, setTarget] = useState(0);
  const value = BITS.reduce((sum, b, i) => sum + (on[i] ? b : 0), 0);
  const hit = value === TARGETS[target];

  return (
    <Frame label="binary playground">
      <div className="grid grid-cols-8 gap-1 sm:gap-2">
        {BITS.map((b, i) => (
          <button
            key={b}
            type="button"
            onClick={() => setOn(o => o.map((v, j) => (j === i ? !v : v)))}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 transition active:scale-95 ${on[i] ? "border-(--accent) bg-(--accent)/15" : "border-white/10 bg-white/5"}`}
          >
            <span className={`font-poster text-2xl sm:text-3xl ${on[i] ? "text-(--accent)" : "text-white/30"}`}>{on[i] ? 1 : 0}</span>
            <span className="font-jetbrains text-[9px] text-white/45 sm:text-[10px]">{b}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <p className="font-jetbrains text-sm text-white/60">
          {BITS.filter((_, i) => on[i]).join(" + ") || "0"} = <span className="font-poster text-4xl text-white">{value}</span>
        </p>
        <div className={`rounded-xl px-3 py-2 text-sm transition ${hit ? "animate-pop bg-[#2ee6a6] text-black" : "bg-white/5 text-white/70"}`}>
          {hit ? (
            <button type="button" onClick={() => setTarget(t => (t + 1) % TARGETS.length)} className="font-semibold">
              nailed it 🎉 next →
            </button>
          ) : (
            <>
              challenge: make <b className="text-white">{TARGETS[target]}</b>
            </>
          )}
        </div>
      </div>
    </Frame>
  );
};

// ---------- subnet calculator ----------

const toIp = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
const parseIp = (s: string) => {
  const p = s.split(".").map(Number);
  return p.length === 4 && p.every(x => Number.isInteger(x) && x >= 0 && x <= 255) ? ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0 : null;
};

const SubnetCalc = () => {
  const [ip, setIp] = useState("192.168.10.77");
  const [prefix, setPrefix] = useState(26);
  const n = parseIp(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = n === null ? 0 : (n & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const size = 2 ** (32 - prefix);
  const bits = n === null ? "" : n.toString(2).padStart(32, "0");

  const rows = [
    ["mask", toIp(mask)],
    ["network", toIp(network)],
    ["first usable", prefix >= 31 ? "—" : toIp(network + 1)],
    ["last usable", prefix >= 31 ? "—" : toIp(broadcast - 1)],
    ["broadcast", toIp(broadcast)],
    ["usable hosts", prefix >= 31 ? "0" : (size - 2).toLocaleString()],
  ];

  return (
    <Frame label="subnet calculator">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={ip}
          onChange={e => setIp(e.target.value.trim())}
          spellCheck={false}
          inputMode="decimal"
          className={`w-44 rounded-xl border bg-white/5 px-3 py-2 font-jetbrains text-sm text-white outline-none focus:border-(--accent) ${n === null ? "border-rose-400" : "border-white/10"}`}
        />
        <span className="font-poster text-3xl text-(--accent)">/{prefix}</span>
      </div>
      <input type="range" min={16} max={30} value={prefix} onChange={e => setPrefix(Number(e.target.value))} className="mt-4 w-full accent-(--accent)" aria-label="prefix length" />
      {n !== null && (
        <p className="mt-3 break-all font-jetbrains text-[11px] leading-relaxed sm:text-xs">
          {bits.split("").map((b, i) => (
            <span key={i} className={i < prefix ? "text-(--accent)" : "text-white/40"}>
              {b}
              {i % 8 === 7 && i < 31 ? <span className="text-white/20">.</span> : null}
            </span>
          ))}
          <span className="mt-1 block font-vibe text-[11px] text-white/45">
            <span className="text-(--accent)">network bits</span> · <span className="text-white/60">host bits</span>
          </span>
        </p>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {rows.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-white/5 px-3 py-2">
            <dt className="font-jetbrains text-[9px] uppercase tracking-wider text-white/45">{k}</dt>
            <dd className="mt-0.5 truncate font-jetbrains text-[13px] text-white">{n === null ? "?" : v}</dd>
          </div>
        ))}
      </dl>
    </Frame>
  );
};

// ---------- MAC learning ----------

const MAC_PCS = [
  { name: "A", mac: "aa:01", port: "Fa0/1" },
  { name: "B", mac: "bb:02", port: "Fa0/2" },
  { name: "C", mac: "cc:03", port: "Fa0/3" },
  { name: "D", mac: "dd:04", port: "Fa0/4" },
];
const MAC_STEPS = [
  { from: -1, to: -1, flood: false, learned: [] as number[], text: "A new switch with an empty MAC table. It knows nothing yet." },
  { from: 0, to: 1, flood: true, learned: [0], text: "A → B. The switch learns \"A is on Fa0/1\". B is unknown, so it floods to every other port." },
  { from: 1, to: 0, flood: false, learned: [0, 1], text: "B replies → A. The switch learns B is on Fa0/2. It knows A, so it sends to Fa0/1 only." },
  { from: 2, to: 0, flood: false, learned: [0, 1, 2], text: "C → A. Learns C on Fa0/3. A is known: delivered directly, no flooding." },
  { from: 0, to: 2, flood: false, learned: [0, 1, 2], text: "A → C. Both known. The switch now works like a private tunnel between ports." },
];

const MacLearning = () => {
  const s = useStepper(MAC_STEPS.length, 2200);
  const now = MAC_STEPS[s.step];
  const lit = (i: number) => i === now.from || i === now.to || (now.flood && i !== now.from);

  return (
    <Frame frameRef={s.ref} label="mac learning" controls={<Controls stepper={s} count={MAC_STEPS.length} />}>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex justify-center">
            <DeviceGlyph kind="switch" active={now.from >= 0} />
          </div>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {MAC_PCS.map((pc, i) => (
              <div key={pc.name} className="flex flex-col items-center">
                <span className={`h-7 w-0.5 transition-colors ${lit(i) ? (i === now.from ? "bg-white" : "bg-(--accent)") : "bg-white/10"}`} />
                <span className={`grid h-10 w-10 place-items-center rounded-xl border font-poster text-lg transition ${i === now.from ? "border-white bg-white text-black" : lit(i) ? "border-(--accent) text-(--accent)" : "border-white/10 text-white/50"}`}>
                  {pc.name}
                </span>
                <span className="mt-1 font-jetbrains text-[9px] text-white/40">{pc.port}</span>
              </div>
            ))}
          </div>
        </div>
        <table className="h-fit self-start font-jetbrains text-[11px]">
          <thead>
            <tr className="text-left text-white/40">
              <th className="pr-4 font-normal">MAC</th>
              <th className="font-normal">port</th>
            </tr>
          </thead>
          <tbody>
            {MAC_PCS.map((pc, i) =>
              now.learned.includes(i) ? (
                <tr key={pc.mac} className="animate-pop text-white">
                  <td className="pr-4">{pc.mac}</td>
                  <td>{pc.port}</td>
                </tr>
              ) : null,
            )}
            {!now.learned.length && (
              <tr>
                <td colSpan={2} className="text-white/30">(empty)</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Narration text={now.text} />
    </Frame>
  );
};

// ---------- VLANs ----------

const VLAN_PCS = [
  { name: "Sales", vlan: 10 },
  { name: "Sales", vlan: 10 },
  { name: "HR", vlan: 20 },
  { name: "Sales", vlan: 10 },
  { name: "HR", vlan: 20 },
  { name: "HR", vlan: 20 },
];
const VLAN_COLOR: Record<number, string> = { 10: "#4f8cff", 20: "#ff4d6d" };

const VlanSplit = () => {
  const [vlans, setVlans] = useState(false);
  const [burst, setBurst] = useState(0);
  const sender = 0;
  const reached = (i: number) => i !== sender && (!vlans || VLAN_PCS[i].vlan === VLAN_PCS[sender].vlan);

  return (
    <Frame
      label="vlans"
      controls={
        <button type="button" onClick={() => setVlans(v => !v)} className={`rounded-full px-3 py-1 text-xs font-semibold transition ${vlans ? "bg-(--accent) text-black" : "border border-white/15 text-white/70"}`}>
          VLANs {vlans ? "on" : "off"}
        </button>
      }
    >
      <div className="flex justify-center">
        <DeviceGlyph kind="switch" active={burst > 0} />
      </div>
      <div className="mt-1 grid grid-cols-6 gap-1.5">
        {VLAN_PCS.map((pc, i) => {
          const color = vlans ? VLAN_COLOR[pc.vlan] : "#9ca3af";
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="h-6 w-0.5" style={{ background: color, opacity: 0.5 }} />
              <span
                key={`${burst}-${i}`}
                className={`grid h-10 w-full max-w-12 place-items-center rounded-xl border text-lg ${burst > 0 && reached(i) ? "animate-pop" : ""}`}
                style={{
                  borderColor: color,
                  background: burst > 0 && (reached(i) || i === sender) ? `${color}33` : "transparent",
                  opacity: burst > 0 && !reached(i) && i !== sender ? 0.3 : 1,
                }}
              >
                {i === sender ? "📣" : burst > 0 && reached(i) ? "👂" : "💻"}
              </span>
              <span className="mt-1 truncate font-jetbrains text-[9px]" style={{ color }}>
                {pc.name}
                {vlans ? ` ${pc.vlan}` : ""}
              </span>
            </div>
          );
        })}
      </div>
      <button type="button" onClick={() => setBurst(b => b + 1)} className="mt-5 w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 active:scale-[0.99]">
        📣 send a broadcast from the first Sales PC
      </button>
      <Narration
        text={
          burst === 0
            ? "Tap the button to send a broadcast, then flip VLANs on and try again."
            : vlans
              ? "With VLANs on, only Sales PCs (VLAN 10) hear it. HR is a separate network, even on the same switch."
              : "Without VLANs, every single PC hears the broadcast, HR included."
        }
      />
    </Frame>
  );
};

// ---------- routing hops ----------

const HOP_NODES = ["PC-A", "R1", "R2", "R3", "PC-B"];
const HOP_STEPS = [
  { at: 0, table: [] as string[][], hit: -1, text: "PC-A (192.168.1.10) wants to reach 192.168.4.20. Not my network → send it to my gateway, R1." },
  { at: 1, table: [["C", "192.168.1.0/24", "G0/0"], ["C", "10.0.12.0/30", "G0/1"], ["S", "192.168.4.0/24", "via 10.0.12.2"]], hit: 2, text: "R1 checks its table: a static route says 192.168.4.0 goes via 10.0.12.2 (R2)." },
  { at: 2, table: [["C", "10.0.12.0/30", "G0/0"], ["C", "10.0.23.0/30", "G0/1"], ["S", "0.0.0.0/0", "via 10.0.23.2"]], hit: 2, text: "R2 has no specific route, but its default route (0.0.0.0/0) matches everything → R3." },
  { at: 3, table: [["C", "10.0.23.0/30", "G0/0"], ["C", "192.168.4.0/24", "G0/1"]], hit: 1, text: "R3 is directly connected to 192.168.4.0, so it delivers the packet straight to PC-B." },
  { at: 4, table: [], hit: -1, text: "Arrived! Remember: the reply needs a route back too, on every router." },
];

const RoutingHops = () => {
  const s = useStepper(HOP_STEPS.length, 2300);
  const now = HOP_STEPS[s.step];
  return (
    <Frame frameRef={s.ref} label="routing hops" controls={<Controls stepper={s} count={HOP_STEPS.length} />}>
      <div className="relative flex items-center justify-between">
        <div className="absolute left-[10%] right-[10%] top-1/2 h-0.5 -translate-y-3 bg-white/10" />
        {HOP_NODES.map((name, i) => (
          <div key={name} className="relative flex flex-col items-center gap-1.5">
            <DeviceGlyph kind={name.startsWith("R") ? "router" : "pc"} active={now.at === i} />
            <span className={`font-jetbrains text-[10px] ${now.at === i ? "text-(--accent)" : "text-white/45"}`}>{name}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 min-h-[6.5rem] rounded-xl bg-black/30 p-3 font-jetbrains text-[11px]">
        {now.table.length ? (
          <>
            <p className="mb-1.5 text-white/40">{HOP_NODES[now.at]}# show ip route</p>
            {now.table.map((row, i) => (
              <p key={row.join()} className={`flex gap-3 rounded px-1.5 py-0.5 ${i === now.hit ? "animate-pop bg-(--accent) text-black" : "text-white/70"}`}>
                <span className="w-3">{row[0]}</span>
                <span className="w-28 sm:w-32">{row[1]}</span>
                <span className="truncate">{row[2]}</span>
              </p>
            ))}
          </>
        ) : (
          <p className="text-white/35">{now.at === 0 ? "destination: 192.168.4.20" : "✓ reply on its way back"}</p>
        )}
      </div>
      <Narration text={now.text} />
    </Frame>
  );
};

// ---------- ACL ----------

const ACL_RULES = ["permit tcp any host 10.0.0.5 eq 443", "deny ip host 192.168.1.66 any", "permit ip 192.168.1.0 0.0.0.255 any", "(deny any any)"];
const ACL_PACKETS = [
  { from: "192.168.1.20", what: "HTTPS → 10.0.0.5:443", rule: 0 },
  { from: "192.168.1.66", what: "ping → 10.0.0.9", rule: 1 },
  { from: "192.168.1.30", what: "SSH → 10.0.0.9:22", rule: 2 },
  { from: "172.16.0.4", what: "Telnet → 10.0.0.9:23", rule: 3 },
];

const AclFilter = () => {
  const s = useStepper(ACL_PACKETS.length, 2200);
  const pkt = ACL_PACKETS[s.step];
  const permitted = ACL_RULES[pkt.rule].startsWith("permit");
  return (
    <Frame frameRef={s.ref} label="acl bouncer" controls={<Controls stepper={s} count={ACL_PACKETS.length} />}>
      <div key={s.step} className="flex animate-pop items-center gap-3 rounded-xl bg-white/5 p-3">
        <span className="text-xl">📦</span>
        <span className="min-w-0 font-jetbrains text-xs">
          <span className="block text-white">from {pkt.from}</span>
          <span className="block text-white/50">{pkt.what}</span>
        </span>
        <span className={`ml-auto shrink-0 rounded-lg px-2.5 py-1 font-poster text-lg uppercase ${permitted ? "bg-[#2ee6a6] text-black" : "bg-rose-500 text-white"}`}>{permitted ? "permit" : "deny"}</span>
      </div>
      <ol className="mt-3 grid gap-1 font-jetbrains text-[11px]">
        {ACL_RULES.map((rule, i) => (
          <li
            key={rule}
            className={`flex gap-2 rounded-lg px-2 py-1.5 transition ${i === pkt.rule ? (rule.startsWith("permit") ? "bg-[#2ee6a6]/15 text-[#2ee6a6]" : "bg-rose-500/15 text-rose-300") : i < pkt.rule ? "text-white/25 line-through" : "text-white/50"}`}
          >
            <span className="w-4 text-white/30">{i + 1}</span>
            {rule}
          </li>
        ))}
      </ol>
      <Narration text={`Checked top to bottom. ${pkt.rule > 0 ? `Rules 1–${pkt.rule} don't match. ` : ""}Rule ${pkt.rule + 1} matches → ${permitted ? "let in" : "dropped"}.`} />
    </Frame>
  );
};

// ---------- registry ----------

export const Animation = ({ id }: { id: AnimId }) => {
  switch (id) {
    case "packet-trip":
      return <PacketTrip />;
    case "layer-stack":
      return <LayerStack />;
    case "binary-octet":
      return <BinaryOctet />;
    case "subnet-calc":
      return <SubnetCalc />;
    case "mac-learning":
      return <MacLearning />;
    case "vlan-split":
      return <VlanSplit />;
    case "routing-hops":
      return <RoutingHops />;
    case "acl-filter":
      return <AclFilter />;
    default:
      return <Sequence id={id} />;
  }
};
