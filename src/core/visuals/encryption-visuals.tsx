import { vivid } from "../palette";
import { Appear, FlowLink, Frame, SvgNode, TravelDot } from "./shared";

const GRID = (
  <defs>
    <pattern id="enc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#3ddc84" strokeOpacity="0.06" />
    </pattern>
  </defs>
);

export const HttpVsHttps = () => (
  <Frame title="look at the address bar">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        {
          title: "http · no padlock",
          color: vivid.red,
          url: "http://bank-login.example/pay",
          badge: "not secure",
          lines: ["message travels as readable text", "anyone on the path can read it", "passwords · cards · chats: all visible"],
        },
        {
          title: "https · padlock",
          color: vivid.green,
          url: "https://bank-login.example/pay",
          badge: "connection is secure",
          lines: ["message is scrambled before travel", "interceptors see only noise", "this is encryption at work"],
        },
      ].map(side => (
        <div key={side.title} className="rounded-md border p-2.5" style={{ borderColor: `${side.color}66`, backgroundColor: `${side.color}0d` }}>
          <div className="mb-2 flex items-center gap-1.5 rounded border border-black/40 bg-black/50 px-2 py-1.5 text-[11px]">
            <span className="rounded px-1 text-[9px] font-bold text-black" style={{ backgroundColor: side.color }}>
              {side.title.startsWith("https") ? "lock" : "warn"}
            </span>
            <span className="truncate font-semibold" style={{ color: side.color }}>{side.url}</span>
          </div>
          <p className="mb-1.5 text-[10px] font-bold tracking-widest uppercase" style={{ color: side.color }}>{side.badge}</p>
          <ul className="space-y-1 text-[11px] text-slate-300">
            {side.lines.map(line => <li key={line}>· {line}</li>)}
          </ul>
        </div>
      ))}
    </div>
  </Frame>
);

export const InternetPath = () => {
  const path = "M70,120 L200,120 L320,120 L440,120 L570,120";
  const dur = 6;
  return (
    <Frame title="three networks · one message · one stranger in the middle">
      <svg viewBox="0 0 640 255" className="w-full">
        {GRID}
        <rect width="640" height="255" fill="url(#enc-grid)" />
        <rect x="20" y="40" width="160" height="170" rx="10" fill={`${vivid.cyan}10`} stroke={`${vivid.cyan}55`} />
        <rect x="240" y="40" width="160" height="170" rx="10" fill={`${vivid.red}10`} stroke={`${vivid.red}55`} strokeDasharray="5 4" />
        <rect x="460" y="40" width="160" height="170" rx="10" fill={`${vivid.green}10`} stroke={`${vivid.green}55`} />
        <text x="100" y="62" textAnchor="middle" fill={vivid.cyan} fontSize={11} fontWeight={700}>friday's network</text>
        <text x="320" y="62" textAnchor="middle" fill={vivid.red} fontSize={11} fontWeight={700}>isp / public internet</text>
        <text x="540" y="62" textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>dev's network</text>
        <text x="100" y="78" textAnchor="middle" fill="#94a3b8" fontSize={9.5}>we control this</text>
        <text x="320" y="78" textAnchor="middle" fill="#94a3b8" fontSize={9.5}>we do NOT control this</text>
        <text x="540" y="78" textAnchor="middle" fill="#94a3b8" fontSize={9.5}>friend controls this</text>

        <path d={path} stroke="#475569" strokeWidth={2} fill="none" strokeDasharray="4 4" />
        <SvgNode x={70} y={120} kind="laptop" color={vivid.cyan} label="friday" sub="sender" r={20} />
        <SvgNode x={200} y={120} kind="router" color={vivid.yellow} label="router" sub="" r={16} />
        <SvgNode x={320} y={120} kind="cloud" color={vivid.orange} label="" r={22} />
        <SvgNode x={440} y={120} kind="router" color={vivid.yellow} label="router" sub="" r={16} />
        <SvgNode x={570} y={120} kind="laptop" color={vivid.green} label="dev" sub="receiver" r={20} />

        <TravelDot path={path} start={0.05} end={0.85} color={vivid.pink} r={6} dur={dur} />
        <Appear start={0.35} end={0.55} dur={dur}>
          <g>
            <circle cx={320} cy={175} r={18} fill={`${vivid.red}22`} stroke={vivid.red} strokeWidth={1.5} />
            <text x={320} y={181} textAnchor="middle" fill={vivid.red} fontSize={12} fontWeight={800}>sniff</text>
            <text x={320} y={210} textAnchor="middle" fill={vivid.red} fontSize={11} fontWeight={700}>attacker copies the packet</text>
            <text x={320} y={224} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>tool: wireshark / tcpdump</text>
          </g>
        </Appear>
        <Appear start={0.05} end={0.35} dur={dur}>
          <rect x={95} y={88} width={150} height={18} rx={3} fill={`${vivid.pink}22`} stroke={vivid.pink} />
          <text x={170} y={101} textAnchor="middle" fill={vivid.pink} fontSize={10} fontWeight={700}>password=Mango$42</text>
        </Appear>
      </svg>
      <p className="text-[10.5px] text-slate-500">
        real world: coffee-shop wifi, hotel wifi, a compromised ISP router, or a fake "Free Airport WiFi" hotspot. the middle network is where secrets die.
      </p>
    </Frame>
  );
};

export const WiresharkHttp = () => (
  <Frame title="wireshark · what the attacker sees on http">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/70 font-mono text-[11px]">
      <div className="flex items-center gap-2 border-b border-neon/10 bg-[#1a2332] px-2 py-1 text-[10px] text-slate-400">
        <span className="rounded bg-[#2d4a6f] px-1.5 text-cyan">Wireshark</span>
        <span>filter: http.request</span>
        <span className="ml-auto text-red">● capturing</span>
      </div>
      <div className="grid grid-cols-[2.2rem_5.5rem_5.5rem_3rem_1fr] gap-x-2 border-b border-neon/10 bg-black/40 px-2 py-1 text-[9.5px] tracking-wider text-slate-500 uppercase">
        <span>#</span><span>source</span><span>dest</span><span>proto</span><span>info</span>
      </div>
      {[
        ["41", "192.168.1.10", "203.0.113.8", "TCP", "443 → 51244 [ACK]"],
        ["42", "192.168.1.10", "203.0.113.8", "HTTP", "POST /login HTTP/1.1"],
        ["43", "203.0.113.8", "192.168.1.10", "HTTP", "HTTP/1.1 200 OK"],
      ].map(([n, src, dst, proto, info], i) => (
        <div
          key={n}
          className={`grid grid-cols-[2.2rem_5.5rem_5.5rem_3rem_1fr] gap-x-2 px-2 py-1 ${i === 1 ? "bg-red/15" : ""}`}
          style={i === 1 ? { color: vivid.red } : { color: "#94a3b8" }}
        >
          <span>{n}</span><span>{src}</span><span>{dst}</span><span>{proto}</span><span className="truncate">{info}</span>
        </div>
      ))}
      <div className="border-t border-neon/10 px-3 py-2 text-[11.5px] leading-relaxed text-slate-300">
        <p className="mb-1 text-[10px] tracking-widest text-slate-500 uppercase">packet details · follow http stream</p>
        <pre className="whitespace-pre-wrap text-slate-300">
{`POST /login HTTP/1.1
Host: staging.chaibyte.example
Content-Type: application/x-www-form-urlencoded

username=`}
          <span style={{ color: vivid.cyan }}>friday</span>
          {`&password=`}
          <span style={{ color: vivid.red }}>Mango$42</span>
          {`&otp=`}
          <span style={{ color: vivid.orange }}>918273</span>
        </pre>
        <p className="mt-2 text-[11px] font-bold" style={{ color: vivid.red }}>
          readable. no scrambling. the attacker just... reads it.
        </p>
      </div>
    </div>
  </Frame>
);

export const WiresharkTls = () => (
  <Frame title="same attacker · same path · but now https">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/70 font-mono text-[11px]">
      <div className="flex items-center gap-2 border-b border-neon/10 bg-[#1a2332] px-2 py-1 text-[10px] text-slate-400">
        <span className="rounded bg-[#2d4a6f] px-1.5 text-cyan">Wireshark</span>
        <span>filter: tls</span>
        <span className="ml-auto" style={{ color: vivid.green }}>● capturing</span>
      </div>
      {[
        ["88", "192.168.1.10", "203.0.113.8", "TLS", "Client Hello"],
        ["89", "203.0.113.8", "192.168.1.10", "TLS", "Server Hello, Certificate"],
        ["90", "192.168.1.10", "203.0.113.8", "TLS", "Application Data"],
      ].map(([n, src, dst, proto, info], i) => (
        <div key={n} className={`grid grid-cols-[2.2rem_5.5rem_5.5rem_3rem_1fr] gap-x-2 px-2 py-1 ${i === 2 ? "bg-green/10" : "text-slate-400"}`} style={i === 2 ? { color: vivid.green } : undefined}>
          <span>{n}</span><span>{src}</span><span>{dst}</span><span>{proto}</span><span>{info}</span>
        </div>
      ))}
      <div className="border-t border-neon/10 px-3 py-2 text-[11.5px] leading-relaxed">
        <p className="mb-1 text-[10px] tracking-widest text-slate-500 uppercase">packet bytes</p>
        <pre className="whitespace-pre-wrap text-slate-400">
          {`0000  17 03 03 00 4a 8f 2c a1  e9 44 7b 01 c3 91 55 d0
0010  6e aa 2f 88 0d 4c `}
          <span style={{ color: vivid.purple }}>b7 19  e2 5f</span>
          {` 33 0a `}
          <span style={{ color: vivid.yellow }}>c8 41</span>
          {` 9d 72
0020  `}
          <span style={{ color: vivid.cyan }}>f1 08</span>
          {` 7e 54 `}
          <span style={{ color: vivid.pink }}>aa</span>
          {` 3d 21 90  66 `}
          <span style={{ color: vivid.orange }}>eb</span>
          {` 12 4f 00 9c 71 2a
0030  ...`}
        </pre>
        <p className="mt-2 text-[11px] font-bold" style={{ color: vivid.green }}>
          ciphertext. to the attacker this is just noise. no password. no otp. nothing.
        </p>
      </div>
    </div>
  </Frame>
);

export const EncryptFlow = () => {
  const dur = 7;
  return (
    <Frame title="encryption · the whole idea in one picture">
      <svg viewBox="0 0 640 210" className="w-full">
        {GRID}
        <rect width="640" height="210" fill="url(#enc-grid)" />
        {[
          { x: 70, label: "plaintext", sub: "Mango$42", color: vivid.cyan },
          { x: 250, label: "ciphertext", sub: "8f2c…a1e9", color: vivid.pink },
          { x: 430, label: "plaintext", sub: "Mango$42", color: vivid.green },
          { x: 570, label: "attacker", sub: "??? noise", color: vivid.red },
        ].map(box => (
          <g key={`${box.x}-${box.label}`}>
            <rect x={box.x - 55} y={70} width={110} height={54} rx={8} fill={`${box.color}14`} stroke={box.color} strokeWidth={1.5} />
            <text x={box.x} y={92} textAnchor="middle" fill={box.color} fontSize={11} fontWeight={700}>{box.label}</text>
            <text x={box.x} y={110} textAnchor="middle" fill="#e2e8f0" fontSize={12} fontWeight={700}>{box.sub}</text>
          </g>
        ))}
        <text x={160} y={50} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>encrypt + key</text>
        <text x={340} y={50} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>decrypt + key</text>
        <text x={500} y={50} textAnchor="middle" fill={vivid.red} fontSize={11} fontWeight={700}>no key</text>
        <path d="M125,97 L195,97" stroke={vivid.yellow} strokeWidth={2} fill="none" />
        <path d="M305,97 L375,97" stroke={vivid.yellow} strokeWidth={2} fill="none" />
        <path d="M250,124 L250,155 L570,155 L570,124" stroke={vivid.red} strokeWidth={1.5} strokeDasharray="4 4" fill="none" />
        <TravelDot path="M125,97 L195,97" start={0.05} end={0.2} color={vivid.yellow} dur={dur} />
        <TravelDot path="M305,97 L375,97" start={0.35} end={0.5} color={vivid.yellow} dur={dur} />
        <TravelDot path="M250,124 L250,155 L570,155 L570,124" start={0.25} end={0.7} color={vivid.red} dur={dur} />
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={190} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            security does not hide the data. it protects the <tspan fill={vivid.yellow} fontWeight={700}>key</tspan>.
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const CaesarWheel = () => {
  const shift = 3;
  return (
    <Frame title="caesar cipher · shift = 3 (the key)">
      <div className="mb-2 text-center text-[11px] text-slate-400">
        rule: move every letter <span style={{ color: vivid.yellow }}>{shift} places forward</span> in the alphabet
      </div>
      <div className="overflow-x-auto">
        <div className="inline-grid min-w-full grid-cols-[auto_repeat(26,minmax(1.15rem,1fr))] gap-y-1 text-center text-[10.5px]">
          <span className="pr-2 text-left text-slate-500">plain</span>
          {ALPHABET.map(letter => (
            <span key={letter} className="rounded py-0.5 font-bold" style={{ color: vivid.cyan, backgroundColor: `${vivid.cyan}14` }}>{letter}</span>
          ))}
          <span className="pr-2 text-left text-slate-500">cipher</span>
          {ALPHABET.map((letter, i) => {
            const out = ALPHABET[(i + shift) % 26];
            return (
              <span key={letter} className="rounded py-0.5 font-bold" style={{ color: vivid.pink, backgroundColor: `${vivid.pink}14` }}>{out}</span>
            );
          })}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded border px-3 py-2" style={{ borderColor: `${vivid.cyan}44`, backgroundColor: `${vivid.cyan}0d` }}>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: vivid.cyan }}>encrypt · plaintext</p>
          <p className="mt-1 text-sm font-bold tracking-[0.2em]" style={{ color: vivid.cyan }}>ATTACK AT DAWN</p>
          <p className="mt-2 text-[10px] tracking-widest uppercase" style={{ color: vivid.pink }}>ciphertext</p>
          <p className="mt-1 text-sm font-bold tracking-[0.2em]" style={{ color: vivid.pink }}>DWWDFN DW GDZQ</p>
        </div>
        <div className="rounded border px-3 py-2" style={{ borderColor: `${vivid.green}44`, backgroundColor: `${vivid.green}0d` }}>
          <p className="text-[10px] tracking-widest uppercase" style={{ color: vivid.green }}>decrypt · shift back 3</p>
          <p className="mt-1 text-sm font-bold tracking-[0.2em]" style={{ color: vivid.pink }}>DWWDFN DW GDZQ</p>
          <p className="mt-2 text-[10px] tracking-widest uppercase" style={{ color: vivid.cyan }}>plaintext again</p>
          <p className="mt-1 text-sm font-bold tracking-[0.2em]" style={{ color: vivid.cyan }}>ATTACK AT DAWN</p>
        </div>
      </div>
      <p className="mt-2 text-[10.5px] text-slate-500">
        A→D, B→E, … X→A, Y→B, Z→C. the key is just the number <span style={{ color: vivid.yellow }}>3</span>. spaces stay spaces.
      </p>
    </Frame>
  );
};

export const CaesarCrack = () => {
  const samples = [
    { k: 1, text: "CVVCEM CV FCYP", bad: true },
    { k: 2, text: "BUUBDL BU EBXO", bad: true },
    { k: 3, text: "ATTACK AT DAWN", bad: false },
    { k: 4, text: "ZSSZBJ ZS CZVM", bad: true },
    { k: 13, text: "QJJQSA QJ TQJA", bad: true },
  ];
  return (
    <Frame title="breaking caesar · try every key (brute force)">
      <p className="mb-2 text-[11px] text-slate-400">
        ciphertext: <span style={{ color: vivid.pink }}>DWWDFN DW GDZQ</span> · only <span style={{ color: vivid.yellow }}>25</span> possible keys. a human can finish this during a coffee.
      </p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-5">
        {samples.map(sample => (
          <div
            key={sample.k}
            className="rounded border px-2 py-1.5 text-center"
            style={{
              borderColor: sample.bad ? "#334155" : `${vivid.green}88`,
              backgroundColor: sample.bad ? "#0f172a" : `${vivid.green}18`,
              boxShadow: sample.bad ? undefined : `0 0 12px ${vivid.green}33`,
            }}
          >
            <div className="text-[10px] text-slate-500">key = {sample.k}</div>
            <div className="mt-0.5 text-[11px] font-bold" style={{ color: sample.bad ? "#94a3b8" : vivid.green }}>
              {sample.text}
            </div>
            {!sample.bad && <div className="mt-1 text-[10px] font-bold" style={{ color: vivid.green }}>✓ english!</div>}
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10.5px] text-slate-500">when you see real english, you found the key. Caesar is a toy. modern crypto is not.</p>
    </Frame>
  );
};

export const KeySpace = () => {
  const rows = [
    { name: "caesar", keys: "25", note: "coffee break", color: vivid.orange, width: "2%" },
    { name: "AES-128", keys: "2¹²⁸ ≈ 3.4 × 10³⁸", note: "more than atoms you can point at", color: vivid.cyan, width: "45%" },
    { name: "AES-256", keys: "2²⁵⁶ ≈ 1.2 × 10⁷⁷", note: "more than atoms in the observable universe", color: vivid.pink, width: "100%" },
  ];
  return (
    <Frame title="modern key space · why brute force dies">
      <div className="space-y-2.5">
        {rows.map(row => (
          <div key={row.name}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-[11px]">
              <span className="font-bold" style={{ color: row.color }}>{row.name}</span>
              <span className="font-mono text-slate-200">{row.keys}</span>
            </div>
            <div className="h-2.5 rounded bg-slate-800">
              <div className="h-2.5 rounded" style={{ width: row.width, backgroundColor: row.color }} />
            </div>
            <p className="mt-0.5 text-[10.5px] text-slate-500">{row.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded border px-3 py-2 text-[11.5px] leading-relaxed" style={{ borderColor: `${vivid.purple}55`, backgroundColor: `${vivid.purple}10` }}>
        <p style={{ color: vivid.purple }} className="font-bold">a tiny thought experiment</p>
        <p className="mt-1 text-slate-300">
          imagine a computer that tries <span style={{ color: vivid.yellow }}>one billion keys per second</span>.
          to try every AES-128 key it would need about <span style={{ color: vivid.pink }}>10²² years</span>.
          the universe is only ~10¹⁰ years old. your coffee went cold. the atoms went cold. the stars went cold.
        </p>
      </div>
    </Frame>
  );
};

export const SymmetricFlow = () => {
  const dur = 6;
  const path = "M90,100 L320,100 L550,100";
  return (
    <Frame title="symmetric encryption · one shared secret">
      <svg viewBox="0 0 640 210" className="w-full">
        {GRID}
        <rect width="640" height="210" fill="url(#enc-grid)" />
        <path d={path} stroke="#475569" strokeWidth={2} strokeDasharray="4 4" fill="none" />
        <SvgNode x={90} y={100} kind="laptop" color={vivid.cyan} label="friday" sub="encrypts with KEY" r={22} />
        <SvgNode x={320} y={100} kind="cloud" color={vivid.orange} label="internet" sub="sees ciphertext only" r={20} />
        <SvgNode x={550} y={100} kind="laptop" color={vivid.green} label="dev" sub="decrypts with KEY" r={22} />
        <TravelDot path={path} start={0.08} end={0.85} color={vivid.pink} dur={dur} />
        <Appear start={0.08} end={0.35} dur={dur}>
          <text x={200} y={78} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>ciphertext</text>
        </Appear>
        <g>
          <rect x={55} y={155} width={70} height={28} rx={6} fill={`${vivid.yellow}18`} stroke={vivid.yellow} />
          <text x={90} y={173} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>KEY</text>
          <rect x={515} y={155} width={70} height={28} rx={6} fill={`${vivid.yellow}18`} stroke={vivid.yellow} />
          <text x={550} y={173} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>KEY</text>
          <text x={320} y={173} textAnchor="middle" fill={vivid.yellow} fontSize={12} fontWeight={700}>same key on both sides</text>
        </g>
      </svg>
      <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded border px-2 py-1.5" style={{ borderColor: `${vivid.green}44`, backgroundColor: `${vivid.green}0d` }}>
          <span className="font-bold" style={{ color: vivid.green }}>pro:</span> blazing fast · great for huge files, video, whole websites
        </div>
        <div className="rounded border px-2 py-1.5" style={{ borderColor: `${vivid.red}44`, backgroundColor: `${vivid.red}0d` }}>
          <span className="font-bold" style={{ color: vivid.red }}>con:</span> both sides need the same secret first. how?
        </div>
      </div>
    </Frame>
  );
};

export const KeyExchangeProblem = () => {
  const dur = 7;
  return (
    <Frame title="the key exchange problem · a perfect loop">
      <svg viewBox="0 0 640 230" className="w-full">
        {GRID}
        <rect width="640" height="230" fill="url(#enc-grid)" />
        <SvgNode x={90} y={90} kind="laptop" color={vivid.cyan} label="friday" sub="has KEY" r={22} />
        <SvgNode x={320} y={90} kind="cloud" color={vivid.red} label="open internet" sub="attacker watching" r={22} />
        <SvgNode x={550} y={90} kind="laptop" color={vivid.green} label="dev" sub="needs KEY" r={22} />
        <TravelDot path="M110,90 L300,90" start={0.05} end={0.35} color={vivid.yellow} dur={dur} />
        <Appear start={0.05} end={0.35} dur={dur}>
          <text x={200} y={68} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>sends the KEY?</text>
        </Appear>
        <Appear start={0.3} end={0.55} dur={dur}>
          <g>
            <circle cx={320} cy={145} r={16} fill={`${vivid.red}22`} stroke={vivid.red} />
            <text x={320} y={150} textAnchor="middle" fill={vivid.red} fontSize={12} fontWeight={800}>grab!</text>
            <text x={320} y={175} textAnchor="middle" fill={vivid.red} fontSize={11}>attacker now has KEY</text>
          </g>
        </Appear>
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={205} textAnchor="middle" fill={vivid.orange} fontSize={12} fontWeight={700}>
            encrypt the key? …but then you need another key. loop.
          </text>
        </Appear>
      </svg>
      <p className="text-[10.5px] text-slate-500">
        two people who never met, with only an insecure channel between them, had no safe way to agree on a shared secret. for a long time this was a wall.
      </p>
    </Frame>
  );
};

export const KeyPair = () => (
  <Frame title="asymmetric encryption · a matched pair">
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
      <div className="rounded-md border p-3 text-center" style={{ borderColor: `${vivid.green}66`, backgroundColor: `${vivid.green}10` }}>
        <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full border-2 text-xs font-bold" style={{ borderColor: vivid.green, color: vivid.green }}>PRIV</div>
        <p className="text-sm font-bold" style={{ color: vivid.green }}>private key</p>
        <p className="mt-1 text-[11px] text-slate-300">kept completely secret</p>
        <p className="text-[11px] text-slate-400">never leaves its owner</p>
        <p className="mt-2 text-[10.5px] font-semibold" style={{ color: vivid.green }}>only this opens the lock</p>
      </div>
      <div className="text-center">
        <p className="text-lg font-bold" style={{ color: vivid.purple }}>⟷</p>
        <p className="text-[10px] tracking-widest text-slate-500 uppercase">math-linked</p>
      </div>
      <div className="rounded-md border p-3 text-center" style={{ borderColor: `${vivid.cyan}66`, backgroundColor: `${vivid.cyan}10` }}>
        <div className="mx-auto mb-2 grid h-14 w-14 place-items-center rounded-full border-2 border-dashed text-xs font-bold" style={{ borderColor: vivid.cyan, color: vivid.cyan }}>PUB</div>
        <p className="text-sm font-bold" style={{ color: vivid.cyan }}>public key</p>
        <p className="mt-1 text-[11px] text-slate-300">share with anyone</p>
        <p className="text-[11px] text-slate-400">post it. email it. shout it.</p>
        <p className="mt-2 text-[10.5px] font-semibold" style={{ color: vivid.cyan }}>can lock · cannot unlock</p>
      </div>
    </div>
    <p className="mt-3 text-center text-[11.5px] text-slate-300">
      anything locked with the <span style={{ color: vivid.cyan }}>public key</span> can only be unlocked with the matching <span style={{ color: vivid.green }}>private key</span>.
    </p>
  </Frame>
);

export const PadlockBox = () => {
  const dur = 8;
  return (
    <Frame title="the open padlock metaphor">
      <svg viewBox="0 0 640 230" className="w-full">
        {GRID}
        <rect width="640" height="230" fill="url(#enc-grid)" />
        <SvgNode x={80} y={110} kind="laptop" color={vivid.green} label="ramesh" sub="owns private key" r={22} />
        <SvgNode x={560} y={110} kind="laptop" color={vivid.cyan} label="friday" sub="wants to send secret" r={22} />

        <Appear start={0.02} end={0.28} dur={dur}>
          <g>
            <TravelDot path="M110,110 L500,110" start={0.02} end={0.25} color={vivid.cyan} dur={dur} />
            <text x={300} y={88} textAnchor="middle" fill={vivid.cyan} fontSize={11} fontWeight={700}>hands out open padlocks (public key)</text>
          </g>
        </Appear>
        <Appear start={0.28} end={0.55} dur={dur}>
          <g>
            <rect x={470} y={145} width={90} height={40} rx={6} fill={`${vivid.pink}18`} stroke={vivid.pink} />
            <text x={515} y={162} textAnchor="middle" fill={vivid.pink} fontSize={10} fontWeight={700}>box locked</text>
            <text x={515} y={176} textAnchor="middle" fill="#94a3b8" fontSize={9}>with your padlock</text>
          </g>
        </Appear>
        <Appear start={0.5} end={0.85} dur={dur}>
          <g>
            <TravelDot path="M500,110 L140,110" start={0.5} end={0.75} color={vivid.pink} dur={dur} />
            <text x={300} y={88} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>locked box travels (even friday can't reopen it)</text>
          </g>
        </Appear>
        <Appear start={0.78} end={0.98} dur={dur}>
          <text x={80} y={175} textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>only ramesh's key opens it</text>
        </Appear>
      </svg>
      <p className="text-[10.5px] text-slate-500">
        it does not matter how many people have your padlock. only you have the key that opens what they locked.
      </p>
    </Frame>
  );
};

export const SpeedRace = () => (
  <Frame title="speed · why we don't encrypt everything with asymmetric alone">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        { title: "symmetric", color: vivid.green, speed: "very fast", use: "bulk data: video, files, every https page load" },
        { title: "asymmetric", color: vivid.orange, speed: "much slower", use: "small secrets only: exchanging keys, signatures" },
      ].map(side => (
        <div key={side.title} className="rounded-md border p-3" style={{ borderColor: `${side.color}55`, backgroundColor: `${side.color}0d` }}>
          <p className="text-sm font-bold" style={{ color: side.color }}>{side.title}</p>
          <p className="mt-1 text-lg font-bold text-slate-100">{side.speed}</p>
          <p className="mt-1 text-[11px] text-slate-400">{side.use}</p>
        </div>
      ))}
    </div>
    <p className="mt-2 text-center text-[11.5px] text-slate-300">
      so which one does the internet use? <span style={{ color: vivid.yellow }}>both. as a team.</span>
    </p>
  </Frame>
);

export const HttpsHandshake = () => {
  const dur = 9;
  return (
    <Frame title="https setup · asymmetric first, then symmetric forever">
      <svg viewBox="0 0 640 280" className="w-full">
        {GRID}
        <rect width="640" height="280" fill="url(#enc-grid)" />
        <SvgNode x={90} y={70} kind="laptop" color={vivid.cyan} label="your browser" sub="" r={22} />
        <SvgNode x={550} y={70} kind="server" color={vivid.green} label="website" sub="has public+private" r={22} />
        <line x1={90} y1={110} x2={90} y2={240} stroke="#334155" strokeDasharray="3 4" />
        <line x1={550} y1={110} x2={550} y2={240} stroke="#334155" strokeDasharray="3 4" />

        <Appear start={0.05} end={0.95} dur={dur}>
          <text x={320} y={40} textAnchor="middle" fill={vivid.cyan} fontSize={11} fontWeight={700}>1 · site shares public key (openly)</text>
        </Appear>
        <TravelDot path="M530,70 L110,70" start={0.05} end={0.22} color={vivid.cyan} dur={dur} />

        <Appear start={0.25} end={0.95} dur={dur}>
          <text x={320} y={135} textAnchor="middle" fill={vivid.yellow} fontSize={11} fontWeight={700}>2 · browser makes a fresh session KEY, locks it with public key</text>
        </Appear>
        <TravelDot path="M110,150 L530,150" start={0.3} end={0.48} color={vivid.yellow} dur={dur} />
        <Appear start={0.32} end={0.48} dur={dur}>
          <text x={320} y={168} textAnchor="middle" fill={vivid.yellow} fontSize={10}>encrypted session key</text>
        </Appear>

        <Appear start={0.52} end={0.95} dur={dur}>
          <text x={320} y={200} textAnchor="middle" fill={vivid.green} fontSize={11} fontWeight={700}>3 · only the website's private key unlocks it · now both share KEY</text>
        </Appear>
        <Appear start={0.7} end={0.98} dur={dur}>
          <g>
            <FlowLink d="M110,235 L530,235" color={vivid.pink} dur={1.6} />
            <text x={320} y={260} textAnchor="middle" fill={vivid.pink} fontSize={11} fontWeight={700}>4 · fast symmetric encryption for all the real data</text>
          </g>
        </Appear>
      </svg>
    </Frame>
  );
};

export const SessionKeys = () => (
  <Frame title="fresh session keys · past chats stay safe">
    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
      {[
        { t: "monday login", k: "KEY-A7", color: vivid.cyan },
        { t: "tuesday pay", k: "KEY-B3", color: vivid.yellow },
        { t: "friday chat", k: "KEY-F9", color: vivid.pink },
      ].map(session => (
        <div key={session.t} className="rounded border px-2 py-2" style={{ borderColor: `${session.color}55`, backgroundColor: `${session.color}0d` }}>
          <p className="text-[10px] text-slate-500">{session.t}</p>
          <p className="mt-1 font-bold" style={{ color: session.color }}>{session.k}</p>
          <p className="mt-1 text-[10px] text-slate-400">new · disposable</p>
        </div>
      ))}
    </div>
    <p className="mt-3 text-center text-[11.5px] text-slate-300">
      if one session key leaks, it does <span style={{ color: vivid.green }}>not</span> unlock your past or future conversations.
      that is why https feels boringly safe every single day: logins, payments, messages.
    </p>
  </Frame>
);
