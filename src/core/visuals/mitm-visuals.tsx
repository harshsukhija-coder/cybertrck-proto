import { vivid } from "../palette";
import { Appear, Frame, TravelDot } from "./shared";

export const MitmMiddle = () => {
  const dur = 6;
  return (
    <Frame title="man-in-the-middle · silent detour">
      <svg viewBox="0 0 640 220" className="w-full">
        <rect width="640" height="220" fill="#050607" />
        <text x={90} y={36} textAnchor="middle" fill={vivid.cyan} fontSize={12} fontWeight={700}>
          you
        </text>
        <text x={320} y={36} textAnchor="middle" fill={vivid.pink} fontSize={12} fontWeight={700}>
          attacker
        </text>
        <text x={550} y={36} textAnchor="middle" fill={vivid.yellow} fontSize={12} fontWeight={700}>
          website
        </text>
        <rect x={40} y={70} width={100} height={70} rx={10} fill={`${vivid.cyan}18`} stroke={vivid.cyan} />
        <text x={90} y={110} textAnchor="middle" fill={vivid.cyan} fontSize={11}>
          laptop
        </text>
        <rect x={270} y={60} width={100} height={90} rx={10} fill={`${vivid.pink}18`} stroke={vivid.pink} />
        <text x={320} y={100} textAnchor="middle" fill={vivid.pink} fontSize={11}>
          kim
        </text>
        <text x={320} y={118} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          reads · forwards
        </text>
        <rect x={500} y={70} width={100} height={70} rx={10} fill={`${vivid.yellow}18`} stroke={vivid.yellow} />
        <text x={550} y={110} textAnchor="middle" fill={vivid.yellow} fontSize={11}>
          server
        </text>
        <TravelDot path="M140,105 L270,105" start={0.05} end={0.45} color={vivid.cyan} dur={dur} />
        <TravelDot path="M370,105 L500,105" start={0.35} end={0.85} color={vivid.pink} dur={dur} />
        <Appear start={0.2} end={0.95} dur={dur}>
          <text x={320} y={190} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            both ends think the path is direct · neither sees the middle
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const EvilTwin = () => (
  <Frame title="evil twin · same name, wrong tower">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-cyan/30 bg-cyan/5 p-3">
        <p className="text-sm font-bold text-cyan">☕ real cafe wifi</p>
        <p className="mt-2 font-mono text-[12px] text-slate-200">Bean&amp;Byte_Free</p>
        <p className="mt-1 text-[11px] text-slate-500">router behind the counter · weaker from the back tables</p>
      </div>
      <div className="animate-pulse-ring rounded-md border border-red/40 bg-red/5 p-3">
        <p className="text-sm font-bold text-red">🎭 evil twin</p>
        <p className="mt-2 font-mono text-[12px] text-slate-200">Bean&amp;Byte_Free</p>
        <p className="mt-1 text-[11px] text-slate-500">kim&apos;s hotspot · stronger signal · same SSID</p>
      </div>
    </div>
    <p className="mt-3 text-center text-[11px] text-slate-400">
      your laptop picks the loudest twin · traffic walks through kim first
    </p>
  </Frame>
);

export const ArpPoison = () => {
  const dur = 7;
  return (
    <Frame title="ARP spoof · lying about who owns the gateway">
      <svg viewBox="0 0 640 240" className="w-full">
        <rect width="640" height="240" fill="#050607" />
        <text x={100} y={30} textAnchor="middle" fill={vivid.cyan} fontSize={11} fontWeight={700}>
          sally ARP table
        </text>
        <text x={540} y={30} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>
          router ARP table
        </text>
        <rect x={30} y={50} width={140} height={90} rx={8} fill="#0b1220" stroke={vivid.cyan} />
        <text x={100} y={78} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          192.168.1.1 →
        </text>
        <Appear start={0.35} end={0.95} dur={dur}>
          <text x={100} y={100} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>
            kim MAC 😈
          </text>
        </Appear>
        <rect x={470} y={50} width={140} height={90} rx={8} fill="#0b1220" stroke={vivid.yellow} />
        <text x={540} y={78} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          sally IP →
        </text>
        <Appear start={0.45} end={0.95} dur={dur}>
          <text x={540} y={100} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>
            kim MAC 😈
          </text>
        </Appear>
        <rect x={250} y={70} width={140} height={70} rx={10} fill={`${vivid.pink}18`} stroke={vivid.pink} />
        <text x={320} y={100} textAnchor="middle" fill={vivid.pink} fontSize={11}>
          fake ARP replies
        </text>
        <text x={320} y={118} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          &quot;i am the router&quot;
        </text>
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={200} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            no verification · trust is the vulnerability
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const SessionHijack = () => (
  <Frame title="three powers once in the middle">
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-md border border-cyan/30 bg-cyan/5 p-3">
        <p className="text-lg">👂</p>
        <p className="mt-1 text-sm font-bold text-cyan">eavesdrop</p>
        <p className="mt-1 text-[11px] text-slate-400">read sites, searches, plaintext logins</p>
      </div>
      <div className="rounded-md border border-orange/30 bg-orange/5 p-3">
        <p className="animate-packet-slip text-lg">✏️</p>
        <p className="mt-1 text-sm font-bold text-orange">modify</p>
        <p className="mt-1 text-[11px] text-slate-400">alter requests · inject fake pages</p>
      </div>
      <div className="rounded-md border border-pink/30 bg-pink/5 p-3">
        <p className="text-lg">🍪</p>
        <p className="mt-1 text-sm font-bold text-pink">impersonate</p>
        <p className="mt-1 text-[11px] text-slate-400">steal session cookies · walk in as you</p>
      </div>
    </div>
  </Frame>
);

export const MitmDefense = () => (
  <Frame title="stack the shields">
    <ul className="space-y-2 text-[12px] text-slate-300">
      <li>🔒 <span className="text-neon">HTTPS</span> — lock icon before you type passwords</li>
      <li>🚨 treat cert warnings as stop signs, not annoyances</li>
      <li>🚇 <span className="text-neon">VPN</span> — encrypts the whole pipe on public wifi</li>
      <li>📱 MFA — stolen password still isn&apos;t enough</li>
      <li>📶 skip open networks · kill auto-join</li>
    </ul>
  </Frame>
);
