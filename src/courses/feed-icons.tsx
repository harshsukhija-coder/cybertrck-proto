type IconProps = { className?: string; filled?: boolean };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const HeartIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 20.5s-7.5-4.6-9.3-9.6C1.5 7.4 3.8 4 7.2 4c2 0 3.7 1.1 4.8 2.8C13.1 5.1 14.8 4 16.8 4c3.4 0 5.7 3.4 4.5 6.9-1.8 5-9.3 9.6-9.3 9.6Z" />
  </svg>
);

export const CommentIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M20.5 11.6a8.4 8.4 0 0 1-12.3 7.4L3.5 20.5l1.5-4.6A8.4 8.4 0 1 1 20.5 11.6Z" />
  </svg>
);

export const ShareIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M21.5 3 10.2 14.3M21.5 3l-7 18.5-4.3-7.2L3 10l18.5-7Z" />
  </svg>
);

export const BookmarkIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M18.5 21 12 16.5 5.5 21V4.5A1.5 1.5 0 0 1 7 3h10a1.5 1.5 0 0 1 1.5 1.5V21Z" />
  </svg>
);

export const HomeIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1h-5v-6h-5v6h-5a1 1 0 0 1-1-1v-9.5Z" />
  </svg>
);

export const GamepadIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M7 7h10a5 5 0 0 1 4.9 6l-.8 4a2.6 2.6 0 0 1-4.5 1.2L14.5 16h-5l-2.1 2.2A2.6 2.6 0 0 1 2.9 17l-.8-4A5 5 0 0 1 7 7Z" />
    <path d="M7.5 10.5v3M6 12h3" stroke={filled ? "#000" : "currentColor"} />
    <circle cx="16" cy="11" r=".6" fill={filled ? "#000" : "currentColor"} />
    <circle cx="17.5" cy="13" r=".6" fill={filled ? "#000" : "currentColor"} />
  </svg>
);

export const BookIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" fill="none" />
  </svg>
);

export const SparkIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 2.5 14 9l6.5 2.5L14 14l-2 6.5L10 14l-6.5-2.5L10 9l2-6.5Z" />
  </svg>
);

export const MedalIcon = ({ className, filled }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M8 2.5h8l-2.2 6.2M8 2.5l2.2 6.2" />
    <circle cx="12" cy="15" r="6.5" fill={filled ? "currentColor" : "none"} />
    <path d="m12 12 .9 1.9 2 .2-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.2.9-1.9Z" stroke={filled ? "#000" : "currentColor"} strokeWidth={1.4} />
  </svg>
);

export const MonitorIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="2.5" y="4" width="19" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const DotsIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

export const VerifiedIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      fill="currentColor"
      d="m12 1.8 2.6 2 3.2-.3.9 3.1 2.8 1.6-1 3.1 1 3.1-2.8 1.6-.9 3.1-3.2-.3-2.6 2-2.6-2-3.2.3-.9-3.1-2.8-1.6 1-3.1-1-3.1 2.8-1.6.9-3.1 3.2.3 2.6-2Z"
    />
    <path d="m8 12.2 2.7 2.6L16.2 9.5" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronIcon = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);
