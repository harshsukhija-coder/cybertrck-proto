import { useRef, useState } from "react";
import Draggable from "react-draggable";
import type { Folder, FolderItem } from "./folders";

type FolderWindowProps = {
  folder: Folder;
  minimized: boolean;
  mobile?: boolean;
  onOpenItem: (item: FolderItem) => void;
  onMinimize: () => void;
  onClose: () => void;
};

const FolderWindow = ({ folder, minimized, mobile = false, onOpenItem, onMinimize, onClose }: FolderWindowProps) => {
  const windowRef = useRef(null);
  const [selected, setSelected] = useState<string | null>(null);
  const items = folder.items;
  const selectedItem = items.find(item => item.id === selected);

  const handleWindowButton = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  const shell = (
    <div
      className={`pointer-events-auto ${
        mobile
          ? `animate-screen-push flex h-full w-full flex-col overflow-hidden bg-panel ${minimized ? "hidden" : ""}`
          : `w-[min(36rem,92vw)] ${minimized ? "hidden" : ""}`
      }`}
      ref={windowRef}
    >
      <div
        className={
          mobile
            ? "flex h-full flex-col overflow-hidden border-t border-neon/20 bg-panel"
            : "animate-window-open flex h-[min(60vh,26rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel"
        }
      >
        {/* Header */}
        <div
          className={`flex h-8 shrink-0 items-center justify-between border-b border-neon/15 bg-neon/[0.04] px-2 text-[11px] md:h-10 md:px-3 md:text-xs ${
            mobile ? "" : "window-handle cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="flex min-w-0 items-center gap-1.5">
            {mobile && (
              <button
                type="button"
                className="window-button grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] leading-none text-neon/70 hover:bg-neon/10 hover:text-neon"
                onClick={handleWindowButton(onClose)}
                aria-label="back"
              >
                ←
              </button>
            )}
            <folder.Icon className="h-3.5 w-3.5 shrink-0 text-neon md:h-4 md:w-4" />
            <span className="truncate font-semibold text-neon">{folder.label}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {!mobile && (
              <button
                className="window-button grid h-6 w-6 place-items-center rounded text-neon/50 hover:bg-neon/10 hover:text-neon"
                onClick={handleWindowButton(onMinimize)}
                aria-label="minimize"
              >
                —
              </button>
            )}
            <button
              className="window-button grid h-5 w-5 place-items-center rounded text-[10px] leading-none text-neon/50 hover:bg-danger hover:text-white md:h-6 md:w-6 md:text-xs"
              onClick={handleWindowButton(onClose)}
              aria-label="close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Path bar — compact on mobile */}
        <div className="flex h-6 shrink-0 items-center gap-1.5 border-b border-neon/10 px-2 text-[10px] md:h-8 md:gap-2 md:px-3 md:text-xs">
          <span className="text-neon/40">loc</span>
          <span className="truncate rounded border border-neon/15 px-1.5 py-px text-neon/70">{folder.path}</span>
        </div>

        {/* Items */}
        <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-1.5 md:p-3" onClick={() => !mobile && setSelected(null)}>
          <div className={`grid ${mobile ? "grid-cols-4 gap-1" : "grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2"}`}>
            {items.map(item => {
              const isSelected = selected === item.id;
              const locked = Boolean(item.lockedMessage);
              return (
                <button
                  key={item.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (mobile) {
                      onOpenItem(item);
                      return;
                    }
                    setSelected(item.id);
                  }}
                  onDoubleClick={() => !mobile && onOpenItem(item)}
                  onKeyDown={(event) => event.key === "Enter" && onOpenItem(item)}
                  className={`flex flex-col items-center gap-0.5 rounded-md border p-1 outline-none transition-colors md:gap-1.5 md:rounded-lg md:p-2 ${
                    isSelected ? "border-neon/30 bg-neon/10" : "border-transparent hover:bg-neon/5"
                  }`}
                >
                  <item.Icon className={`h-6 w-6 md:h-10 md:w-10 ${locked ? "text-neon/25" : "text-neon"}`} />
                  <span className={`rounded px-0.5 text-center text-[9px] leading-tight md:text-xs ${isSelected ? "bg-neon/20 text-neon" : locked ? "text-neon/40" : "text-neon/80"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex h-5 shrink-0 items-center justify-between border-t border-neon/10 px-2 text-[9px] text-neon/40 md:h-7 md:px-3 md:text-xs">
          <span className="truncate">
            {selectedItem
              ? `${selectedItem.label}${selectedItem.lockedMessage ? " · locked" : ""}`
              : `${items.length} items · ${mobile ? "tap" : "double-click"}`}
          </span>
        </div>
      </div>
    </div>
  );

  if (mobile) return shell;

  return (
    <Draggable nodeRef={windowRef} handle=".window-handle" cancel=".window-button">
      {shell}
    </Draggable>
  );
};

export default FolderWindow;
