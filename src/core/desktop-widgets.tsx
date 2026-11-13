import { useState, type ReactNode } from "react";
import { useSecurityFeeds, type DailyAttacks, type Feed, type ThreatLevel } from "./use-security-feeds";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const portNames: Record<number, string> = {
  21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns", 80: "http", 81: "http-alt", 443: "https", 445: "smb",
  1433: "mssql", 2222: "ssh-alt", 3306: "mysql", 3389: "rdp", 5555: "adb", 5900: "vnc", 6379: "redis",
  8000: "http-alt", 8080: "http-proxy", 8443: "https-alt", 9000: "http-alt",
};

const threatColors: Record<ThreatLevel, string> = {
  green: "text-neon",
  yellow: "text-amber",
  orange: "text-amber",
  red: "text-danger",
};

const shortDate = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en", { day: "2-digit", month: "short", timeZone: "UTC" }).toLowerCase();

const timeAgo = (iso: string) => {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
};

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "news.ycombinator.com";
  }
};

type WidgetProps = { title: string; source?: string; children: ReactNode };

const Widget = ({ title, source, children }: WidgetProps) => (
  <section className="rounded-lg border border-neon/15 bg-panel/85 p-3 backdrop-blur-sm">
    <header className="mb-2 flex items-center justify-between text-[10px] tracking-[0.2em] text-neon/45 uppercase">
      <span>{title}</span>
      {source && <span className="tracking-normal normal-case text-neon/30">{source}</span>}
    </header>
    {children}
  </section>
);

// Shows loading / offline text until a feed has data
const FeedState = <T,>({ feed, children }: { feed: Feed<T>; children: (data: T) => ReactNode }) => {
  if (feed.data) return children(feed.data);
  if (feed.error) return <p className="text-xs text-danger/80">feed offline. retrying in 10 min.</p>;
  return <p className="text-xs text-neon/40">fetching feed<span className="animate-blink">_</span></p>;
};

const CHART_W = 288;
const CHART_H = 80;

const AttackChart = ({ days }: { days: DailyAttacks[] }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const values = days.map(day => day.records);
  const min = Math.min(...values) * 0.95;
  const max = Math.max(...values) * 1.02;
  const points = values.map((value, i) => ({
    x: (i / (values.length - 1)) * CHART_W,
    y: CHART_H - ((value - min) / (max - min)) * CHART_H,
  }));
  const line = points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const active = hovered ?? days.length - 1;
  const day = days[active];
  const previous = days[active - 1];
  const change = previous ? ((day.records - previous.records) / previous.records) * 100 : null;

  return (
    <div>
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-neon tabular-nums">{compact.format(day.records)}</p>
          <p className="text-[11px] text-neon/45">attack attempts · {shortDate(day.date)}</p>
        </div>
        {change !== null && (
          <span className={`text-xs tabular-nums ${change > 0 ? "text-danger" : "text-neon/70"}`}>
            {change > 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="h-20 w-full overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHovered(null)}
        onMouseMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - box.left) / box.width;
          setHovered(Math.min(days.length - 1, Math.max(0, Math.round(ratio * (days.length - 1)))));
        }}
      >
        <defs>
          <linearGradient id="attack-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3ddc84" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#3ddc84" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(level => (
          <line key={level} x1="0" x2={CHART_W} y1={CHART_H * level} y2={CHART_H * level} stroke="#3ddc84" strokeOpacity="0.07" />
        ))}
        <polygon points={`0,${CHART_H} ${line} ${CHART_W},${CHART_H}`} fill="url(#attack-fill)" />
        <polyline points={line} fill="none" stroke="#3ddc84" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <line x1={points[active].x} x2={points[active].x} y1="0" y2={CHART_H} stroke="#3ddc84" strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-neon/35">
        <span>{shortDate(days[0].date)}</span>
        <span>{compact.format(day.sources)} attacking IPs</span>
        <span>{shortDate(days[days.length - 1].date)}</span>
      </div>
    </div>
  );
};

const DesktopWidgets = () => {
  const { attacks, ports, threatLevel, news } = useSecurityFeeds();

  return (
    <aside className="thin-scrollbar absolute top-4 right-4 bottom-4 hidden w-80 flex-col gap-3 overflow-y-auto lg:flex">
      <Widget title="internet threat level" source="SANS ISC">
        <FeedState feed={threatLevel}>
          {level => (
            <p className={`flex items-center gap-2 text-sm font-semibold uppercase ${threatColors[level]}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {level}
              <span className="ml-auto text-[11px] font-normal normal-case text-neon/40">global infocon</span>
            </p>
          )}
        </FeedState>
      </Widget>

      <Widget title="global attacks · 14 days" source="dshield sensors">
        <FeedState feed={attacks}>{days => (days.length > 1 ? <AttackChart days={days} /> : null)}</FeedState>
      </Widget>

      <Widget title="most attacked ports · today" source="SANS ISC">
        <FeedState feed={ports}>
          {rows => {
            const top = Math.max(...rows.map(row => row.records));
            return (
              <ul className="space-y-1.5 text-xs">
                {rows.map(row => (
                  <li key={row.port} className="grid grid-cols-[3rem_5.5rem_1fr_2.75rem] items-center gap-2">
                    <span className="text-neon tabular-nums">{row.port}</span>
                    <span className="truncate text-neon/50">{portNames[row.port] ?? "unknown"}</span>
                    <span className="h-1.5 rounded-full bg-neon/10">
                      <span className="block h-full rounded-full bg-neon/60" style={{ width: `${(row.records / top) * 100}%` }} />
                    </span>
                    <span className="text-right text-neon/60 tabular-nums">{compact.format(row.records)}</span>
                  </li>
                ))}
              </ul>
            );
          }}
        </FeedState>
      </Widget>

      <Widget title="security news" source="hacker news">
        <FeedState feed={news}>
          {items =>
            items.length === 0 ? (
              <p className="text-xs text-neon/40">no security headlines right now.</p>
            ) : (
              <ul className="divide-y divide-neon/[0.07]">
                {items.map(item => (
                  <li key={item.id}>
                    <a href={item.url} target="_blank" rel="noreferrer" className="group block py-2 first:pt-0">
                      <p className="line-clamp-2 text-xs leading-snug text-slate-300 group-hover:text-neon">{item.title}</p>
                      <p className="mt-1 truncate text-[10px] text-neon/35">
                        {hostname(item.url)} · {timeAgo(item.createdAt)} · {item.points} pts
                      </p>
                    </a>
                  </li>
                ))}
              </ul>
            )
          }
        </FeedState>
      </Widget>
    </aside>
  );
};

export default DesktopWidgets;
