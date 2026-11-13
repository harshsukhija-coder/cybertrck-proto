import { vivid } from "../palette";
import { Appear, FlowLink, Frame, SvgNode, TravelDot } from "./shared";

const GRID = (
  <defs>
    <pattern id="visual-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#3ddc84" strokeOpacity="0.06" />
    </pattern>
  </defs>
);

export const OfficeNetwork = () => {
  const router = { x: 320, y: 150 };
  const link = (x: number, y: number) => `M${router.x},${router.y} L${x},${y}`;
  return (
    <Frame title="chaibyte office · 192.168.1.0/24">
      <svg viewBox="0 0 640 335" className="w-full">
        {GRID}
        <rect width="640" height="335" fill="url(#visual-grid)" />
        <FlowLink d={`M320,52 L${router.x},${router.y}`} color="#cbd5e1" offset={0.3} />
        <FlowLink d={link(100, 75)} color={vivid.cyan} dashed offset={0.2} />
        <FlowLink d={link(100, 240)} color={vivid.blue} offset={1.1} />
        <FlowLink d={link(540, 75)} color={vivid.orange} offset={0.7} />
        <FlowLink d={link(540, 240)} color={vivid.purple} offset={1.6} />
        <path d="M320,212 L320,248" stroke={vivid.red} strokeWidth={2} strokeDasharray="3 6" fill="none" />

        <SvgNode x={320} y={34} kind="cloud" color="#cbd5e1" label="" r={18} />
        <text x={352} y={38} fill="#cbd5e1" fontSize={11}>internet</text>
        <SvgNode x={router.x} y={router.y} kind="router" color={vivid.yellow} label="netgear router" sub="every message passes here" r={28} />
        <SvgNode x={100} y={75} kind="laptop" color={vivid.cyan} label="laptops x2" sub="friday + boss (wifi)" />
        <SvgNode x={100} y={240} kind="printer" color={vivid.blue} label="hp printer" sub="prints. sometimes." />
        <SvgNode x={540} y={75} kind="server" color={vivid.orange} label="web server" sub="website + mysql database" />
        <SvgNode x={540} y={240} kind="nas" color={vivid.purple} label="synology nas" sub="shared files + backups" />

        <g>
          <circle cx={320} cy={270} r={22} fill="none" stroke={vivid.red} strokeWidth={1.5}>
            <animate attributeName="r" values="22;34;22" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.9;0;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={320} cy={270} r={22} fill={`${vivid.red}22`} stroke={vivid.red} strokeDasharray="4 3" strokeWidth={1.5} />
          <text x={320} y={278} textAnchor="middle" fill={vivid.red} fontSize={22} fontWeight={800}>?</text>
          <text x={320} y={307} textAnchor="middle" fill={vivid.red} fontSize={11.5} fontWeight={700}>DESKTOP-X7Q</text>
          <text x={320} y={320} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>nobody knows what this is</text>
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-slate-400">
        <span><span style={{ color: vivid.yellow }}>●</span> router = the post office</span>
        <span><span style={{ color: vivid.cyan }}>- -</span> wifi</span>
        <span><span style={{ color: vivid.blue }}>—</span> cable</span>
        <span><span style={{ color: vivid.red }}>?</span> unknown device</span>
        <span>moving dots = packets</span>
      </div>
    </Frame>
  );
};

export const PacketJourney = () => {
  const path = "M80,95 L320,95 L560,95";
  const packets = [0.05, 0.2, 0.35];
  return (
    <Frame title="packet journey · laptop -> router -> printer">
      <svg viewBox="0 0 640 190" className="w-full">
        {GRID}
        <rect width="640" height="190" fill="url(#visual-grid)" />
        <path d={path} stroke="#475569" strokeWidth={2} strokeDasharray="4 4" fill="none" />
        <SvgNode x={80} y={95} kind="laptop" color={vivid.cyan} label="friday's laptop" sub="192.168.1.10" />
        <SvgNode x={320} y={95} kind="router" color={vivid.yellow} label="router" sub="reads the label" r={26} />
        <SvgNode x={560} y={95} kind="printer" color={vivid.blue} label="printer" sub="192.168.1.20 :9100" />
        {packets.map((start, i) => (
          <g key={start}>
            <TravelDot path={path} start={start} end={start + 0.5} color={vivid.pink} r={6} dur={6} />
            <Appear start={start + 0.5} end={0.98} dur={6}>
              <rect x={586 + i * 16} y={40} width={13} height={10} rx={2} fill={vivid.pink} opacity={0.85} />
            </Appear>
          </g>
        ))}
        <Appear start={0.88} end={0.99} dur={6}>
          <text x={600} y={30} textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>3/3 received ✓</text>
        </Appear>
        <text x={80} y={30} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>"page 1" -&gt; 3 packets</text>
      </svg>
      <div className="mt-2 grid grid-cols-4 overflow-hidden rounded border border-neon/15 text-center text-[11px]">
        {[
          { label: "from", value: "192.168.1.10", color: vivid.pink },
          { label: "to", value: "192.168.1.20", color: vivid.yellow },
          { label: "port", value: "9100 (printing)", color: vivid.orange },
          { label: "data", value: "piece 1 of 3", color: vivid.green },
        ].map(field => (
          <div key={field.label} className="border-r border-neon/10 px-2 py-1.5 last:border-r-0" style={{ backgroundColor: `${field.color}12` }}>
            <div className="text-[9.5px] tracking-widest text-slate-500 uppercase">{field.label}</div>
            <div className="font-semibold" style={{ color: field.color }}>{field.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-[10.5px] text-slate-500">^ the label (header) on every packet. the router only reads the label, never the data.</p>
    </Frame>
  );
};

export const Broadcast = () => {
  const hub = { x: 255, y: 140 };
  const targets = [
    { x: 480, y: 38, kind: "printer" as const, color: vivid.blue, label: "printer .20", replies: true },
    { x: 480, y: 105, kind: "nas" as const, color: vivid.purple, label: "nas .40", replies: true },
    { x: 480, y: 172, kind: "server" as const, color: vivid.red, label: "DESKTOP-X7Q .30", replies: false },
    { x: 480, y: 239, kind: "laptop" as const, color: vivid.orange, label: "boss .50", replies: false },
  ];
  const dur = 6;
  return (
    <Frame title="broadcast · one packet to 192.168.1.255 reaches everyone">
      <svg viewBox="0 0 640 285" className="w-full">
        {GRID}
        <rect width="640" height="285" fill="url(#visual-grid)" />
        <path d={`M75,${hub.y} L${hub.x},${hub.y}`} stroke="#475569" strokeWidth={2} fill="none" />
        {targets.map(t => (
          <path key={t.label} d={`M${hub.x},${hub.y} L${t.x - 24},${t.y}`} stroke="#475569" strokeWidth={1.5} fill="none" />
        ))}

        <SvgNode x={75} y={hub.y} kind="laptop" color={vivid.cyan} label="friday" sub="ping .255" />
        <SvgNode x={hub.x} y={hub.y} kind="router" color={vivid.yellow} label="router .1" sub="copies it to everyone" r={26} />
        {targets.map(t => (
          <SvgNode key={t.label} x={t.x} y={t.y} kind={t.kind} color={t.color} label="" r={18} />
        ))}
        {targets.map(t => (
          <text key={t.label} x={t.x + 26} y={t.y + 4} fill={t.color} fontSize={11} fontWeight={700}>{t.label}</text>
        ))}

        <TravelDot path={`M75,${hub.y} L${hub.x},${hub.y}`} start={0.02} end={0.18} color={vivid.orange} r={6} dur={dur} />
        <Appear start={0.02} end={0.18} dur={dur}>
          <text x={160} y={hub.y - 14} textAnchor="middle" fill={vivid.orange} fontSize={11} fontWeight={700}>to: 192.168.1.255</text>
        </Appear>
        <Appear start={0.18} end={0.32} dur={dur}>
          <circle cx={hub.x} cy={hub.y} r={30} fill="none" stroke={vivid.orange} strokeWidth={2}>
            <animate attributeName="r" values="28;70" dur="0.8s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="1;0" dur="0.8s" repeatCount="indefinite" />
          </circle>
        </Appear>
        {targets.map(t => (
          <TravelDot key={t.label} path={`M${hub.x},${hub.y} L${t.x - 20},${t.y}`} start={0.2} end={0.38} color={vivid.orange} dur={dur} />
        ))}
        {targets.map(t => (
          <Appear key={t.label} start={0.4} end={0.95} dur={dur}>
            <text x={t.x - 30} y={t.y - 20} textAnchor="end" fill={t.replies ? vivid.green : "#64748b"} fontSize={11} fontWeight={700}>
              {t.replies ? "✓ reply!" : "✗ ignored"}
            </text>
          </Appear>
        ))}
        {targets.filter(t => t.replies).map(t => (
          <TravelDot key={t.label} path={`M${t.x - 20},${t.y} L${hub.x},${hub.y} L75,${hub.y}`} start={0.45} end={0.75} color={vivid.green} dur={dur} />
        ))}
        <Appear start={0.4} end={0.95} dur={dur}>
          <text x={hub.x} y={hub.y - 36} textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>✓ reply!</text>
        </Appear>
        <Appear start={0.76} end={0.98} dur={dur}>
          <text x={75} y={hub.y + 62} textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>3 replies (DUP!)</text>
        </Appear>
      </svg>
      <p className="text-[10.5px] text-slate-500">
        <span style={{ color: vivid.orange }}>orange</span> = the shout, copied to every device ·{" "}
        <span style={{ color: vivid.green }}>green</span> = replies · modern windows / macos stay silent on purpose
      </p>
    </Frame>
  );
};

export const NetworkDiagram = () => (
  <Frame title="topology · how chaibyte is probably wired">
    <svg viewBox="0 0 640 375" className="w-full">
      {GRID}
      <rect width="640" height="375" fill="url(#visual-grid)" />
      <FlowLink d="M320,52 L320,128" color="#cbd5e1" offset={0.4} />
      <FlowLink d="M292,138 L122,138" color={vivid.cyan} dashed offset={0.9} />
      <FlowLink d="M348,138 L518,138" color={vivid.orange} dashed offset={1.7} />
      <FlowLink d="M320,166 L320,214" color={vivid.yellow} offset={0.2} />
      <FlowLink d="M300,226 L130,300" color={vivid.blue} offset={1.2} />
      <FlowLink d="M320,238 L320,300" color={vivid.red} offset={0.6} />
      <FlowLink d="M340,226 L510,300" color={vivid.purple} offset={2} />

      <SvgNode x={320} y={34} kind="cloud" color="#cbd5e1" label="" r={18} />
      <text x={350} y={30} fill="#cbd5e1" fontSize={11} fontWeight={700}>internet</text>
      <text x={350} y={44} fill="#94a3b8" fontSize={9.5}>public ip 49.36.112.84</text>
      <SvgNode x={320} y={138} kind="router" color={vivid.yellow} label="" r={28} />
      <text x={334} y={180} fill={vivid.yellow} fontSize={11.5} fontWeight={700}>netgear router · 192.168.1.1</text>
      <text x={334} y={193} fill="#94a3b8" fontSize={9.5}>gateway · NAT · DHCP · wifi</text>
      <SvgNode x={100} y={138} kind="laptop" color={vivid.cyan} label="fridays-macbook" sub="192.168.1.10" />
      <SvgNode x={540} y={138} kind="laptop" color={vivid.orange} label="BOSS-LAPTOP" sub="192.168.1.50" />
      <SvgNode x={320} y={226} kind="switch" color="#cbd5e1" label="" r={14} />
      <text x={344} y={230} fill="#94a3b8" fontSize={9.5}>lan ports (switch)</text>
      <SvgNode x={110} y={310} kind="printer" color={vivid.blue} label="HPDA41C2" sub="192.168.1.20" />
      <SvgNode x={320} y={310} kind="server" color={vivid.red} label="DESKTOP-X7Q" sub="192.168.1.30 · 'web server'" />
      <SvgNode x={530} y={310} kind="nas" color={vivid.purple} label="chaibyte-nas" sub="192.168.1.40" />
    </svg>
    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] text-slate-400">
      <span>— cable</span>
      <span>- - wifi</span>
      <span>everything sits on <span style={{ color: vivid.cyan }}>one flat network</span>: every device can talk to every other device</span>
    </div>
  </Frame>
);
