import { vivid } from "../palette";
import { Appear, Frame, SvgNode, TravelDot } from "./shared";

const GRID = (
  <defs>
    <pattern id="vpn-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#3ddc84" strokeOpacity="0.06" />
    </pattern>
  </defs>
);

export const TrafficLeaks = () => {
  const dur = 8;
  return (
    <Frame title="without a vpn · two leaks">
      <svg viewBox="0 0 640 250" className="w-full">
        {GRID}
        <rect width="640" height="250" fill="url(#vpn-grid)" />
        <SvgNode x={70} y={120} kind="laptop" color={vivid.cyan} label="you" sub="real IP" r={24} />
        <SvgNode x={230} y={70} kind="router" color={vivid.orange} label="cafe wifi" sub="local network" r={22} />
        <SvgNode x={230} y={175} kind="server" color={vivid.yellow} label="ISP" sub="middle of everything" r={22} />
        <SvgNode x={420} y={120} kind="cloud" color={vivid.purple} label="internet" r={22} />
        <SvgNode x={560} y={120} kind="server" color={vivid.pink} label="website" sub="sees your IP" r={24} />

        <TravelDot path="M95,110 C150,70 180,70 208,70" start={0.05} end={0.28} color={vivid.orange} dur={dur} />
        <TravelDot path="M95,135 C150,175 180,175 208,175" start={0.12} end={0.35} color={vivid.yellow} dur={dur} />
        <TravelDot path="M252,80 C320,100 360,110 398,115" start={0.3} end={0.55} color={vivid.purple} dur={dur} />
        <TravelDot path="M252,170 C320,145 360,130 398,125" start={0.35} end={0.6} color={vivid.purple} dur={dur} />
        <TravelDot path="M442,120 L536,120" start={0.58} end={0.82} color={vivid.pink} dur={dur} />

        <Appear start={0.2} end={0.95} dur={dur}>
          <text x={320} y={28} textAnchor="middle" fill={vivid.red} fontSize={12} fontWeight={700}>
            leak 1 · what you&apos;re doing &nbsp;&nbsp; leak 2 · where you&apos;re from
          </text>
        </Appear>
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={235} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            cafe wifi · isp · website — each can see more than you think
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const GlassVsPipe = () => (
  <Frame title="clear glass tube vs sealed opaque pipe">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-cyan/30 bg-cyan/5 p-3">
        <p className="text-sm font-bold text-cyan">normal traffic</p>
        <svg viewBox="0 0 280 90" className="mt-2 w-full">
          <rect x="20" y="30" width="240" height="30" rx="15" fill="none" stroke={vivid.cyan} strokeOpacity={0.7} strokeWidth={2} />
          <text x={140} y={50} textAnchor="middle" fill={vivid.cyan} fontSize={11}>GET bank.com · from 203.0.113.44</text>
          <circle cx="50" cy="20" r="6" fill={vivid.orange} opacity={0.8} />
          <circle cx="140" cy="78" r="6" fill={vivid.yellow} opacity={0.8} />
          <circle cx="230" cy="20" r="6" fill={vivid.pink} opacity={0.8} />
          <text x={50} y={12} textAnchor="middle" fill="#94a3b8" fontSize={9}>peek</text>
          <text x={140} y={90} textAnchor="middle" fill="#94a3b8" fontSize={9}>isp</text>
          <text x={230} y={12} textAnchor="middle" fill="#94a3b8" fontSize={9}>wifi</text>
        </svg>
        <p className="mt-1 text-[11px] text-slate-400">anyone alongside can look in</p>
      </div>
      <div className="rounded-md border border-neon/30 bg-neon/5 p-3">
        <p className="text-sm font-bold text-neon">vpn tunnel</p>
        <svg viewBox="0 0 280 90" className="mt-2 w-full">
          <rect x="20" y="30" width="240" height="30" rx="15" fill={`${vivid.green}33`} stroke={vivid.green} strokeWidth={2.5} />
          <text x={140} y={50} textAnchor="middle" fill={vivid.green} fontSize={11}>████ scrambled box ████</text>
          <circle cx="50" cy="20" r="6" fill="#64748b" opacity={0.5} />
          <circle cx="140" cy="78" r="6" fill="#64748b" opacity={0.5} />
          <circle cx="230" cy="20" r="6" fill="#64748b" opacity={0.5} />
          <text x={140} y={90} textAnchor="middle" fill="#94a3b8" fontSize={9}>same route · sealed inside</text>
        </svg>
        <p className="mt-1 text-[11px] text-slate-400">they see a tunnel. not the contents.</p>
      </div>
    </div>
  </Frame>
);

export const VpnTunnelFlow = () => {
  const dur = 9;
  return (
    <Frame title="vpn on · step by step">
      <svg viewBox="0 0 640 260" className="w-full">
        {GRID}
        <rect width="640" height="260" fill="url(#vpn-grid)" />
        <SvgNode x={70} y={130} kind="laptop" color={vivid.cyan} label="your device" sub="encrypt first" r={24} />
        <SvgNode x={250} y={130} kind="server" color={vivid.green} label="vpn server" sub="decrypt + forward" r={26} />
        <SvgNode x={430} y={70} kind="cloud" color={vivid.purple} label="internet" r={20} />
        <SvgNode x={560} y={130} kind="server" color={vivid.pink} label="website" sub="sees vpn IP" r={24} />

        {/* sealed tunnel path */}
        <path d="M95 130 C150 130 180 130 224 130" fill="none" stroke={vivid.green} strokeWidth={10} strokeOpacity={0.25} strokeLinecap="round" />
        <path d="M95 130 C150 130 180 130 224 130" fill="none" stroke={vivid.green} strokeWidth={2.5} strokeDasharray="6 4" />

        <TravelDot path="M95,130 L224,130" start={0.08} end={0.35} color={vivid.green} dur={dur} />
        <Appear start={0.15} end={0.45} dur={dur}>
          <text x={160} y={110} textAnchor="middle" fill={vivid.green} fontSize={10} fontWeight={700}>encrypted tunnel</text>
        </Appear>
        <TravelDot path="M276,115 C340,80 380,70 410,70" start={0.4} end={0.62} color={vivid.purple} dur={dur} />
        <TravelDot path="M450,80 C500,100 520,120 536,125" start={0.6} end={0.82} color={vivid.pink} dur={dur} />

        <Appear start={0.05} end={0.35} dur={dur}>
          <text x={70} y={185} textAnchor="middle" fill={vivid.cyan} fontSize={10}>1 · seal on device</text>
        </Appear>
        <Appear start={0.35} end={0.65} dur={dur}>
          <text x={250} y={185} textAnchor="middle" fill={vivid.green} fontSize={10}>2 · open at vpn</text>
        </Appear>
        <Appear start={0.65} end={0.95} dur={dur}>
          <text x={560} y={185} textAnchor="middle" fill={vivid.pink} fontSize={10}>3 · look like the vpn</text>
        </Appear>
        <Appear start={0.5} end={0.95} dur={dur}>
          <text x={320} y={240} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            cafe / isp see a sealed box going to the vpn — not which site you open
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const IpMask = () => (
  <Frame title="what the website sees">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-red/30 bg-red/5 p-3">
        <p className="text-xs font-bold tracking-wide text-red uppercase">vpn off</p>
        <p className="mt-2 font-mono text-sm text-slate-200">client: <span style={{ color: vivid.cyan }}>203.0.113.44</span></p>
        <p className="mt-1 text-[11px] text-slate-400">city / region · your isp · roughly &quot;you&quot;</p>
      </div>
      <div className="rounded-md border border-neon/30 bg-neon/5 p-3">
        <p className="text-xs font-bold tracking-wide text-neon uppercase">vpn on</p>
        <p className="mt-2 font-mono text-sm text-slate-200">client: <span style={{ color: vivid.green }}>198.51.100.17</span></p>
        <p className="mt-1 text-[11px] text-slate-400">vpn server&apos;s address · not yours</p>
      </div>
    </div>
    <p className="mt-3 text-center text-[11px] text-slate-400">
      hiding your ip ≠ becoming invisible. logins and cookies still know you.
    </p>
  </Frame>
);

export const VpnLimits = () => (
  <Frame title="what a vpn does / does not">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-neon/25 bg-neon/5 p-3">
        <p className="text-sm font-bold text-neon">protects</p>
        <ul className="mt-2 space-y-1.5 text-[12px] text-slate-300">
          <li>· encrypts traffic to the vpn server</li>
          <li>· hides sites from cafe wifi + isp</li>
          <li>· hides your real ip from websites</li>
          <li>· valuable on public wifi</li>
        </ul>
      </div>
      <div className="rounded-md border border-red/30 bg-red/5 p-3">
        <p className="text-sm font-bold text-red">does not</p>
        <ul className="mt-2 space-y-1.5 text-[12px] text-slate-300">
          <li>· make you anonymous</li>
          <li>· replace https</li>
          <li>· stop phishing / malware</li>
          <li>· hide traffic from the vpn provider</li>
        </ul>
      </div>
    </div>
    <p className="mt-3 text-center text-[11px] text-amber">
      you&apos;re not removing the middleman — you&apos;re choosing a different one to trust
    </p>
  </Frame>
);

export const VpnVsProxy = () => (
  <Frame title="proxy vs vpn">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-orange/30 bg-orange/5 p-3">
        <p className="text-sm font-bold" style={{ color: vivid.orange }}>proxy</p>
        <ul className="mt-2 space-y-1.5 text-[12px] text-slate-300">
          <li>· usually one app (browser)</li>
          <li>· can change apparent ip</li>
          <li>· often <span className="text-red">no encryption</span></li>
          <li>· other apps still leak directly</li>
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">on untrusted wifi: still exposed</p>
      </div>
      <div className="rounded-md border border-neon/30 bg-neon/5 p-3">
        <p className="text-sm font-bold text-neon">vpn</p>
        <ul className="mt-2 space-y-1.5 text-[12px] text-slate-300">
          <li>· whole device</li>
          <li>· all apps through one tunnel</li>
          <li>· <span className="text-neon">encrypts + reroutes</span></li>
          <li>· stronger for privacy &amp; security</li>
        </ul>
        <p className="mt-2 text-[11px] text-slate-500">sealed pipe for everything leaving your laptop</p>
      </div>
    </div>
  </Frame>
);

export const VpnRecap = () => (
  <Frame title="vpn · one useful tool, not a magic cape">
    <div className="space-y-2 text-[12px] leading-5 text-slate-300">
      <p>
        <span className="font-bold text-neon">encrypts</span> your traffic so the local network and isp can&apos;t read what you&apos;re doing.
      </p>
      <p>
        <span className="font-bold text-cyan">hides</span> your real ip so websites see the vpn server instead.
      </p>
      <p>
        <span className="font-bold text-amber">trusts</span> the vpn provider — pick a reputable one.
      </p>
      <p>
        <span className="font-bold text-red">does not</span> protect you from your own clicks.
      </p>
    </div>
  </Frame>
);
