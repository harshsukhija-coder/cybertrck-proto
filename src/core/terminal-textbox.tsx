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
  const safeBottom =
    isMobile && keyboardInset > 0
      ? Math.max(10, keyboardInset * 0.02)
      : isMobile
        ? "max(0.65rem, env(safe-area-inset-bottom))"
        : undefined;

  return (
    <div
      className="shrink-0 border-t border-neon/15 bg-panel/95 font-jetbrains backdrop-blur-sm"
      style={typeof safeBottom === "number" ? { paddingBottom: safeBottom } : undefined}
    >
      {/* Status / path row */}
      <div className="flex items-center gap-1.5 px-2.5 pt-2 text-[10px] md:px-3 md:pt-2 md:text-xs">
        <span className="flex items-center gap-1 rounded border border-neon/25 bg-neon/[0.06] px-1.5 py-0.5 text-neon">
          <CommandIcon /> {path}
        </span>
        <span className="hidden text-neon/40 sm:inline">friday@startup</span>
        {busy && <span className="text-neon/60">receiving<span className="animate-blink">...</span></span>}
        {busy && nudged && (
          <span className="ml-auto animate-pulse rounded border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-[10px] text-amber">
            story playing
          </span>
        )}
        {isMobile && !busy && (
          <button
            type="button"
            className="ml-auto rounded border border-neon/20 px-2 py-1 text-[10px] text-neon/55"
            onClick={() => setShowCommand(v => !v)}
          >
            {showCommand ? "actions" : "kb"}
          </button>
        )}
      </div>

      {preferActions ? (
        /* Dedicated action strip — clear space, not cramped against the edge */
        <div
          className="mt-2 border-t border-neon/10 px-3 pt-3"
          style={typeof safeBottom === "string" ? { paddingBottom: safeBottom } : { paddingBottom: "0.75rem" }}
        >
          <div className={choiceLike ? "grid grid-cols-4 gap-2" : "flex flex-col gap-2"}>
            {mobileActions.map(action => (
              <button
                key={`${action.label}-${action.value ?? ""}`}
                type="button"
                title={action.hint}
                disabled={busy}
                onClick={() => runAction(action)}
                className={`rounded-md border font-semibold transition active:scale-[0.98] ${
                  choiceLike
                    ? "min-h-11 px-2 py-2.5 text-sm"
                    : "min-h-11 w-full px-4 py-2.5 text-sm"
                } ${
                  action.primary
                    ? "border-neon/50 bg-neon/15 text-neon"
                    : "border-neon/25 bg-neon/[0.05] text-neon/80"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          className={`flex w-full items-end gap-2 px-2.5 pt-1.5 md:px-3 md:pb-2 *:outline-none ${busy ? "opacity-60" : ""}`}
          style={
            typeof safeBottom === "string"
              ? { paddingBottom: safeBottom }
              : isMobile
                ? { paddingBottom: "0.65rem" }
                : undefined
          }
        >
          <span className={`pb-2 text-xs leading-5 ${busy ? "text-neon/40" : "text-neon"}`}>❯</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            readOnly={busy}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            enterKeyHint="send"
            placeholder={busy ? "story playing..." : placeholder}
            className={`max-h-28 w-full resize-none bg-transparent py-1.5 text-sm leading-5 font-medium text-slate-100 placeholder:text-neon/30 ${busy ? "cursor-default caret-transparent" : "caret-neon"}`}
            autoFocus={!isMobile}
          />
          {isMobile && !busy && (
            <button
              type="button"
              className="mb-0.5 shrink-0 rounded-md border border-neon/40 bg-neon/10 px-3 py-2 text-xs font-semibold text-neon"
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
