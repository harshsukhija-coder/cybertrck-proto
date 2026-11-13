import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import { FileIcon, FolderIcon, TerminalIcon, ToolsFolderIcon, TrashIcon } from "../icons/DesktopIcons";
import DesktopWidgets from "./desktop-widgets";
import FolderWindow, { type FolderItem } from "./folder-window";
import { useClock } from "./use-clock";
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

type WindowState = "closed" | "open" | "minimized";
type WindowId = "folder" | "nmap";

type DesktopProps = {
  username: string;
  onLogout: () => void;
};

const Desktop = ({ username, onLogout }: DesktopProps) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [folderState, setFolderState] = useState<WindowState>("closed");
  const [nmapState, setNmapState] = useState<WindowState>("closed");
  const [front, setFront] = useState<WindowId>("folder");
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const clock = formatClock(useClock());
  const { privateIp, online, mbps, testing, runSpeedTest } = useNetworkStatus();
  const toastTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (text: string) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text });
    toastTimer.current = window.setTimeout(() => setToast(null), 3500);
  };

  const openApp = (app: DesktopApp) => {
    if (app.id === "cyber-tools") {
      setFolderState("open");
      setFront("folder");
      return;
    }
    if (app.message) showToast(app.message);
  };

  const openFolderItem = (item: FolderItem) => {
    if (item.lockedMessage) {
      showToast(item.lockedMessage);
      return;
    }
    setNmapState("open");
    setFront("nmap");
  };

  // Taskbar button: open/raise a hidden or background window, minimize the one already in front
  const toggleTask = (id: WindowId, state: WindowState, setState: (state: WindowState) => void) => {
    if (state === "open" && front === id) {
      setState("minimized");
      return;
    }
    setState("open");
    setFront(id);
  };

  const tasks = [
    { id: "folder" as const, label: "cyber-tools", state: folderState, setState: setFolderState },
    { id: "nmap" as const, label: "nMap", state: nmapState, setState: setNmapState },
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-void select-none">
      {/* Wallpaper */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(61,220,132,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(61,220,132,0.035)_1px,transparent_1px)] bg-size-[40px_40px]" />
      <pre className="pointer-events-none absolute right-10 bottom-16 hidden text-xs lg:right-[23rem] leading-tight text-neon/15 md:block">
        {wallpaperArt}
        {"\n\nevery network reveals secrets,\nif you know how to listen."}
      </pre>

      {/* Top panel */}
      <header className="relative z-20 flex h-8 items-center justify-between border-b border-neon/15 bg-black/60 px-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="mr-2 font-semibold text-neon">⌬ offtrck</span>
          {tasks.map(task => task.state !== "closed" && (
            <button
              key={task.id}
              className={`rounded px-2 py-0.5 transition-colors ${task.state === "open" ? "bg-neon/10 text-neon" : "text-neon/50 hover:bg-neon/5"}`}
              onClick={() => toggleTask(task.id, task.state, task.setState)}
            >
              {task.label}
            </button>
          ))}
        </div>
        <span className="absolute left-1/2 hidden -translate-x-1/2 text-neon/70 xl:inline">{clock}</span>
        <div className="flex items-center gap-4 text-neon/40">
          <span className="hidden text-neon/70 md:inline xl:hidden">{clock}</span>
          <button
            className="rounded px-1 tabular-nums hover:bg-neon/10"
            onClick={runSpeedTest}
            title="click to test speed again"
          >
            {!online ? (
              <span className="text-danger">offline</span>
            ) : (
              <>↓ <span className="text-neon/80">{testing && mbps === null ? "testing..." : mbps === null ? "--" : `${mbps.toFixed(1)} Mbps`}</span></>
            )}
          </button>
          <span><span className="hidden sm:inline">wlan0 </span><span className="text-neon/80">{privateIp}</span></span>
          <span className="hidden lg:inline">vpn <span className="text-danger">off</span></span>
          <span className="hidden lg:inline">bat 87%</span>
          <span className="text-neon/80">{username}</span>
          <button className="rounded px-1.5 py-0.5 text-neon/50 hover:bg-neon/10 hover:text-neon" onClick={onLogout}>
            log out
          </button>
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
                className={`group flex w-24 flex-col items-center gap-1.5 rounded-lg border p-2 outline-none transition-colors ${isSelected ? "border-neon/30 bg-neon/10" : "border-transparent hover:bg-neon/5"}`}
              >
                <app.Icon className={`h-10 w-10 ${app.id === "cyber-tools" ? "text-neon" : "text-neon/50"}`} />
                <span className={`rounded px-1 text-xs ${isSelected ? "bg-neon/20 text-neon" : "text-neon/70"}`}>{app.label}</span>
              </button>
            );
          })}
        </div>

        <DesktopWidgets />

        {folderState === "closed" && nmapState === "closed" && (
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm lg:left-[calc(50%-10.5rem)] text-neon/40">
            double-click <span className="text-neon">cyber-tools</span> to start<span className="animate-blink">_</span>
          </p>
        )}

        {folderState !== "closed" && (
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center lg:pr-[21rem] ${front === "folder" ? "z-20" : "z-10"}`}
            onMouseDownCapture={() => setFront("folder")}
          >
            <div className="-translate-y-10 md:-translate-x-24 md:-translate-y-16">
              <FolderWindow
                minimized={folderState === "minimized"}
                onOpenItem={openFolderItem}
                onMinimize={() => setFolderState("minimized")}
                onClose={() => setFolderState("closed")}
              />
            </div>
          </div>
        )}

        {nmapState !== "closed" && (
          <div
            className={`pointer-events-none absolute inset-0 flex items-center justify-center lg:pr-[21rem] ${front === "nmap" ? "z-20" : "z-10"}`}
            onMouseDownCapture={() => setFront("nmap")}
          >
            <Window
              title="nMap"
              username={username}
              minimized={nmapState === "minimized"}
              onMinimize={() => setNmapState("minimized")}
              onClose={() => setNmapState("closed")}
            />
          </div>
        )}
      </main>

      {toast && (
        <div key={toast.id} className="animate-toast absolute top-11 right-4 z-30 max-w-sm rounded border border-neon/20 bg-panel px-4 py-3 text-sm text-slate-300">
          <span className="text-neon/60">[notify]</span> {toast.text}
        </div>
      )}
    </div>
  );
};

export default Desktop;
