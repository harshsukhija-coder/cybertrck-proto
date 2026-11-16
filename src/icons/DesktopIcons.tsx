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

export const NmapIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" opacity="0.6" />
    <path d="M12 12 18.4 5.6" />
    <circle cx="16" cy="9" r="1" fill="currentColor" />
    <circle cx="8" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="0.8" fill="currentColor" />
  </svg>
);

export const FolderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);

export const ToolsFolderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="m9 11-2 2 2 2M15 11l2 2-2 2M13 10.5l-2 5" opacity="0.8" />
  </svg>
);

export const ConceptsFolderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M12 10.5a2 2 0 0 0-1.2 3.6V15h2.4v-.9a2 2 0 0 0-1.2-3.6z" opacity="0.8" />
    <path d="M11.2 16.5h1.6" opacity="0.8" />
  </svg>
);

export const AttacksFolderIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="m9.5 16 2.5-7 2.5 7" opacity="0.85" />
    <path d="M10.2 14h3.6" opacity="0.85" />
  </svg>
);

export const TrojanIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="5" y="7" width="14" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 7V4M9 4h6" opacity="0.8" />
    <path d="m8 16 1.5-2M16 16l-1.5-2" opacity="0.7" />
  </svg>
);

export const MitmIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="9" width="5" height="6" rx="1" />
    <rect x="16" y="9" width="5" height="6" rx="1" />
    <circle cx="12" cy="12" r="2.4" />
    <path d="M8 12h1.5M14.5 12H16" opacity="0.85" />
    <path d="M12 6v2.2M12 15.8V18" opacity="0.55" />
  </svg>
);

export const EncryptionIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    <path d="M8 15.5h1M11 15.5h1M14 15.5h2" opacity="0.8" />
  </svg>
);

export const WifiIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 9.5a9 9 0 0 1 14 0" />
    <path d="M7.8 12.5a5.5 5.5 0 0 1 8.4 0" />
    <path d="M10.5 15.4a2.2 2.2 0 0 1 3 0" />
    <circle cx="12" cy="18" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const VpnIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 12h4" />
    <path d="M16 12h4" />
    <rect x="8" y="8" width="8" height="8" rx="2" />
    <path d="M10 12h4" opacity="0.7" />
    <path d="M12 4v2M12 18v2" opacity="0.5" />
  </svg>
);

export const LockIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const FirewallIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 3 5 6v5c0 4.5 2.9 7.8 7 9 4.1-1.2 7-4.5 7-9V6z" />
    <path d="M9 12h6M12 9v6" opacity="0.75" />
  </svg>
);

export const FileIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const TerminalIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M13 15h4" />
  </svg>
);

export const TrashIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </svg>
);
