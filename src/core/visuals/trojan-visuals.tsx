import { vivid } from "../palette";
import { Appear, Frame, TravelDot } from "./shared";

export const TrojanPackage = () => (
  <Frame title="delivery package metaphor">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-cyan/30 bg-cyan/5 p-3">
        <p className="text-sm font-bold text-cyan">🎁 outer wrapping</p>
        <p className="mt-2 text-[12px] text-slate-300">email + fake jpeg name</p>
        <p className="mt-1 text-[11px] text-slate-500">how it arrives · how it looks safe</p>
      </div>
      <div className="rounded-md border border-red/30 bg-red/5 p-3">
        <p className="text-sm font-bold text-red">🧨 payload inside</p>
        <p className="mt-2 text-[12px] text-slate-300">reverse shell code</p>
        <p className="mt-1 text-[11px] text-slate-500">runs the moment the &quot;photo&quot; opens</p>
      </div>
    </div>
    <p className="mt-3 text-center text-[11px] text-slate-400">
      trojan = looks like a gift · acts like a break-in
    </p>
  </Frame>
);

export const ExtensionTrick = () => (
  <Frame title="windows hides extensions by default">
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-md border border-red/30 bg-black/40 p-3 font-mono text-[12px]">
        <p className="text-[10px] tracking-wide text-red uppercase">real filename</p>
        <p className="mt-2 text-slate-200">
          picture.<span style={{ color: vivid.cyan }}>jpeg</span>.<span style={{ color: vivid.red }}>exe</span>
        </p>
        <p className="mt-2 text-[11px] text-slate-500">windows executable · last extension wins</p>
      </div>
      <div className="rounded-md border border-cyan/30 bg-black/40 p-3 font-mono text-[12px]">
        <p className="text-[10px] tracking-wide text-cyan uppercase">what sally sees</p>
        <p className="mt-2 text-slate-200">
          picture.<span style={{ color: vivid.cyan }}>jpeg</span> 🖼️
        </p>
        <p className="mt-2 text-[11px] text-slate-500">.exe hidden · looks like a photo</p>
      </div>
    </div>
  </Frame>
);

export const ReverseShell = () => {
  const dur = 7;
  return (
    <Frame title="reverse shell · victim calls attacker">
      <svg viewBox="0 0 640 220" className="w-full">
        <rect width="640" height="220" fill="#050607" />
        <text x={110} y={40} textAnchor="middle" fill={vivid.cyan} fontSize={12} fontWeight={700}>sally · windows</text>
        <text x={530} y={40} textAnchor="middle" fill={vivid.green} fontSize={12} fontWeight={700}>kim · listener :4444</text>
        <rect x={40} y={70} width={140} height={80} rx={10} fill={`${vivid.cyan}18`} stroke={vivid.cyan} />
        <text x={110} y={115} textAnchor="middle" fill={vivid.cyan} fontSize={11}>opens &quot;jpeg&quot;</text>
        <rect x={460} y={70} width={140} height={80} rx={10} fill={`${vivid.green}18`} stroke={vivid.green} />
        <text x={530} y={115} textAnchor="middle" fill={vivid.green} fontSize={11}>meterpreter</text>
        <TravelDot path="M180,110 L460,110" start={0.15} end={0.85} color={vivid.pink} dur={dur} />
        <Appear start={0.3} end={0.95} dur={dur}>
          <text x={320} y={95} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>
            outbound connect →
          </text>
        </Appear>
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={190} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            firewalls often allow outbound · that&apos;s why reverse shells work
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const TrojanDefense = () => (
  <Frame title="how not to become sally">
    <ul className="space-y-2 text-[12px] text-slate-300">
      <li>👁️ <span className="text-neon">show file extensions</span> in windows</li>
      <li>📎 never open weird attachments — even from &quot;friends&quot;</li>
      <li>🛡️ antivirus with real-time scanning</li>
      <li>👑 don&apos;t run as administrator unless needed</li>
      <li>🧪 open unknowns in a vm / sandbox</li>
    </ul>
  </Frame>
);
