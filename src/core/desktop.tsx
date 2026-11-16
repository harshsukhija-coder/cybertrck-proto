import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { AttacksFolderIcon, ConceptsFolderIcon, FileIcon, FolderIcon, TerminalIcon, ToolsFolderIcon, TrashIcon } from "../icons/DesktopIcons";
import { OfftrckBrand } from "../icons/OfftrckMark";
import { encryptionCourse, firewallCourse, mitmCourse, nmapCourse, trojanCourse, vpnCourse, wifiCourse } from "./courses";
import DesktopWidgets from "./desktop-widgets";
import FolderWindow from "./folder-window";
import { cyberAttacks, cyberConcepts, cyberTools, type Folder, type FolderItem } from "./folders";
import type { Course } from "./story";
import { useClock } from "./use-clock";
import { useIsMobile } from "./use-media";
import { useNetworkStatus } from "./use-network-status";
import Window from "./window";

type DesktopApp = {
  id: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Apps without a window just print a message when opened
  message?: string;
};

const apps: DesktopApp[] = [
  { id: "cyber-tools", label: "cyber-tools", Icon: ToolsFolderIcon },
  { id: "cyber-concepts", label: "cyber-concepts", Icon: ConceptsFolderIcon },
  { id: "cyber-attacks", label: "cyber-attacks", Icon: AttacksFolderIcon },
  { id: "terminal", label: "terminal", Icon: TerminalIcon, message: "bash: permission denied. finish nMap first." },
  { id: "home", label: "home", Icon: FolderIcon, message: "/home/friday: 4 folders, 0 secrets (so far)." },
  { id: "todo", label: "todo.txt", Icon: FileIcon, message: "todo.txt -> 1. learn nmap  2. don't get fired" },
  { id: "trash", label: "trash", Icon: TrashIcon, message: "trash is empty. friday is very clean." },
];

const wallpaperArt = [
  " _ __  _ __ ___   __ _ _ __",
  "| '_ \\| '_ ` _ \\ / _` | '_ \\",
  "| | | | | | | | | (_| | |_) |",
  "|_| |_|_| |_| |_|\\__,_| .__/",
  "                      |_|",
].join("\n");

const formatClock = (date: Date) =>
  date.toLocaleString([], { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

type WindowState = "closed" | "open" | "minimized";

type WindowDef = {
  id: string;
  label: string;
  // Small offsets so stacked windows don't sit exactly on top of each other
  offset: string;
} & ({ folder: Folder; course?: never } | { course: Course; folder?: never });

const windowDefs: WindowDef[] = [
  { id: "cyber-tools", label: "cyber-tools", folder: cyberTools, offset: "-translate-y-10 md:-translate-x-24 md:-translate-y-16" },
  { id: "cyber-concepts", label: "cyber-concepts", folder: cyberConcepts, offset: "-translate-y-6 md:-translate-x-10 md:-translate-y-8" },
  { id: "cyber-attacks", label: "cyber-attacks", folder: cyberAttacks, offset: "-translate-y-2 md:translate-x-2 md:-translate-y-4" },
  { id: "nmap", label: "nMap", course: nmapCourse, offset: "" },
  { id: "encryption", label: "encryption", course: encryptionCourse, offset: "md:translate-x-4 md:translate-y-3" },
  { id: "wifi", label: "wifi passwords", course: wifiCourse, offset: "md:translate-x-8 md:translate-y-6" },
  { id: "vpn", label: "vpn", course: vpnCourse, offset: "md:translate-x-12 md:translate-y-9" },
  { id: "trojan", label: "image trojan", course: trojanCourse, offset: "md:translate-x-6 md:translate-y-12" },
  { id: "mitm", label: "man in the middle", course: mitmCourse, offset: "md:translate-x-14 md:translate-y-10" },
  { id: "firewalls", label: "firewalls", course: firewallCourse, offset: "md:translate-x-10 md:translate-y-14" },
];

type DesktopProps = {
  username: string;
  onLogout: () => void;
};

const Desktop = ({ username, onLogout }: DesktopProps) => {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<string | null>(null);
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  // Last id is the window in front
  const [stack, setStack] = useState<string[]>([]);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [navHidden, setNavHidden] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const now = useClock();
  const clock = formatClock(now);
  const shortTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  const { privateIp, online, mbps, testing, runSpeedTest } = useNetworkStatus();
  const toastTimer = useRef<number>(undefined);
  const mainRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Phone pattern: collapse chrome while scrolling; status HUD pill stays reachable
  useEffect(() => {
    if (!isMobile) return;
    const node = mainRef.current;
    if (!node) return;

    const onScroll = () => {
      const y = node.scrollTop;
      const delta = y - lastScrollY.current;
      if (y < 8) setNavHidden(false);
      else if (delta > 6) {
        setNavHidden(true);
        setStatusOpen(false);
      } else if (delta < -6) setNavHidden(false);
      lastScrollY.current = y;
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  const showToast = (text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const front = stack[stack.length - 1];
  const stateOf = (id: string) => windowStates[id] ?? "closed";
  const setWindowState = (id: string, state: WindowState) => setWindowStates(prev => ({ ...prev, [id]: state }));
  const raise = (id: string) => setStack(prev => [...prev.filter(other => other !== id), id]);

  const openWindow = (id: string) => {
    setWindowState(id, "open");
    raise(id);
  };

  const openApp = (app: DesktopApp) => {
    if (windowDefs.some(def => def.id === app.id)) {
      openWindow(app.id);
      return;
    }
    if (app.message) showToast(app.message);
  };

  const openFolderItem = (item: FolderItem) => {
    if (item.lockedMessage) {
      showToast(item.lockedMessage);
      return;
    }
    openWindow(item.id);
  };

  // Taskbar button: open/raise a hidden or background window, minimize the one already in front
  const toggleTask = (id: string) => {
    if (stateOf(id) === "open" && front === id) {
      setWindowState(id, "minimized");
      return;
    }
    openWindow(id);
  };

  const openDefs = windowDefs.filter(def => stateOf(def.id) !== "closed");
  const visibleOpen = openDefs.filter(def => stateOf(def.id) === "open");
  const mobileCovered = isMobile && visibleOpen.length > 0;
  const hideDesktopBar = isMobile && (navHidden || mobileCovered);
  const linkLabel = !online
    ? "offline"
    : testing && mbps === null
      ? "testing…"
      : mbps === null
        ? "tap test"
        : `${mbps.toFixed(1)} Mb/s`;

  const statusPanel = (
    <div className="space-y-3 px-1 pb-1 pt-2">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-neon/20 bg-neon/[0.06] px-2 py-3">
          <p className="text-[9px] tracking-[0.18em] text-neon/40 uppercase">time</p>
          <p className="mt-1 text-[13px] font-semibold tabular-nums text-neon">{shortTime}</p>
        </div>
        <button
          type="button"
          onClick={runSpeedTest}
          className="rounded-2xl border border-neon/20 bg-neon/[0.06] px-2 py-3 active:bg-neon/10"
        >
          <p className="text-[9px] tracking-[0.18em] text-neon/40 uppercase">link</p>
          <p className={`mt-1 text-[12px] font-semibold tabular-nums ${online ? "text-neon" : "text-danger"}`}>
            {linkLabel}
          </p>
        </button>
        <div className="rounded-2xl border border-neon/20 bg-neon/[0.06] px-2 py-3">
          <p className="text-[9px] tracking-[0.18em] text-neon/40 uppercase">ip</p>
          <p className="mt-1 truncate text-[11px] font-semibold tabular-nums text-neon">{privateIp.split(".").slice(-2).join(".")}</p>
        </div>
      </div>

      {openDefs.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {openDefs.map(def => (
            <button
              key={def.id}
              type="button"
              className={`min-h-9 rounded-full border px-3 text-[12px] ${
                stateOf(def.id) === "open" ? "border-neon/50 bg-neon/15 text-neon" : "border-neon/20 text-neon/60"
              }`}
              onClick={() => {
                toggleTask(def.id);
                setStatusOpen(false);
              }}
            >
              {def.label}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="min-h-10 w-full rounded-full border border-danger/30 text-[12px] font-medium text-danger/90"
        onClick={() => {
          setStatusOpen(false);
          onLogout();
        }}
      >
        log out
      </button>
    </div>
  );

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void select-none">
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,220,132,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(61,220,132,0.035)_1px,transparent_1px)] bg-size-[40px_40px]" />
      <pre className="pointer-events-none absolute right-10 bottom-16 hidden text-xs lg:right-[23rem] leading-tight text-neon/15 md:block">
        {wallpaperArt}
        {"\n\nevery network reveals secrets,\nif you know how to listen."}
      </pre>

      {/* Desktop top panel — equal left / center / right columns */}
      <header className="absolute inset-x-0 top-0 z-30 hidden h-8 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-b border-neon/15 bg-black/75 px-3 text-xs md:relative md:grid">
        <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
          <OfftrckBrand className="mr-0.5 shrink-0" markClassName="h-3.5 w-3.5" />
          {openDefs.map(def => (
            <button
              key={def.id}
              className={`shrink-0 rounded px-1.5 py-0.5 transition-colors ${stateOf(def.id) === "open" ? "bg-neon/10 text-neon" : "text-neon/50 hover:bg-neon/5"}`}
              onClick={() => toggleTask(def.id)}
            >
              {def.label}
            </button>
          ))}
        </div>
        <span className="shrink-0 tabular-nums text-neon/70">{clock}</span>
        <div className="flex min-w-0 items-center justify-end gap-3 text-neon/40">
          <button className="rounded px-1 tabular-nums hover:bg-neon/10" onClick={runSpeedTest} title="click to test speed again">
            {!online ? (
              <span className="text-danger">offline</span>
            ) : (
              <>↓ <span className="text-neon/80">{testing && mbps === null ? "testing..." : mbps === null ? "--" : `${mbps.toFixed(1)} Mbps`}</span></>
            )}
          </button>
          <span className="hidden lg:inline">wlan0 <span className="text-neon/80">{privateIp}</span></span>
          <span className="truncate text-neon/80">{username}</span>
          <button className="shrink-0 rounded px-1 py-0.5 text-neon/50 hover:bg-neon/10 hover:text-neon" onClick={onLogout}>
            log out
          </button>
        </div>
      </header>

      {/* Mobile navbar — compact single row */}
      {isMobile && !mobileCovered && (
        <div
          className={`absolute inset-x-0 top-0 z-40 border-b border-neon/15 bg-black/55 pt-[env(safe-area-inset-top)] backdrop-blur-md transition-transform duration-200 ${
            hideDesktopBar && !statusOpen ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="flex h-11 items-center gap-2 px-2.5">
            <OfftrckBrand className="min-w-0 truncate text-[13px] leading-none tracking-wide" markClassName="h-3.5 w-3.5" />

            <button
              type="button"
              aria-expanded={statusOpen}
              aria-label={statusOpen ? "close status" : "open status"}
              onClick={() => setStatusOpen(open => !open)}
              className={`ml-auto inline-flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 transition ${
                statusOpen ? "bg-neon/15 text-neon" : "text-neon/80 active:bg-neon/10"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  online ? "bg-neon shadow-[0_0_6px_rgba(61,220,132,0.9)]" : "bg-danger"
                }`}
                aria-hidden
              />
              <span className="font-mono text-[12px] font-semibold leading-none">
                {statusOpen ? "×" : ">_"}
              </span>
              <span className="text-[12px] font-medium leading-none tabular-nums">{shortTime}</span>
            </button>
          </div>

          {statusOpen && (
            <div className="border-t border-neon/10 bg-black/80 px-3 pb-3">
              <p className="pt-3 pb-2 truncate font-mono text-[11px] text-neon/55">
                <span className="text-neon">{username}@offtrck</span>
                :~$ status
                <span className="animate-blink ml-1 inline-block h-2.5 w-1.5 translate-y-px bg-neon align-middle" />
              </p>
              {statusPanel}
              <a
                href="#/team"
                className="mt-1 flex min-h-10 items-center justify-center rounded-xl border border-neon/20 font-mono text-[12px] text-neon/70"
                onClick={() => setStatusOpen(false)}
              >
                $ cat /etc/offtrck/team
              </a>
            </div>
          )}
        </div>
      )}

      {isMobile && statusOpen && !mobileCovered && (
        <button
          type="button"
          aria-label="dismiss status"
          className="absolute inset-0 z-30 bg-black/40"
          onClick={() => setStatusOpen(false)}
        />
      )}

      {/* Desktop icons */}
      <main
        ref={mainRef}
        className={`relative z-10 h-dvh overflow-y-auto overscroll-contain md:h-[calc(100dvh-2rem)] md:overflow-hidden md:pt-0 ${
          mobileCovered ? "pt-0" : "pt-[calc(2.75rem+env(safe-area-inset-top))]"
        }`}
        onClick={() => {
          if (!isMobile) setSelected(null);
          else setStatusOpen(false);
        }}
      >
        <div
          className={
            isMobile
              ? "grid grid-cols-4 gap-3 p-4"
              : "flex w-fit flex-col flex-wrap gap-2 p-4"
          }
        >
          {apps.map(app => {
            const isSelected = selected === app.id;
            return (
              <button
                key={app.id}
                onClick={(event) => {
                  event.stopPropagation();
                  if (isMobile) {
                    openApp(app);
                    return;
                  }
                  setSelected(app.id);
                }}
                onDoubleClick={() => !isMobile && openApp(app)}
                onKeyDown={(event) => event.key === "Enter" && openApp(app)}
                className={`group flex flex-col items-center gap-1 rounded-lg border p-2 outline-none transition-colors md:w-24 md:gap-1.5 md:p-2 ${
                  isSelected ? "border-neon/30 bg-neon/10" : "border-transparent hover:bg-neon/5"
                }`}
              >
                <app.Icon className={`h-8 w-8 md:h-10 md:w-10 ${app.id.startsWith("cyber-") ? "text-neon" : "text-neon/50"}`} />
                <span className={`rounded px-0.5 text-center leading-tight ${isMobile ? "text-[11px]" : "text-xs"} ${isSelected ? "bg-neon/20 text-neon" : "text-neon/70"}`}>
                  {app.label}
                </span>
              </button>
            );
          })}
        </div>

        {!isMobile && <DesktopWidgets />}

        {visibleOpen.map(def => {
          const layer = stack.indexOf(def.id) + 10;
          return (
            <div
              key={def.id}
              className={
                isMobile
                  ? "pointer-events-none absolute inset-0"
                  : "pointer-events-none absolute inset-0 flex items-center justify-center lg:pr-[21rem]"
              }
              style={{ zIndex: layer }}
              onMouseDownCapture={() => raise(def.id)}
            >
              <div className={isMobile ? "h-full w-full" : def.offset}>
                {def.folder ? (
                  <FolderWindow
                    folder={def.folder}
                    minimized={false}
                    mobile={isMobile}
                    onOpenItem={openFolderItem}
                    onMinimize={() => setWindowState(def.id, "minimized")}
                    onClose={() => setWindowState(def.id, "closed")}
                  />
                ) : (
                  <Window
                    course={def.course}
                    username={username}
                    minimized={false}
                    mobile={isMobile}
                    onMinimize={() => setWindowState(def.id, "minimized")}
                    onClose={() => setWindowState(def.id, "closed")}
                  />
                )}
              </div>
            </div>
          );
        })}
      </main>

      {toast && (
        <div
          key={toast.id}
          className="animate-toast absolute top-11 right-2 left-2 z-50 mx-auto max-w-[18rem] rounded border border-neon/20 bg-panel px-2.5 py-1.5 text-[11px] leading-snug text-slate-300 md:top-11 md:right-4 md:left-auto md:mx-0 md:max-w-sm md:px-4 md:py-3 md:text-sm"
        >
          <span className="text-neon/60">[notify]</span> {toast.text}
        </div>
      )}
    </div>
  );
};

export default Desktop;
