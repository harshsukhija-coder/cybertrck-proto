import { vivid } from "../palette";
import { Appear, Frame, SvgNode, TravelDot } from "./shared";

const GRID = (
  <defs>
    <pattern id="fw-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#3ddc84" strokeOpacity="0.06" />
    </pattern>
  </defs>
);

export const FirewallBorder = () => {
  const dur = 7;
  return (
    <Frame title="firewall · the border">
      <svg viewBox="0 0 640 240" className="w-full">
        {GRID}
        <rect width="640" height="240" fill="url(#fw-grid)" />
        <SvgNode x={90} y={120} kind="laptop" color={vivid.cyan} label="private net" sub="your devices" r={24} />
        <rect x="250" y="55" width="140" height="130" rx="10" fill={`${vivid.green}14`} stroke={vivid.green} strokeWidth={2} />
        <text x={320} y={95} textAnchor="middle" fill={vivid.green} fontSize={13} fontWeight={700}>
          FIREWALL
        </text>
        <text x={320} y={115} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          allow / deny
        </text>
        <text x={320} y={135} textAnchor="middle" fill={vivid.yellow} fontSize={10}>
          rules list
        </text>
        <SvgNode x={530} y={120} kind="cloud" color={vivid.purple} label="internet" sub="unknown traffic" r={24} />

        <TravelDot path="M520,105 C460,80 420,80 390,90" start={0.05} end={0.35} color={vivid.red} dur={dur} />
        <Appear start={0.2} end={0.55} dur={dur}>
          <text x={450} y={70} textAnchor="middle" fill={vivid.red} fontSize={10} fontWeight={700}>
            blocked scan
          </text>
        </Appear>
        <TravelDot path="M114,120 L250,120" start={0.35} end={0.55} color={vivid.cyan} dur={dur} />
        <TravelDot path="M390,130 C450,150 480,140 510,130" start={0.55} end={0.85} color={vivid.green} dur={dur} />
        <Appear start={0.6} end={0.95} dur={dur}>
          <text x={450} y={175} textAnchor="middle" fill={vivid.green} fontSize={10} fontWeight={700}>
            allowed reply
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const FirewallPorts = () => (
  <Frame title="ports · numbered doors">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        { port: "80 / 443", label: "web", tone: vivid.green, open: true },
        { port: "25", label: "email", tone: vivid.cyan, open: true },
        { port: "22", label: "remote access (ssh)", tone: vivid.yellow, open: true },
        { port: "23", label: "telnet · insecure", tone: vivid.red, open: false },
      ].map(item => (
        <div
          key={item.port}
          className="rounded-md border px-3 py-2"
          style={{ borderColor: `${item.tone}55`, background: `${item.tone}12` }}
        >
          <p className="text-xs font-bold" style={{ color: item.tone }}>
            port {item.port}
          </p>
          <p className="text-[11px] text-slate-300">{item.label}</p>
          <p className="mt-1 text-[10px] tracking-wide uppercase" style={{ color: item.open ? vivid.green : vivid.red }}>
            {item.open ? "often needed" : "keep closed"}
          </p>
        </div>
      ))}
    </div>
    <p className="mt-2 text-center text-[11px] text-slate-400">same device · different doors · different decisions</p>
  </Frame>
);

export const FirewallRules = () => (
  <Frame title="rules · top to bottom · first match wins">
    <div className="space-y-1.5 font-mono text-[11px]">
      {[
        { n: 1, text: "ALLOW  tcp  any → 443  (https)", color: vivid.green },
        { n: 2, text: "ALLOW  tcp  any → 22   (ssh, admin only)", color: vivid.yellow },
        { n: 3, text: "DENY   tcp  any → 23   (telnet)", color: vivid.red },
        { n: 4, text: "DENY   ALL  …             ← final rule", color: vivid.pink },
      ].map(rule => (
        <div key={rule.n} className="flex items-center gap-2 rounded border border-neon/15 bg-black/40 px-2 py-1.5">
          <span className="w-5 text-neon/50">{rule.n}</span>
          <span style={{ color: rule.color }}>{rule.text}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-center text-[11px] text-slate-400">
      no match? → hit <span className="text-pink">deny all</span>. start closed. open only what you need.
    </p>
  </Frame>
);

export const FirewallTypes = () => (
  <Frame title="three generations of firewalls">
    <div className="grid gap-2 md:grid-cols-3">
      <div className="rounded-md border border-orange/30 bg-orange/5 p-2.5">
        <p className="text-xs font-bold text-orange">packet filter</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-300">looks at each packet alone: address, port, protocol. no memory of conversations.</p>
      </div>
      <div className="rounded-md border border-cyan/30 bg-cyan/5 p-2.5">
        <p className="text-xs font-bold text-cyan">stateful</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-300">tracks connections. replies to your requests get in. random “replies” get blocked.</p>
      </div>
      <div className="rounded-md border border-neon/30 bg-neon/5 p-2.5">
        <p className="text-xs font-bold text-neon">next-gen (NGFW)</p>
        <p className="mt-1 text-[11px] leading-4 text-slate-300">inspects content + apps. can catch malware hiding on an allowed port like 443.</p>
      </div>
    </div>
  </Frame>
);

export const FirewallLimits = () => (
  <Frame title="what a firewall can't fix alone">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        { title: "tricked users", text: "phishing / fake sites look like normal allowed traffic.", color: vivid.red },
        { title: "encrypted payloads", text: "without extra setup, deep inspection can't see inside TLS.", color: vivid.orange },
        { title: "already inside", text: "infected device or insider may never cross the border.", color: vivid.yellow },
        { title: "bad rules", text: "one careless open port can undo the whole shield.", color: vivid.pink },
      ].map(item => (
        <div key={item.title} className="rounded-md border px-3 py-2" style={{ borderColor: `${item.color}44`, background: `${item.color}10` }}>
          <p className="text-xs font-bold" style={{ color: item.color }}>
            {item.title}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-300">{item.text}</p>
        </div>
      ))}
    </div>
  </Frame>
);

export const FirewallRecap = () => (
  <Frame title="firewall · one strong layer">
    <ul className="space-y-1.5 text-[12px] text-slate-300">
      <li>
        <span className="text-neon">•</span> barrier between networks · allow / deny by rules
      </li>
      <li>
        <span className="text-cyan">•</span> decisions use addresses, ports, protocols (+ content on NGFW)
      </li>
      <li>
        <span className="text-yellow">•</span> safest default: deny all, then open only what’s needed
      </li>
      <li>
        <span className="text-pink">•</span> packet filter → stateful → next-gen
      </li>
      <li>
        <span className="text-orange">•</span> not enough alone — pair with auth, updates, and informed users
      </li>
    </ul>
  </Frame>
);
