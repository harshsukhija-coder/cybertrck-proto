import type { ReactNode } from "react";
import {
  CloudIcon,
  DesktopIcon,
  LaptopIcon,
  NasIcon,
  PrinterIcon,
  RouterIcon,
  ServerIcon,
  SwitchIcon,
} from "../../icons/NetworkIcons";
import type { DeviceKind } from "../network-data";

export type GlyphKind = DeviceKind | "cloud" | "switch";

const glyphs = {
  router: RouterIcon,
  laptop: LaptopIcon,
  printer: PrinterIcon,
  server: ServerIcon,
  nas: NasIcon,
  desktop: DesktopIcon,
  cloud: CloudIcon,
  switch: SwitchIcon,
} satisfies Record<GlyphKind, unknown>;

export const Frame = ({ children, title }: { children: ReactNode; title?: string }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-neon/15 bg-black/50">
    {title && (
      <div className="border-b border-neon/10 bg-neon/[0.04] px-3 py-1 text-[10px] tracking-widest text-neon/50 uppercase">
        {title}
      </div>
    )}
    <div className="p-3">{children}</div>
  </div>
);

export const DeviceGlyph = ({ kind, className, style }: { kind: GlyphKind; className?: string; style?: React.CSSProperties }) => {
  const Icon = glyphs[kind];
  return <Icon className={className} style={style} />;
};

type SvgNodeProps = {
  x: number;
  y: number;
  kind: GlyphKind;
  color: string;
  label: string;
  sub?: string;
  r?: number;
};

export const SvgNode = ({ x, y, kind, color, label, sub, r = 22 }: SvgNodeProps) => {
  const Icon = glyphs[kind];
  const size = r * 1.15;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={`${color}1a`} stroke={color} strokeOpacity={0.7} strokeWidth={1.5} />
      <Icon x={x - size / 2} y={y - size / 2} width={size} height={size} style={{ color }} />
      <text x={x} y={y + r + 14} textAnchor="middle" fill={color} fontSize={11.5} fontWeight={700}>
        {label}
      </text>
      {sub && (
        <text x={x} y={y + r + 27} textAnchor="middle" fill="#94a3b8" fontSize={9.5}>
          {sub}
        </text>
      )}
    </g>
  );
};

// A dot that travels along `path` between fractions `start` and `end` of a looping timeline
export const TravelDot = ({
  path,
  start,
  end,
  color,
  dur = 5,
  r = 5,
}: {
  path: string;
  start: number;
  end: number;
  color: string;
  dur?: number;
  r?: number;
}) => (
  <circle r={r} fill={color} opacity={0} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
    <animateMotion
      path={path}
      dur={`${dur}s`}
      repeatCount="indefinite"
      calcMode="linear"
      keyPoints="0;0;1;1"
      keyTimes={`0;${start};${end};1`}
    />
    <animate
      attributeName="opacity"
      dur={`${dur}s`}
      repeatCount="indefinite"
      calcMode="discrete"
      values="0;1;0"
      keyTimes={`0;${start};${end}`}
    />
  </circle>
);

// Shows its children between fractions `start` and `end` of a looping timeline
export const Appear = ({ start, end, dur = 5, children }: { start: number; end: number; dur?: number; children: ReactNode }) => (
  <g opacity={0}>
    <animate
      attributeName="opacity"
      dur={`${dur}s`}
      repeatCount="indefinite"
      calcMode="discrete"
      values="0;1;0"
      keyTimes={`0;${start};${end}`}
    />
    {children}
  </g>
);

// A link with packets constantly flowing along it
export const FlowLink = ({ d, color, dashed, offset = 0, dur = 2.4 }: { d: string; color: string; dashed?: boolean; offset?: number; dur?: number }) => (
  <g>
    <path d={d} stroke={color} strokeOpacity={0.4} strokeWidth={2} fill="none" strokeDasharray={dashed ? "5 5" : undefined} />
    <circle r={3} fill={color} style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
      <animateMotion dur={`${dur}s`} begin={`-${offset}s`} repeatCount="indefinite" path={d} />
    </circle>
  </g>
);
