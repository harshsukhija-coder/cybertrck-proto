import { vivid } from "../palette";
import { Appear, Frame, TravelDot } from "./shared";

type DoorState = "open" | "closed" | "filtered";

const stateColors: Record<DoorState, string> = { open: vivid.green, closed: "#94a3b8", filtered: vivid.purple };

const Door = ({ state }: { state: DoorState }) => {
  const color = stateColors[state];
  return (
    <svg viewBox="0 0 32 44" className="h-11 w-8">
      {state === "open" && (
        <>
          <rect x="3" y="3" width="26" height="38" fill={vivid.yellow} opacity="0.35" />
          <polygon points="3,3 14,7 14,40 3,41" fill={color} opacity="0.75" />
        </>
      )}
      {state === "closed" && (
        <>
          <rect x="3" y="3" width="26" height="38" fill={color} opacity="0.35" />
          <circle cx="23" cy="23" r="1.6" fill={color} />
        </>
      )}
      {state === "filtered" &&
        [9, 17, 25, 33].map((y, i) => (
          <g key={y} stroke={color} strokeOpacity="0.6">
            <line x1="3" y1={y} x2="29" y2={y} />
            <line x1={i % 2 ? 11 : 17} y1={y - 8} x2={i % 2 ? 11 : 17} y2={y} />
          </g>
        ))}
      <rect x="2" y="2" width="28" height="40" fill="none" stroke={color} strokeWidth="2" rx="1" />
    </svg>
  );
};

export const PortDoors = () => {
  const ports: { port: number; service: string; state: DoorState; color?: string }[] = [
    { port: 21, service: "ftp", state: "filtered" },
    { port: 22, service: "ssh", state: "filtered" },
    { port: 80, service: "http", state: "open", color: vivid.pink },
    { port: 135, service: "msrpc", state: "open", color: vivid.yellow },
    { port: 139, service: "netbios", state: "open", color: vivid.yellow },
    { port: 443, service: "https", state: "filtered" },
    { port: 445, service: "smb", state: "open", color: vivid.yellow },
    { port: 3306, service: "mysql", state: "open", color: vivid.red },
    { port: 3389, service: "rdp", state: "open", color: vivid.orange },
    { port: 5900, service: "vnc", state: "filtered" },
    { port: 8080, service: "http-alt", state: "filtered" },
    { port: 9999, service: "...994 more", state: "filtered" },
  ];
  return (
    <Frame title="DESKTOP-X7Q · 192.168.1.30 · its doors">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {ports.map(({ port, service, state, color }) => (
          <div
            key={port}
            className="flex flex-col items-center rounded border py-1.5"
            style={{
              borderColor: `${stateColors[state]}${state === "open" ? "88" : "33"}`,
              backgroundColor: `${stateColors[state]}${state === "open" ? "14" : "08"}`,
              boxShadow: state === "open" ? `0 0 10px ${vivid.green}33` : undefined,
            }}
          >
            <Door state={state} />
            <span className="mt-1 text-xs font-bold" style={{ color: color ?? stateColors[state] }}>
              {port === 9999 ? "..." : port}
            </span>
            <span className="text-[9.5px] text-slate-400">{service}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-[10.5px]">
        {(Object.keys(stateColors) as DoorState[]).map(state => (
          <div key={state} className="flex items-center gap-1.5">
            <Door state={state} />
            <div>
              <p className="font-bold" style={{ color: stateColors[state] }}>{state}</p>
              <p className="text-slate-500">
                {state === "open" && "someone answers"}
                {state === "closed" && "'nobody here' reply"}
                {state === "filtered" && "firewall: no reply at all"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

const Arrow = ({ x1, x2, y, color, label }: { x1: number; x2: number; y: number; color: string; label: string }) => {
  const dir = x2 > x1 ? 1 : -1;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2 - dir * 6} y2={y} stroke={color} strokeWidth={2} />
      <polygon points={`${x2},${y} ${x2 - dir * 9},${y - 5} ${x2 - dir * 9},${y + 5}`} fill={color} />
      <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" fill={color} fontSize={11} fontWeight={700}>{label}</text>
    </g>
  );
};

type Step = { label: string; color: string; toTarget: boolean };

const HandshakePanel = ({ x, title, titleColor, steps, result, log, logColor }: {
  x: number;
  title: string;
  titleColor: string;
  steps: Step[];
  result: string;
  log: string;
  logColor: string;
}) => {
  const left = x + 50;
  const right = x + 250;
  const dur = 7;
  const timeOf = (i: number) => 0.06 + i * 0.13;
  const resultAt = timeOf(steps.length);
  return (
    <g>
      <text x={x + 150} y={22} textAnchor="middle" fill={titleColor} fontSize={13} fontWeight={800}>{title}</text>
      <text x={left} y={46} textAnchor="middle" fill={vivid.cyan} fontSize={10.5} fontWeight={700}>nmap</text>
      <text x={right} y={46} textAnchor="middle" fill={vivid.red} fontSize={10.5} fontWeight={700}>X7Q :80</text>
      <line x1={left} y1={54} x2={left} y2={y0(steps.length)} stroke="#475569" strokeDasharray="3 4" />
      <line x1={right} y1={54} x2={right} y2={y0(steps.length)} stroke="#475569" strokeDasharray="3 4" />
      {steps.map((step, i) => {
        const y = y0(i);
        const [from, to] = step.toTarget ? [left, right] : [right, left];
        return (
          <g key={step.label}>
            <Appear start={timeOf(i) + 0.1} end={0.97} dur={dur}>
              <Arrow x1={from} x2={to} y={y} color={step.color} label={step.label} />
            </Appear>
            <TravelDot path={`M${from},${y} L${to},${y}`} start={timeOf(i)} end={timeOf(i) + 0.1} color={step.color} dur={dur} />
          </g>
        );
      })}
      <Appear start={resultAt} end={0.97} dur={dur}>
        <text x={x + 150} y={y0(steps.length) + 22} textAnchor="middle" fill="#e2e8f0" fontSize={11} fontWeight={700}>{result}</text>
        <text x={x + 150} y={y0(steps.length) + 38} textAnchor="middle" fill={logColor} fontSize={10.5}>{log}</text>
      </Appear>
    </g>
  );
};

const y0 = (i: number) => 80 + i * 36;

export const Handshake = () => (
  <Frame title="-sS vs -sT · the tcp handshake">
    <svg viewBox="0 0 640 290" className="w-full">
      <HandshakePanel
        x={10}
        title="-sS · SYN scan"
        titleColor={vivid.pink}
        steps={[
          { label: "SYN  'hi?'", color: vivid.cyan, toTarget: true },
          { label: "SYN/ACK  'come in!'", color: vivid.yellow, toTarget: false },
          { label: "RST  'nvm, bye'", color: vivid.red, toTarget: true },
        ]}
        result="half-open: never finished"
        log="apache log: (nothing)"
        logColor={vivid.green}
      />
      <line x1={320} y1={10} x2={320} y2={280} stroke="#3ddc84" strokeOpacity={0.15} />
      <HandshakePanel
        x={330}
        title="-sT · connect scan"
        titleColor={vivid.orange}
        steps={[
          { label: "SYN  'hi?'", color: vivid.cyan, toTarget: true },
          { label: "SYN/ACK  'come in!'", color: vivid.yellow, toTarget: false },
          { label: "ACK  'thanks, i'm in'", color: vivid.green, toTarget: true },
          { label: "RST  'bye'", color: vivid.red, toTarget: true },
        ]}
        result="full connection made"
        log="apache log: 192.168.1.10 ... 408  <- caught!"
        logColor={vivid.red}
      />
    </svg>
  </Frame>
);

// Cells of 512 ports each that contain at least one of nmap's top 1000 ports
const DEFAULT_PORT_SAMPLES = [
  1, 600, 1100, 1500, 1720, 2049, 2500, 3000, 3306, 3389, 3986, 4899, 5000, 5432, 5800, 5900, 6000, 6646, 7070, 8000, 8080,
  8443, 8888, 9100, 9999, 10000, 13456, 15000, 16080, 20000, 27000, 32768, 49152, 50000, 50300, 55055, 55600, 65000,
];
const CELL = 512;
const CELL_COUNT = 128;
const defaultCells = new Set(DEFAULT_PORT_SAMPLES.map(port => Math.floor(port / CELL)));

export const PortCoverage = () => {
  const marker = (port: number) => `${(port / 65535) * 100}%`;
  return (
    <Frame title="65,535 doors · what each scan checks">
      <div className="relative mt-9 mb-6">
        <div className="absolute -top-9 left-0 text-[10.5px] font-bold" style={{ color: vivid.green }}>
          80 · 135 · 139 · 445 · 3306 · 3389
          <div className="font-normal text-slate-500">found by the default scan</div>
        </div>
        {[33060, 49664].map(port => (
          <div key={port} className="absolute -top-9 -translate-x-1/2 text-center text-[10.5px] font-bold" style={{ left: marker(port), color: vivid.yellow }}>
            {port === 33060 ? "33060" : "4966x"}
            <div className="font-normal text-slate-500">only -p-</div>
          </div>
        ))}
        <div className="flex h-7 gap-px overflow-hidden rounded">
          {Array.from({ length: CELL_COUNT }, (_, i) => (
            <div key={i} className="flex-1" style={{ backgroundColor: defaultCells.has(i) ? `${vivid.cyan}aa` : "#1e293b" }} />
          ))}
        </div>
        {[80, 33060, 49664].map(port => (
          <div
            key={port}
            className="absolute top-0 h-7 w-[3px] -translate-x-1/2"
            style={{ left: marker(port), backgroundColor: port === 80 ? vivid.green : vivid.yellow, boxShadow: `0 0 6px ${port === 80 ? vivid.green : vivid.yellow}` }}
          />
        ))}
        <div className="absolute -bottom-5 flex w-full justify-between text-[9.5px] text-slate-500">
          <span>1</span>
          <span>16384</span>
          <span>32768</span>
          <span>49152</span>
          <span>65535</span>
        </div>
      </div>
      <div className="space-y-1.5 text-[11px]">
        {[
          { label: "default scan", detail: "top 1,000 ports · 1.5%", time: "4.9 s", width: "4%", color: vivid.cyan },
          { label: "-p-", detail: "all 65,535 ports · 100%", time: "118 s", width: "100%", color: vivid.yellow },
        ].map(row => (
          <div key={row.label} className="grid grid-cols-[5.5rem_1fr_3rem] items-center gap-2">
            <span className="font-bold" style={{ color: row.color }}>{row.label}</span>
            <div className="h-2 rounded bg-slate-800">
              <div className="h-2 rounded" style={{ width: row.width, backgroundColor: row.color }} />
            </div>
            <span className="text-right text-slate-400">{row.time}</span>
          </div>
        ))}
        <p className="text-slate-500"><span style={{ color: vivid.cyan }}>blue cells</span> = where the default 1000 ports live. most of them are low numbers.</p>
      </div>
    </Frame>
  );
};

export const OsFingerprint = () => {
  const columns = [
    {
      title: "1 · nmap sends weird probes",
      color: vivid.cyan,
      items: ["SYN with odd options", "packet to a closed port", "FIN+PSH+URG to an open port", "UDP to a closed port", "strange ICMP echo"],
    },
    {
      title: "2 · replies have quirks",
      color: vivid.yellow,
      items: ["TTL = 128", "window = 65535", "don't fragment: yes", "IP ID: goes up by 1", "options: MSS,NOP,WS,SACK"],
    },
  ];
  return (
    <Frame title="os fingerprinting · -O">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
        {columns.map(column => (
          <div key={column.title} className="contents">
            <div className="rounded border p-2" style={{ borderColor: `${column.color}44`, backgroundColor: `${column.color}0d` }}>
              <p className="mb-1 text-[10.5px] font-bold" style={{ color: column.color }}>{column.title}</p>
              <ul className="space-y-0.5 text-[10.5px] text-slate-300">
                {column.items.map(item => <li key={item}>· {item}</li>)}
              </ul>
            </div>
            <span className="text-lg text-slate-500">→</span>
          </div>
        ))}
        <div className="flex flex-col items-center rounded border p-2 text-center" style={{ borderColor: `${vivid.purple}66`, backgroundColor: `${vivid.purple}12` }}>
          <p className="mb-1 text-[10.5px] font-bold" style={{ color: vivid.purple }}>3 · match in nmap-os-db</p>
          <svg viewBox="0 0 60 70" className="h-16 w-14">
            <g fill="none" stroke={vivid.purple} strokeWidth="2" strokeLinecap="round">
              <path d="M30 8a22 22 0 0 0-22 22v8" />
              <path d="M30 8a22 22 0 0 1 22 22v14" />
              <path d="M30 16a14 14 0 0 0-14 14v14a14 14 0 0 0 4 10" />
              <path d="M30 16a14 14 0 0 1 14 14v16" />
              <path d="M30 24a6 6 0 0 0-6 6v14a20 20 0 0 0 6 16" />
              <path d="M30 24a6 6 0 0 1 6 6v20a10 10 0 0 0 4 8" />
              <path d="M30 32v20" />
            </g>
            <rect x="2" width="56" height="3" fill={vivid.green} opacity="0.8">
              <animate attributeName="y" values="4;62;4" dur="2.4s" repeatCount="indefinite" />
            </rect>
          </svg>
          <p className="mt-1 text-xs font-bold" style={{ color: vivid.purple }}>Windows 10</p>
          <p className="text-[9.5px] text-slate-500">thousands of fingerprints compared</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10.5px]">
        {[
          { ttl: "64", os: "linux · macos · android", color: vivid.green },
          { ttl: "128", os: "windows", color: vivid.cyan },
          { ttl: "255", os: "routers · printers", color: vivid.orange },
        ].map(row => (
          <div key={row.ttl} className="rounded border border-neon/10 px-2 py-1">
            <span className="font-bold" style={{ color: row.color }}>TTL {row.ttl}</span>
            <span className="text-slate-400"> → {row.os}</span>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-500">the simplest quirk: the starting TTL. DESKTOP-X7Q answered with 128, a first hint that it's windows.</p>
    </Frame>
  );
};

export const ReconPipeline = () => {
  const steps = [
    { n: 1, title: "who's alive", flag: "-sn", found: "6 hosts", color: vivid.cyan },
    { n: 2, title: "open doors", flag: "-sS / -p-", found: "11 ports on .30", color: vivid.green },
    { n: 3, title: "who answers", flag: "-sV", found: "apache, mysql 5.7", color: vivid.orange },
    { n: 4, title: "what os", flag: "-O", found: "windows 10", color: vivid.purple },
    { n: 5, title: "full picture", flag: "-A -oN", found: "scripts + report", color: vivid.red },
  ];
  return (
    <Frame title="recon pipeline · no breaking, just looking">
      <div className="grid grid-cols-5 gap-1.5">
        {steps.map(step => (
          <div key={step.n} className="relative rounded border p-2 text-center" style={{ borderColor: `${step.color}66`, backgroundColor: `${step.color}10` }}>
            <span className="text-[10px] text-slate-500">step {step.n}</span>
            <p className="text-[11.5px] font-bold" style={{ color: step.color }}>{step.title}</p>
            <p className="mt-0.5 rounded bg-black/40 text-[11px] font-semibold text-slate-100">{step.flag}</p>
            <p className="mt-1 text-[10px] text-slate-400">{step.found}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5 text-center text-[10.5px]">
        <div className="col-span-2 col-start-3 rounded-b border-x-2 border-b-2 pb-1" style={{ borderColor: vivid.red, color: vivid.red }}>
          -A does steps 3 + 4 + scripts + traceroute in one shot
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-bold" style={{ color: vivid.green }}>
        0 passwords guessed · 0 systems broken · a complete map of the office
      </p>
    </Frame>
  );
};
