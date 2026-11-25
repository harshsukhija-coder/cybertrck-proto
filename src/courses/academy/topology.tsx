import type { TopoNode, Topology } from "./types";

const Icon = ({ node }: { node: TopoNode }) => {
  const common = { fill: "#10141d", stroke: "var(--accent)", strokeWidth: 1.6 };
  switch (node.kind) {
    case "router":
      return (
        <g>
          <circle r={19} {...common} />
          <path d="M-9 -4 L9 -4 M5 -8 L9 -4 L5 0 M9 4 L-9 4 M-5 0 L-9 4 L-5 8" fill="none" stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "switch":
      return (
        <g>
          <rect x={-24} y={-13} width={48} height={26} rx={6} {...common} />
          <path d="M-12 -4 L12 -4 M8 -7 L12 -4 L8 -1 M12 4 L-12 4 M-8 1 L-12 4 L-8 7" fill="none" stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "server":
      return (
        <g>
          <rect x={-13} y={-19} width={26} height={38} rx={4} {...common} />
          <path d="M-7 -9 H7 M-7 -2 H7 M-7 5 H7" stroke="var(--accent)" strokeWidth={1.4} strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <rect x={-17} y={-15} width={34} height={23} rx={3} {...common} />
          <path d="M-6 13 H6 M0 8 V13" stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" />
        </g>
      );
  }
};

export const TopologyDiagram = ({ topology }: { topology: Topology }) => {
  const byId = new Map(topology.nodes.map(n => [n.id, n]));
  return (
    <svg viewBox={`0 0 400 ${topology.height}`} className="h-auto w-full" role="img" aria-label="lab network diagram">
      {topology.zones?.map(z => (
        <g key={z.label}>
          <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={14} fill={z.color} fillOpacity={0.06} stroke={z.color} strokeOpacity={0.35} strokeDasharray="4 4" />
          <text x={z.x + 10} y={z.y + 15} fill={z.color} fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700}>
            {z.label}
          </text>
        </g>
      ))}
      {topology.links.map(l => {
        const a = byId.get(l.a)!;
        const b = byId.get(l.b)!;
        return (
          <g key={`${l.a}-${l.b}`}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={l.color ?? "rgba(255,255,255,0.35)"} strokeWidth={1.6} />
            {l.label && (
              <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize={8.5} fontFamily="JetBrains Mono, monospace">
                {l.label}
              </text>
            )}
          </g>
        );
      })}
      {topology.nodes.map(n => (
        <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
          <Icon node={n} />
          <text y={n.kind === "router" ? 33 : 30} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700} fontFamily="Space Grotesk, sans-serif">
            {n.label}
          </text>
          {n.sub && (
            <text y={n.kind === "router" ? 44 : 41} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8.5} fontFamily="JetBrains Mono, monospace">
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};
