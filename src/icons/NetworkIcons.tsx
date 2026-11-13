type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const RouterIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="13" width="18" height="7" rx="2" />
    <path d="M7 13 5 6M17 13l2-7M7 16.5h.01M10 16.5h.01" />
    <path d="M9.5 8.5a3.5 3.5 0 0 1 5 0M8 6.5a6 6 0 0 1 8 0" opacity="0.7" />
  </svg>
);

export const LaptopIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="5" width="16" height="11" rx="1.5" />
    <path d="M2 19h20" />
  </svg>
);

export const PrinterIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 9V3h10v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M7 14h10v7H7zM17.5 12h.01" />
  </svg>
);

export const ServerIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="3" width="16" height="8" rx="1.5" />
    <rect x="4" y="13" width="16" height="8" rx="1.5" />
    <path d="M8 7h.01M8 17h.01M12 7h4M12 17h4" />
  </svg>
);

export const NasIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M8 6h8M8 10h8M8 14h8" opacity="0.7" />
    <path d="M9 18h.01M12 18h.01" />
  </svg>
);

export const DesktopIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="12" rx="1.5" />
    <path d="M9 20h6M12 16v4" />
  </svg>
);

export const CloudIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1 .5 9.5z" />
  </svg>
);

export const SwitchIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <path d="M6 12h.01M9 12h.01M12 12h.01M15 12h.01M18 12h.01" />
  </svg>
);
