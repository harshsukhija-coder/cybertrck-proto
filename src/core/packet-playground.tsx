import { useState } from "react";
import { cast } from "./project-faces";
import { Face } from "./project-faces-ui";

type Scenario = "handshake" | "closed" | "drop" | "fake";

type PacketCard = {
  id: string;
  from: "attacker" | "target";
  to: "attacker" | "target";
  flag: string;
  name: string;
  says: string;
  flags: string;
  example: string;
  scanner: string;
};

const scenarios: Record<
  Scenario,
  {
    label: string;
    blurb: string;
    packets: PacketCard[];
    result: string;
  }
> = {
  handshake: {
    label: "① normal open (3 packets)",
    blurb: "A real service is listening on the port. All three TCP handshake packets are listed below.",
    packets: [
      {
        id: "p1",
        from: "attacker",
        to: "target",
        flag: "SYN",
        name: "Packet 1 · SYN (knock)",
        says: "Attacker asks Target: “Can we start a TCP connection on this port?”",
        flags: "SYN = on · ACK = off · RST = off",
        example: "Attacker:44444 → Target:80  Flags [S]  seq=1000",
        scanner: "waiting for a reply…",
      },
      {
        id: "p2",
        from: "target",
        to: "attacker",
        flag: "SYN+ACK",
        name: "Packet 2 · SYN+ACK (answer)",
        says: "Target’s OS answers in ONE packet: “Yes I’m listening (SYN) and I got your knock (ACK).”",
        flags: "SYN = on · ACK = on · RST = off  ← two flags, one packet",
        example: "Target:80 → Attacker:44444  Flags [S.]  seq=5000 ack=1001",
        scanner: "saw SYN+ACK → marks port OPEN",
      },
      {
        id: "p3",
        from: "attacker",
        to: "target",
        flag: "ACK",
        name: "Packet 3 · ACK (confirm)",
        says: "Attacker confirms: “Got your answer. Connection is ready.” Real data can follow after this.",
        flags: "SYN = off · ACK = on · RST = off",
        example: "Attacker:44444 → Target:80  Flags [.]  ack=5001",
        scanner: "handshake complete (SYN-scan may stop after packet 2)",
      },
    ],
    result: "All 3 packets done → connection established. Port looks OPEN.",
  },
  closed: {
    label: "② closed port (2 packets)",
    blurb: "Nothing is listening. The OS still replies — with RST (reset), not SYN+ACK.",
    packets: [
      {
        id: "c1",
        from: "attacker",
        to: "target",
        flag: "SYN",
        name: "Packet 1 · SYN (knock)",
        says: "Same knock as before — Attacker asks to connect.",
        flags: "SYN = on",
        example: "Attacker:44444 → Target:25  Flags [S]",
        scanner: "waiting…",
      },
      {
        id: "c2",
        from: "target",
        to: "attacker",
        flag: "RST",
        name: "Packet 2 · RST (reject)",
        says: "Target OS: “That port is closed. Stop.” No service will talk on this door.",
        flags: "RST = on",
        example: "Target:25 → Attacker:44444  Flags [R.]",
        scanner: "saw RST → marks port CLOSED",
      },
    ],
    result: "2 packets. Clear CLOSED — the OS answered “no.”",
  },
  drop: {
    label: "③ firewall DROP (1 packet + silence)",
    blurb: "Firewall throws the knock away. There is no second packet on the wire.",
    packets: [
      {
        id: "d1",
        from: "attacker",
        to: "target",
        flag: "SYN",
        name: "Packet 1 · SYN (knock)",
        says: "Attacker sends SYN. It reaches the VPS NIC, then hits an iptables DROP rule.",
        flags: "SYN = on",
        example: "Attacker:44444 → Target:22  Flags [S]",
        scanner: "waiting…",
      },
      {
        id: "d2",
        from: "target",
        to: "attacker",
        flag: "∅ none",
        name: "Packet 2 · does not exist",
        says: "DROP = trash. No SYN+ACK. No RST. Attacker hears silence (timeout).",
        flags: "no packet leaves Target",
        example: "(no reply captured on the wire)",
        scanner: "silence → usually marks port FILTERED",
      },
    ],
    result: "Only the knock existed. Silence ⇒ FILTERED.",
  },
  fake: {
    label: "④ try-harder fake open (3 packets)",
    blurb: "No real service — our script forges replies so the scan map lies.",
    packets: [
      {
        id: "f1",
        from: "attacker",
        to: "target",
        flag: "SYN",
        name: "Packet 1 · SYN (knock)",
        says: "Bot/Attacker knocks a port with no real app (example: :25 email).",
        flags: "SYN = on",
        example: "Bot → Target:25  Flags [S]",
        scanner: "waiting…",
      },
      {
        id: "f2",
        from: "target",
        to: "attacker",
        flag: "SYN+ACK",
        name: "Packet 2 · forged SYN+ACK",
        says: "Script crafts a fake Step‑2 answer. Looks identical to a real open port to the scanner.",
        flags: "SYN = on · ACK = on (forged by scapy)",
        example: "Target:25 → Bot  Flags [S.]  (script-made)",
        scanner: "saw SYN+ACK → marks OPEN (lie)",
      },
      {
        id: "f3",
        from: "target",
        to: "attacker",
        flag: "PSH+ACK",
        name: "Packet 3 · data “try harder”",
        says: "Script sends a TCP data packet whose payload bytes are the text try harder.",
        flags: "PSH = on · ACK = on · payload = try harder",
        example: "Target:25 → Bot  Flags [P.]  ASCII: try harder",
        scanner: "still thinks open; tcpdump -A can read the text",
      },
    ],
    result: "Fake open + message on the wire. Later: too many knocks → DROP that IP.",
  },
};

const flagColor: Record<string, string> = {
  SYN: "#ff8a3d",
  "SYN+ACK": "#3ddc84",
  ACK: "#6fa8b8",
  RST: "#c9a35a",
  "∅ none": "#c4545e",
  DROP: "#c4545e",
  "PSH+ACK": "#ff4fd8",
};

export const PacketPlayground = ({ title, hint }: { title: string; hint: string }) => {
  const [scenario, setScenario] = useState<Scenario>("handshake");
  const [focus, setFocus] = useState(0);
  const cfg = scenarios[scenario];

  return (
    <div
      className="rounded-xl border border-neon/30 bg-[#07090c] p-3"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
    >
      <p className="font-mono text-[10px] tracking-[0.16em] text-neon/70 uppercase">{title}</p>
      <p className="mt-1 text-[12px] leading-snug text-slate-300">{hint}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(Object.keys(scenarios) as Scenario[]).map(key => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setScenario(key);
              setFocus(0);
            }}
            className={`rounded-lg border px-2 py-1.5 text-left font-mono text-[10px] leading-tight ${
              scenario === key ? "border-neon/60 bg-neon/15 text-neon" : "border-white/15 text-slate-400 hover:border-neon/30"
            }`}
          >
            {scenarios[key].label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[12px] leading-snug text-slate-400">{cfg.blurb}</p>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Face who="attacker" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase" style={{ color: cast.attacker.color }}>
              Attacker
            </p>
            <p className="text-[10px] text-slate-500">client · sends knocks</p>
          </div>
        </div>
        <p className="font-mono text-[10px] text-slate-500">wire</p>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-mono text-[10px] font-bold uppercase" style={{ color: cast.target.color }}>
              Target
            </p>
            <p className="text-[10px] text-slate-500">server · VPS</p>
          </div>
          <Face who="target" />
        </div>
      </div>

      <ol className="mt-3 space-y-2">
        {cfg.packets.map((pkt, i) => {
          const active = i === focus;
          const color = flagColor[pkt.flag] ?? "#94a3b8";
          const goingRight = pkt.from === "attacker";
          return (
            <li key={pkt.id}>
              <button
                type="button"
                onClick={() => setFocus(i)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left ${active ? "ring-1 ring-neon/40" : ""}`}
                style={{ borderColor: active ? color : `${color}44`, backgroundColor: active ? `${color}18` : "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold text-black"
                    style={{ backgroundColor: color }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[12px] font-bold" style={{ color }}>
                        {pkt.name}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold"
                        style={{ borderColor: color, color, backgroundColor: `${color}22` }}
                      >
                        {goingRight ? "Attacker → Target" : "Target → Attacker"}
                        <span className="opacity-80">· {pkt.flag}</span>
                      </span>
                    </div>

                    <p className="mt-1.5 text-[12.5px] leading-snug text-slate-100">{pkt.says}</p>

                    <div className="mt-2 grid gap-1.5 text-[11px] leading-snug sm:grid-cols-2">
                      <p className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-slate-300">
                        <span className="font-mono text-[9px] tracking-wide text-slate-500 uppercase">flags · </span>
                        {pkt.flags}
                      </p>
                      <p className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-slate-300">
                        <span className="font-mono text-[9px] tracking-wide text-slate-500 uppercase">scanner · </span>
                        {pkt.scanner}
                      </p>
                    </div>

                    <pre className="mt-1.5 overflow-x-auto rounded-lg border border-white/10 bg-black/60 px-2 py-1.5 font-mono text-[10px] leading-snug text-slate-400">
                      {pkt.example}
                    </pre>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="mt-2 rounded-lg border border-neon/25 bg-neon/10 px-2.5 py-2 text-[12px] leading-snug text-neon">
        ✓ {cfg.result}
      </p>
      <p className="mt-1 text-center font-mono text-[9px] text-slate-500">tap a packet card to highlight it</p>
    </div>
  );
};
