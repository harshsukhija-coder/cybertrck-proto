import { forwardRef, useCallback, useState, type CSSProperties, type ReactNode } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { BadgeToast } from "./badges/badge-toast";
import { useBadgeWatcher } from "./badges/use-badges";
import { BookIcon, GamepadIcon, HomeIcon, MedalIcon, MonitorIcon, PaletteIcon, RouteIcon, SparkIcon } from "./feed-icons";
import { ThemeSheet } from "./theme-sheet";

/** Any button that opens the theme sheet */
const ThemeButton = ({ className, children }: { className: string; children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button type="button" title="theme" aria-label="Change theme" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <ThemeSheet onClose={close} />}
    </>
  );
};

export type Section = "feed" | "learn" | "paths" | "games" | "badges";

const NAV = [
  { href: "#/feed", label: "home", section: "feed", Icon: HomeIcon },
  { href: "#/feed/courses", label: "learn", section: "learn", Icon: BookIcon },
  { href: "#/feed/paths", label: "paths", section: "paths", Icon: RouteIcon },
  { href: "#/feed/games", label: "games", section: "games", Icon: GamepadIcon },
  { href: "#/feed/badges", label: "badges", section: "badges", Icon: MedalIcon },
] as const;

type NavProps = { active?: Section; username: string; onLogout: () => void };

const SideNav = ({ active, username, onLogout }: NavProps) => (
  <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col border-r border-(--line) px-3 py-6 md:flex xl:w-60 xl:px-5">
    <a href="#/feed" className="flex items-center gap-2.5 px-3 font-display text-lg font-bold tracking-tight">
      <OfftrckMark className="h-6 w-6 shrink-0 text-(--gem)" />
      <span className="hidden xl:inline">offtrck</span>
    </a>
    <nav className="mt-10 flex flex-col gap-1.5">
      {NAV.map(({ href, label, section, Icon }) => {
        const on = section === active;
        return (
          <a
            key={section}
            href={href}
            title={label}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-4 rounded-2xl px-3 py-3 text-[15px] transition-colors hover:bg-white/5 ${
              on ? "bg-white/[0.06] font-bold" : "text-(--muted) hover:text-(--fg)"
            }`}
          >
            <Icon filled={on} className={`h-6 w-6 shrink-0 ${on ? "text-(--gem)" : ""}`} />
            <span className="hidden xl:inline">{label}</span>
          </a>
        );
      })}
    </nav>

    <div className="mt-auto flex flex-col gap-1">
      <ThemeButton className="flex items-center gap-4 rounded-2xl px-3 py-2.5 text-sm text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)">
        <PaletteIcon className="h-5 w-5 shrink-0" />
        <span className="hidden xl:inline">theme</span>
      </ThemeButton>
      <a
        href="#/feed/start"
        title="edit my vibe"
        className="flex items-center gap-4 rounded-2xl px-3 py-2.5 text-sm text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)"
      >
        <SparkIcon className="h-5 w-5 shrink-0" />
        <span className="hidden xl:inline">edit my vibe</span>
      </a>
      <a
        href="#/"
        title="classic desktop"
        className="flex items-center gap-4 rounded-2xl px-3 py-2.5 text-sm text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)"
      >
        <MonitorIcon className="h-5 w-5 shrink-0" />
        <span className="hidden xl:inline">classic desktop</span>
      </a>
      <a
        href="#/term"
        title="terminal mode"
        className="flex items-center gap-4 rounded-2xl px-3 py-2.5 text-sm text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)"
      >
        <span className="grid h-5 w-5 shrink-0 place-items-center font-jetbrains text-[13px] font-bold">&gt;_</span>
        <span className="hidden xl:inline">terminal mode</span>
      </a>
      <div className="mt-3 flex items-center gap-3 rounded-2xl px-2 py-2 xl:border xl:border-(--line) xl:bg-(--panel)">
        <a href="#/feed/badges" title="your profile" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 font-display text-sm font-bold uppercase">
          {username[0]}
        </a>
        <div className="hidden min-w-0 flex-1 xl:block">
          <p className="truncate text-sm font-semibold">{username}</p>
          <button type="button" onClick={onLogout} className="text-xs text-(--muted) hover:text-(--fg)">
            log out
          </button>
        </div>
      </div>
    </div>
  </aside>
);

const MobileTopBar = ({ username, onLogout }: Omit<NavProps, "active">) => {
  const [open, setOpen] = useState(false);
  const item = "block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-white/5";
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--line) bg-(--bg)/70 px-4 backdrop-blur-xl md:hidden">
      <a href="#/feed" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
        <OfftrckMark className="h-5 w-5 text-(--gem)" />
        offtrck
      </a>
      <div className="relative flex items-center gap-1.5">
        <ThemeButton className="grid h-9 w-9 place-items-center rounded-full text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)">
          <PaletteIcon className="h-5 w-5" />
        </ThemeButton>
        <button
          type="button"
          aria-label="Account menu"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="grid h-8 w-8 place-items-center rounded-full bg-white/10 font-display text-xs font-bold uppercase"
        >
          {username[0]}
        </button>
        {open && (
          <div className="absolute right-0 top-11 w-52 animate-pop rounded-2xl border border-(--line) bg-(--surface) p-1.5 shadow-2xl" onClick={() => setOpen(false)}>
            <p className="truncate px-3 py-2 text-xs text-(--muted)">signed in as {username}</p>
            <a href="#/feed/start" className={item}>
              edit my vibe
            </a>
            <a href="#/" className={item}>
              classic desktop
            </a>
            <button type="button" onClick={onLogout} className={item}>
              log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const MobileTabBar = ({ active }: { active?: Section }) => (
  <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-(--line) bg-(--bg)/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
    {NAV.map(({ href, label, section, Icon }) => {
      const on = section === active;
      return (
        <a
          key={section}
          href={href}
          aria-current={on ? "page" : undefined}
          className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${on ? "text-(--fg)" : "text-(--muted)"}`}
        >
          {on && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-(--gem)" />}
          <Icon filled={on} className={`h-6 w-6 ${on ? "text-(--gem)" : ""}`} />
          {label}
        </a>
      );
    })}
  </nav>
);

const WIDTH = { narrow: "max-w-[520px]", wide: "max-w-3xl", full: "max-w-none" } as const;

type ShellProps = NavProps & {
  gemColor: string;
  width: keyof typeof WIDTH;
  rail?: ReactNode;
  children: ReactNode;
};

/** The frame around every signed-in page: side menu, phone tab bar and the badge pop-up */
export const AppShell = forwardRef<HTMLDivElement, ShellProps>(({ active, username, onLogout, gemColor, width, rail, children }, ref) => {
  const { fresh, dismiss } = useBadgeWatcher();
  return (
    <div ref={ref} style={{ "--gem": gemColor } as CSSProperties} className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe">
      <div className="cv-grid pointer-events-none fixed inset-x-0 top-0 h-[700px]" aria-hidden />

      <div className="relative flex min-h-full">
        <SideNav active={active} username={username} onLogout={onLogout} />
        <div className="min-w-0 flex-1">
          <MobileTopBar username={username} onLogout={onLogout} />
          <main className={`mx-auto w-full pb-28 md:pb-12 ${width === "full" ? "" : `pt-4 sm:px-4 sm:pt-8 ${WIDTH[width]}`}`}>{children}</main>
        </div>
        {rail}
      </div>

      <MobileTabBar active={active} />
      <BadgeToast ids={fresh} onClose={dismiss} />
    </div>
  );
});
AppShell.displayName = "AppShell";
