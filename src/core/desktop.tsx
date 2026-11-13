import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { FileIcon, FolderIcon, NmapIcon, TerminalIcon, TrashIcon } from "../icons/DesktopIcons";
import Window from "./window";

type DesktopApp = {
  id: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Apps without a window just print a message when opened
  message?: string;
};

const apps: DesktopApp[] = [
  { id: "nmap", label: "nMap", Icon: NmapIcon },
  { id: "terminal", label: "terminal", Icon: TerminalIcon, message: "bash: permission denied. finish nMap first." },
  { id: "home", label: "home", Icon: FolderIcon, message: "/home/friday: 3 folders, 0 secrets (so far)." },
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

const Desktop = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [nmapState, setNmapState] = useState<"closed" | "open" | "minimized">("closed");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const toastTimer = useRef<number>(undefined);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock(new Date())), 10_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const openApp = (app: DesktopApp) => {
    if (app.id === "nmap") {
      setNmapState("open");
      return;
    }
    if (app.message) showToast(app.message);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-void select-none">
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(0,255,156,0.12),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(34,211,238,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,156,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,156,0.05)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
      <pre className="pointer-events-none absolute right-10 bottom-16 hidden text-xs leading-tight text-neon/30 md:block">
        {wallpaperArt}
        {"\n\nevery network reveals secrets,\nif you know how to listen."}
      </pre>

      {/* Top panel */}
      <header className="relative z-20 flex h-8 items-center justify-between border-b border-neon/15 bg-black/70 px-3 text-xs backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="font-bold text-neon neon-text">⌬ saiphex.innovations</span>
          {nmapState !== "closed" && (
            <button
              className={`rounded px-2 py-0.5 transition-colors ${nmapState === "open" ? "bg-neon/15 text-neon" : "text-neon/50 hover:bg-neon/10"}`}
              onClick={() => setNmapState(nmapState === "open" ? "minimized" : "open")}
            >
              nMap
            </button>
          )}
        </div>
        <span className="absolute left-1/2 hidden -translate-x-1/2 text-neon/80 lg:inline">{clock}</span>
        <div className="flex items-center gap-4 text-neon/60">
          <span className="text-neon/80 lg:hidden">{clock}</span>
          <span className="hidden md:inline">wlan0 <span className="text-neon">192.168.1.23</span></span>
          <span className="hidden md:inline">vpn <span className="text-danger">off</span></span>
          <span className="hidden sm:inline">bat 87%</span>
        </div>
      </header>

      {/* Desktop icons */}
      <main className="relative z-10 h-[calc(100vh-2rem)]" onClick={() => setSelected(null)}>
        <div className="flex w-fit flex-col flex-wrap gap-2 p-4">
          {apps.map(app => {
            const isSelected = selected === app.id;
            return (
              <button
                key={app.id}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(app.id);
                }}
                onDoubleClick={() => openApp(app)}
                onKeyDown={(event) => event.key === "Enter" && openApp(app)}
                className={`group flex w-24 flex-col items-center gap-1.5 rounded-lg border p-2 outline-none transition-colors ${isSelected ? "border-neon/40 bg-neon/10" : "border-transparent hover:bg-neon/5"}`}
              >
                <app.Icon className={`h-10 w-10 ${app.id === "nmap" ? "text-neon drop-shadow-[0_0_8px_rgba(0,255,156,0.7)]" : "text-neon/60"}`} />
                <span className={`rounded px-1 text-xs ${isSelected ? "bg-neon text-black" : "text-neon/80"}`}>{app.label}</span>
              </button>
            );
          })}
        </div>

        {nmapState === "closed" && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-neon/50">
            double-click <span className="text-neon neon-text">nMap</span> to start<span className="animate-blink">_</span>
          </p>
        )}

        {nmapState !== "closed" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Window
              title="nMap"
              minimized={nmapState === "minimized"}
              onMinimize={() => setNmapState("minimized")}
              onClose={() => setNmapState("closed")}
            />
          </div>
        )}
      </main>

      {toast && (
        <div key={toast.id} className="animate-toast absolute top-11 right-4 z-30 max-w-sm rounded-lg border border-neon/25 bg-black/85 px-4 py-3 text-sm text-neon shadow-[0_0_30px_-8px_rgba(0,255,156,0.5)] backdrop-blur">
          <span className="text-neon/50">[notify]</span> {toast.text}
        </div>
      )}

      <div className="crt-overlay pointer-events-none fixed inset-0 z-50" />
    </div>
  );
};

export default Desktop;
