import { rosette } from "./badge-shape";
import type { Badge } from "./badges";

type Props = { badge: Badge; earned: boolean; className?: string };

/** Sizes itself from its width, so one className controls everything */
export const BadgeMedal = ({ badge, earned, className = "w-20" }: Props) => {
  const edge = rosette(50, 50, 48, 43)
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const color = earned ? badge.color : "#3a3d46";
  return (
    <span className={`relative inline-grid aspect-square shrink-0 place-items-center [container-type:inline-size] ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <polygon points={edge} fill={color} />
        <circle cx="50" cy="50" r="36" fill="#0b0c10" />
        <circle cx="50" cy="50" r="31" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray={badge.tier === "gold" ? undefined : "2 3"} opacity={0.8} />
      </svg>
      <span className={`relative leading-none ${earned ? "" : "opacity-40 grayscale"}`} style={{ fontSize: "36cqw" }}>
        {badge.emoji}
      </span>
      {!earned && (
        <span className="absolute -bottom-[2%] -right-[2%] grid h-[34%] w-[34%] place-items-center rounded-full border border-(--line) bg-(--card)" style={{ fontSize: "15cqw" }}>
          🔒
        </span>
      )}
    </span>
  );
};
