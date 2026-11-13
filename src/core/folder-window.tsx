import { useRef, useState, type ComponentType, type SVGProps } from "react";
import Draggable from "react-draggable";
import { LockIcon, NmapIcon, ToolsFolderIcon } from "../icons/DesktopIcons";

export type FolderItem = {
  id: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
  // Locked tools only print a hint when opened
  lockedMessage?: string;
};

const cyberTools: FolderItem[] = [
  { id: "nmap", label: "nMap", Icon: NmapIcon, description: "network mapper · finds devices and open ports" },
  {
    id: "wireshark",
    label: "wireshark",
    Icon: LockIcon,
    description: "packet sniffer",
    lockedMessage: "wireshark is locked. ramesh will unlock it in a later chapter.",
  },
  {
    id: "hydra",
    label: "hydra",
    Icon: LockIcon,
    description: "password tester",
    lockedMessage: "hydra is locked. 'first learn to knock, then learn to pick locks.' - ramesh",
  },
  {
    id: "metasploit",
    label: "metasploit",
    Icon: LockIcon,
    description: "exploit framework",
    lockedMessage: "metasploit is locked. friday is not ready for this one yet.",
  },
];

type FolderWindowProps = {
  minimized: boolean;
  onOpenItem: (item: FolderItem) => void;
  onMinimize: () => void;
  onClose: () => void;
};

const FolderWindow = ({ minimized, onOpenItem, onMinimize, onClose }: FolderWindowProps) => {
  const windowRef = useRef(null);
  const [selected, setSelected] = useState<string | null>(null);
  const selectedItem = cyberTools.find(item => item.id === selected);

  const handleWindowButton = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  return (
    <Draggable nodeRef={windowRef} handle=".window-handle" cancel=".window-button">
      <div className={`pointer-events-auto w-[min(36rem,92vw)] ${minimized ? "hidden" : ""}`} ref={windowRef}>
        <div className="animate-window-open flex h-[min(60vh,26rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel">
          {/* Header */}
          <div className="window-handle flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-neon/15 bg-neon/[0.04] px-3 text-xs active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <ToolsFolderIcon className="h-4 w-4 text-neon" />
              <span className="font-semibold text-neon">cyber-tools</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="window-button grid h-6 w-6 place-items-center rounded text-neon/50 hover:bg-neon/10 hover:text-neon"
                onClick={handleWindowButton(onMinimize)}
                aria-label="minimize"
              >
                —
              </button>
              <button
                className="window-button grid h-6 w-6 place-items-center rounded text-neon/50 hover:bg-danger hover:text-white"
                onClick={handleWindowButton(onClose)}
                aria-label="close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Path bar */}
          <div className="flex h-8 shrink-0 items-center gap-2 border-b border-neon/10 px-3 text-xs">
            <span className="text-neon/40">location</span>
            <span className="rounded border border-neon/15 px-2 py-0.5 text-neon/80">/home/friday/cyber-tools</span>
          </div>

          {/* Items */}
          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-3" onClick={() => setSelected(null)}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
              {cyberTools.map(item => {
                const isSelected = selected === item.id;
                const locked = Boolean(item.lockedMessage);
                return (
                  <button
                    key={item.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelected(item.id);
                    }}
                    onDoubleClick={() => onOpenItem(item)}
                    onKeyDown={(event) => event.key === "Enter" && onOpenItem(item)}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 outline-none transition-colors ${isSelected ? "border-neon/30 bg-neon/10" : "border-transparent hover:bg-neon/5"}`}
                  >
                    <item.Icon className={`h-10 w-10 ${locked ? "text-neon/25" : "text-neon"}`} />
                    <span className={`rounded px-1 text-xs ${isSelected ? "bg-neon/20 text-neon" : locked ? "text-neon/40" : "text-neon/80"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status bar */}
          <div className="flex h-7 shrink-0 items-center justify-between border-t border-neon/10 px-3 text-xs text-neon/40">
            <span className="truncate">
              {selectedItem
                ? `${selectedItem.label} · ${selectedItem.description}${selectedItem.lockedMessage ? " · locked" : ""}`
                : `${cyberTools.length} items · double-click to open`}
            </span>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default FolderWindow;
