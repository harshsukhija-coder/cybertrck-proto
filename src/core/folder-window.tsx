import { useRef, useState } from "react";
import Draggable from "react-draggable";
import type { Folder, FolderItem } from "./folders";
import { MobileBackHeader, PathBreadcrumb } from "./mobile-chrome";

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
            ? "flex h-full flex-col overflow-hidden bg-panel"
            : "animate-window-open flex h-[min(60vh,26rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel"
        }
      >
        {mobile ? (
          <MobileBackHeader
            title={folder.label}
            icon={<folder.Icon className="h-3.5 w-3.5 shrink-0 text-neon" />}
            onBack={onClose}
          />
        ) : (
          <>
            <div className="window-handle flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-neon/15 bg-neon/[0.04] px-3 text-xs active:cursor-grabbing">
              <div className="flex min-w-0 items-center gap-2">
                <folder.Icon className="h-4 w-4 shrink-0 text-neon" />
                <span className="truncate font-semibold text-neon">{folder.label}</span>
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
            <PathBreadcrumb path={folder.path} />
          </>
        )}

        <div
          className={`thin-scrollbar min-h-0 flex-1 overflow-y-auto ${mobile ? "p-3" : "p-3"}`}
          onClick={() => !mobile && setSelected(null)}
        >
          <div className={`grid ${mobile ? "grid-cols-3 gap-2" : "grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2"}`}>
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
                  className={`flex flex-col items-center outline-none transition-colors ${
                    mobile
                      ? `min-h-[5.5rem] gap-1.5 rounded-2xl border p-2.5 active:scale-[0.98] ${
                          locked ? "border-neon/10 bg-neon/[0.02]" : "border-neon/15 bg-neon/[0.04]"
                        }`
                      : `gap-1.5 rounded-lg border p-2 ${
                          isSelected ? "border-neon/30 bg-neon/10" : "border-transparent hover:bg-neon/5"
                        }`
                  }`}
                >
                  <item.Icon className={`${mobile ? "h-9 w-9" : "h-10 w-10"} ${locked ? "text-neon/25" : "text-neon"}`} />
                  <span
                    className={`rounded px-0.5 text-center leading-tight ${
                      mobile ? "text-[11px] font-medium" : "text-xs"
                    } ${isSelected ? "bg-neon/20 text-neon" : locked ? "text-neon/40" : "text-neon/85"}`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {!mobile && (
          <div className="flex h-7 shrink-0 items-center justify-between border-t border-neon/10 px-3 text-xs text-neon/40">
            <span className="truncate">
              {selectedItem
                ? `${selectedItem.label}${selectedItem.lockedMessage ? " · locked" : ""}`
                : `${items.length} items · double-click`}
            </span>
          </div>
        )}
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
