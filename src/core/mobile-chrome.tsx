import type { ReactNode } from "react";

/** Shared mobile header / path chrome used by folders + course windows */

const BackArrow = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M15 5 8 12l7 7"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type MobileBackHeaderProps = {
  title: string;
  icon?: ReactNode;
  onBack: () => void;
};

export const MobileBackHeader = ({ title, icon, onBack }: MobileBackHeaderProps) => (
  <header className="shrink-0 border-b border-neon/15 bg-black/70 pt-[env(safe-area-inset-top)] backdrop-blur-md">
    <div className="flex h-9 items-center gap-1 px-1.5">
      <button
        type="button"
        onClick={onBack}
        className="window-button grid h-8 w-8 shrink-0 place-items-center rounded-lg text-neon active:bg-neon/10"
        aria-label="back"
      >
        <BackArrow className="h-5 w-5" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
        {icon}
        <p className="truncate text-[13px] font-semibold leading-none tracking-wide text-neon">{title}</p>
      </div>
    </div>
  </header>
);

type PathBreadcrumbProps = {
  path: string;
};

/** Desktop-only path strip under window chrome */
export const PathBreadcrumb = ({ path }: PathBreadcrumbProps) => (
  <div className="flex h-7 shrink-0 items-center justify-center border-b border-neon/10 px-3">
    <p className="truncate text-center font-mono text-[11px] leading-none tracking-wide text-neon/45">{path}</p>
  </div>
);
