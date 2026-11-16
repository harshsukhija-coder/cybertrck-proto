import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { AttacksFolderIcon, ConceptsFolderIcon, FileIcon, FolderIcon, TerminalIcon, ToolsFolderIcon, TrashIcon } from "../icons/DesktopIcons";
import { encryptionCourse, firewallCourse, nmapCourse, trojanCourse, vpnCourse, wifiCourse } from "./courses";
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
  const clock = formatClock(useClock());
  const { privateIp, online, mbps, testing, runSpeedTest } = useNetworkStatus();
  const toastTimer = useRef<number>(undefined);
  const mainRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  // Phone pattern: hide top bar while scrolling down, bring it back on scroll up
  useEffect(() => {
    if (!isMobile) return;
    const node = mainRef.current;
    if (!node) return;

    const onScroll = () => {
      const y = node.scrollTop;
      const delta = y - lastScrollY.current;
      if (y < 8) setNavHidden(false);
      else if (delta > 6) setNavHidden(true);
      else if (delta < -6) setNavHidden(false);
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
  const hideNav = isMobile && (navHidden || mobileCovered);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void select-none">
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,220,132,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(61,220,132,0.035)_1px,transparent_1px)] bg-size-[40px_40px]" />
      <pre className="pointer-events-none absolute right-10 bottom-16 hidden text-xs lg:right-[23rem] leading-tight text-neon/15 md:block">
        {wallpaperArt}
        {"\n\nevery network reveals secrets,\nif you know how to listen."}
      </pre>

      {/* Top panel — slides away on scroll; fully tucks under fullscreen mobile screens */}
      <header
        className={`absolute inset-x-0 top-0 z-30 flex h-9 items-center justify-between gap-2 border-b border-neon/15 bg-black/75 px-2.5 text-[11px] backdrop-blur-md transition-transform duration-200 md:relative md:h-8 md:px-3 md:text-xs md:backdrop-blur-none ${
          hideNav ? "-translate-y-full md:translate-y-0" : "translate-y-0"
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          <span className="mr-0.5 shrink-0 font-semibold text-neon">⌬ offtrck</span>
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
        <span className="absolute left-1/2 hidden -translate-x-1/2 text-neon/70 xl:inline">{clock}</span>
        <div className="flex shrink-0 items-center gap-1.5 text-neon/40 sm:gap-3">
          <span className="hidden text-neon/70 md:inline xl:hidden">{clock}</span>
          <button
            className="hidden rounded px-1 tabular-nums hover:bg-neon/10 sm:inline"
            onClick={runSpeedTest}
            title="click to test speed again"
          >
            {!online ? (
              <span className="text-danger">offline</span>
            ) : (
              <>↓ <span className="text-neon/80">{testing && mbps === null ? "testing..." : mbps === null ? "--" : `${mbps.toFixed(1)} Mbps`}</span></>
            )}
          </button>
          <span className="hidden md:inline"><span className="hidden sm:inline">wlan0 </span><span className="text-neon/80">{privateIp}</span></span>
          <span className="max-w-[4.5rem] truncate text-neon/80 sm:max-w-none">{username}</span>
          <button className="rounded px-1 py-0.5 text-neon/50 hover:bg-neon/10 hover:text-neon" onClick={onLogout}>
            log out
          </button>
        </div>
      </header>

      {/* Desktop icons */}
      <main
        ref={mainRef}
        className={`relative z-10 h-dvh overflow-y-auto overscroll-contain md:h-[calc(100dvh-2rem)] md:overflow-hidden md:pt-0 ${
          mobileCovered ? "pt-0" : "pt-9"
        }`}
        onClick={() => !isMobile && setSelected(null)}
      >
        <div
          className={
            isMobile
              ? "grid grid-cols-4 gap-2 p-3"
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
                <app.Icon className={`h-7 w-7 md:h-10 md:w-10 ${app.id.startsWith("cyber-") ? "text-neon" : "text-neon/50"}`} />
                <span className={`rounded px-0.5 text-center text-[9px] leading-tight md:text-xs ${isSelected ? "bg-neon/20 text-neon" : "text-neon/70"}`}>
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
