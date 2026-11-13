import fridayPortrait from "../../assets/characters/friday.jpg";
import rameshPortrait from "../../assets/characters/ramesh.jpg";
import { officeDevices } from "../network-data";
import { vivid } from "../palette";
import { DeviceGlyph, Frame } from "./shared";

export const IpAnatomy = () => {
  const octets = [
    { value: "192", bits: "11000000", color: vivid.cyan },
    { value: "168", bits: "10101000", color: vivid.cyan },
    { value: "1", bits: "00000001", color: vivid.cyan },
    { value: "30", bits: "00011110", color: vivid.pink },
  ];
  const range = [
    { label: ".0", text: "network", sub: "street name", color: vivid.yellow, grow: 1 },
    { label: ".1", text: "router", sub: "gateway", color: vivid.yellow, grow: 1 },
    { label: ".2 - .254", text: "253 more devices", sub: "laptops, printer, x7q...", color: vivid.green, grow: 7 },
    { label: ".255", text: "broadcast", sub: "everyone", color: vivid.orange, grow: 1.3 },
  ];
  const privateRanges = [
    { cidr: "10.0.0.0/8", size: "16.7M", who: "big companies" },
    { cidr: "172.16.0.0/12", size: "1M", who: "companies, docker" },
    { cidr: "192.168.0.0/16", size: "65k", who: "homes, small offices" },
  ];

  return (
    <Frame title="ip address anatomy">
      <div className="flex flex-wrap items-end justify-center gap-1 text-center">
        {octets.map((octet, i) => (
          <div key={i} className="flex items-end gap-1">
            <div>
              <div className="rounded px-2.5 py-1 text-2xl font-bold" style={{ color: octet.color, backgroundColor: `${octet.color}1a` }}>
                {octet.value}
              </div>
              <div className="mt-1 font-mono text-[9.5px] tracking-wider" style={{ color: `${octet.color}cc` }}>{octet.bits}</div>
            </div>
            {i < 3 && <span className="pb-6 text-2xl text-slate-500">.</span>}
          </div>
        ))}
        <div className="ml-1">
          <div className="rounded px-2 py-1 text-2xl font-bold" style={{ color: vivid.yellow, backgroundColor: `${vivid.yellow}1a` }}>/24</div>
          <div className="mt-1 text-[9.5px] text-slate-500">mask</div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[3fr_1fr] gap-1 text-center text-[11px] font-semibold">
        <div className="rounded border-t-2 pt-1" style={{ borderColor: vivid.cyan, color: vivid.cyan }}>
          first 24 bits = the street (network) · same for everyone in the office
        </div>
        <div className="rounded border-t-2 pt-1" style={{ borderColor: vivid.pink, color: vivid.pink }}>
          last 8 bits = the house
        </div>
      </div>

      <p className="mt-4 mb-1 text-[10px] tracking-widest text-slate-500 uppercase">the street 192.168.1.0/24 · 256 addresses</p>
      <div className="flex overflow-hidden rounded border border-neon/15 text-center">
        {range.map(cell => (
          <div
            key={cell.label}
            className="border-r border-black/60 px-1 py-1.5 last:border-r-0"
            style={{ flexGrow: cell.grow, flexBasis: 0, backgroundColor: `${cell.color}22` }}
          >
            <div className="text-xs font-bold" style={{ color: cell.color }}>{cell.label}</div>
            <div className="text-[10.5px] text-slate-200">{cell.text}</div>
            <div className="text-[9.5px] text-slate-500">{cell.sub}</div>
          </div>
        ))}
      </div>
      <p className="mt-1 text-[10.5px] text-slate-500">
        256 addresses - network - broadcast = <span style={{ color: vivid.green }}>254 usable</span>
      </p>

      <p className="mt-4 mb-1 text-[10px] tracking-widest text-slate-500 uppercase">private ranges (inside networks only)</p>
      <div className="grid grid-cols-3 gap-2">
        {privateRanges.map(range => (
          <div key={range.cidr} className="rounded border px-2 py-1.5" style={{ borderColor: `${vivid.pink}44`, backgroundColor: `${vivid.pink}0d` }}>
            <div className="text-xs font-bold" style={{ color: vivid.pink }}>{range.cidr}</div>
            <div className="text-[10.5px] text-slate-300">{range.size} addresses</div>
            <div className="text-[9.5px] text-slate-500">{range.who}</div>
          </div>
        ))}
      </div>
    </Frame>
  );
};

export const WhoIsWho = () => {
  const people = [
    {
      image: fridayPortrait,
      name: "friday",
      role: "the employee",
      color: "#C9A35A",
      lines: ["junior developer at chaibyte", "'IT guy' since he restarted the router", "superpower: googling error messages", "fear: nmap --help"],
    },
    {
      image: rameshPortrait,
      name: "ramesh",
      role: "the hacker (the ethical kind)",
      color: "#6FA8B8",
      lines: ["pentester, paid to break in legally", "sees networks as open maps", "superpower: reading scan output", "weapon of choice: nmap"],
    },
  ];
  return (
    <Frame title="the cast">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        {people.map((person, i) => (
          <div key={person.name} className={`flex flex-col items-center text-center ${i === 1 ? "col-start-3" : ""}`}>
            <img
              src={person.image}
              alt={person.name}
              className="h-32 w-32 rounded-lg border-2 object-cover"
              style={{ borderColor: person.color, boxShadow: `0 0 18px ${person.color}55` }}
            />
            <p className="mt-2 text-sm font-bold" style={{ color: person.color }}>{person.name}</p>
            <p className="text-[10.5px] tracking-widest text-slate-400 uppercase">{person.role}</p>
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-400">
              {person.lines.map(line => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ))}
        <span className="col-start-2 row-start-1 mt-14 text-lg font-bold text-neon/60">vs</span>
      </div>
      <p className="mt-2 text-center text-[10.5px] text-slate-500">same network. one is scared of it, one can read it like a book. by the end, you'll be the second one.</p>
    </Frame>
  );
};

export const DevicesFound = () => (
  <Frame title="nmap -sn results · 6 hosts up">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {officeDevices.map(device => {
        const color = vivid[device.color];
        const suspicious = device.id === "x7q";
        return (
          <div
            key={device.id}
            className={`relative rounded-md border p-2 ${suspicious ? "animate-pulse" : ""}`}
            style={{ borderColor: `${color}${suspicious ? "cc" : "55"}`, backgroundColor: `${color}0f` }}
          >
            {suspicious && (
              <span className="absolute -top-2 right-2 rounded px-1.5 text-[9.5px] font-bold text-black" style={{ backgroundColor: color }}>
                the 'web server'?!
              </span>
            )}
            <div className="flex items-center gap-2">
              <DeviceGlyph kind={device.kind} className="h-7 w-7 shrink-0" style={{ color }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold" style={{ color }}>{device.host}</p>
                <p className="text-[11px] font-semibold" style={{ color: vivid.pink }}>{device.ip}</p>
              </div>
            </div>
            <div className="mt-1.5 text-[10px] leading-snug text-slate-400">
              <p>vendor: <span style={{ color: vivid.purple }}>{device.vendor}</span></p>
              <p className="truncate">{device.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  </Frame>
);
