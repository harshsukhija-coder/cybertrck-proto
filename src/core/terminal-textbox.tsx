import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { CommandIcon } from "../icons/CommandIcon";
import { useIsMobile, useKeyboardInset } from "./use-media";

type MobileAction = {
  label: string;
  value?: string;
  primary?: boolean;
  hint?: string;
};

type TerminalTextBoxProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSubmit: (text: string) => void;
  busy?: boolean;
  placeholder?: string;
  // Shown next to the prompt, e.g. ~/encryption
  path?: string;
  // Tap targets so mobile users can progress without fighting the keyboard
  mobileActions?: MobileAction[];
};

const NUDGE_MS = 1800;

const TerminalTextBox = ({
  inputRef,
  onSubmit,
  busy = false,
  placeholder,
  path = "~/nmap",
  mobileActions = [],
}: TerminalTextBoxProps) => {
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();
  const [value, setValue] = useState("");
  const [nudged, setNudged] = useState(false);
  const [showCommand, setShowCommand] = useState(false);

  useEffect(() => {
    if (!nudged) return;
    const timer = window.setTimeout(() => setNudged(false), NUDGE_MS);
    return () => window.clearTimeout(timer);
  }, [nudged]);

  useEffect(() => {
    const handleTabDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" || event.keyCode === 9) event.preventDefault();
    };
    window.addEventListener("keydown", handleTabDown);
    return () => window.removeEventListener("keydown", handleTabDown);
  }, []);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value, inputRef]);

  useEffect(() => {
    if (!isMobile || keyboardInset === 0) return;
    window.setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 40);
  }, [keyboardInset, isMobile, inputRef]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (busy) {
      if (event.key.length === 1 || event.key === "Enter") setNudged(true);
      return;
    }
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onSubmit(value);
    setValue("");
  };

  const runAction = (action: MobileAction) => {
    if (busy) {
      setNudged(true);
      return;
    }
    onSubmit(action.value ?? "");
  };

  const preferActions = isMobile && mobileActions.length > 0 && !showCommand;
  const choiceLike = preferActions && mobileActions.length > 2 && mobileActions.every(a => /^\d+$/.test(a.label));

  return (
    <div
      className="shrink-0 border-t border-neon/15 bg-panel/95 px-2 py-1 font-jetbrains backdrop-blur-sm md:px-3 md:py-2"
      style={isMobile && keyboardInset > 0 ? { paddingBottom: Math.max(6, keyboardInset * 0.02) } : undefined}
    >
      <div className="mb-1 flex items-center gap-1.5 text-[9px] md:mb-1.5 md:text-xs">
        <span className="flex items-center gap-1 rounded border border-neon/25 bg-neon/[0.06] px-1 py-px text-neon">
          <CommandIcon /> {path}
        </span>
        <span className="hidden text-neon/40 sm:inline">friday@startup</span>
        {busy && <span className="text-neon/60">receiving<span className="animate-blink">...</span></span>}
        {busy && nudged && (
          <span className="ml-auto animate-pulse rounded border border-amber/40 bg-amber/10 px-1 py-px text-[9px] text-amber">
            story playing
          </span>
        )}
        {isMobile && !busy && (
          <button
            type="button"
            className="ml-auto rounded border border-neon/15 px-1.5 py-px text-[9px] text-neon/50"
            onClick={() => setShowCommand(v => !v)}
          >
            {showCommand ? "actions" : "kb"}
          </button>
        )}
      </div>

      {preferActions ? (
        <div className={choiceLike ? "grid grid-cols-4 gap-1" : "flex items-center justify-end gap-1.5"}>
          {mobileActions.map(action => (
            <button
              key={`${action.label}-${action.value ?? ""}`}
              type="button"
              title={action.hint}
              disabled={busy}
              onClick={() => runAction(action)}
              className={`rounded border text-[10px] font-semibold leading-none transition active:scale-[0.98] ${
                choiceLike ? "min-h-7 px-1.5 py-1.5" : "min-h-7 px-2.5 py-1.5"
              } ${
                action.primary
                  ? "border-neon/45 bg-neon/15 text-neon"
                  : "border-neon/20 bg-neon/[0.04] text-neon/75"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <div className={`flex w-full items-end gap-1.5 *:outline-none ${busy ? "opacity-60" : ""}`}>
          <span className={`pb-1.5 text-xs leading-5 ${busy ? "text-neon/40" : "text-neon"}`}>❯</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            readOnly={busy}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            enterKeyHint="send"
            placeholder={busy ? "story playing..." : placeholder}
            className={`max-h-28 w-full resize-none bg-transparent py-1 text-sm leading-5 font-medium text-slate-100 placeholder:text-neon/30 md:text-sm ${busy ? "cursor-default caret-transparent" : "caret-neon"}`}
            autoFocus={!isMobile}
          />
          {isMobile && !busy && (
            <button
              type="button"
              className="mb-0.5 shrink-0 rounded border border-neon/35 bg-neon/10 px-2 py-1 text-[11px] font-semibold text-neon"
              onClick={() => {
                onSubmit(value);
                setValue("");
              }}
            >
              send
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TerminalTextBox;
