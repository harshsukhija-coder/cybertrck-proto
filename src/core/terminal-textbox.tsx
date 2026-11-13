import { useEffect, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { CommandIcon } from "../icons/CommandIcon";

type TerminalTextBoxProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onSubmit: (text: string) => void;
  busy?: boolean;
  placeholder?: string;
};

const NUDGE_MS = 1800;

const TerminalTextBox = ({ inputRef, onSubmit, busy = false, placeholder }: TerminalTextBoxProps) => {

  const [value, setValue] = useState("");
  // Flashes a reminder when someone types while the story is still playing
  const [nudged, setNudged] = useState(false);

  useEffect(() => {
    if (!nudged) return;
    const timer = window.setTimeout(() => setNudged(false), NUDGE_MS);
    return () => window.clearTimeout(timer);
  }, [nudged]);

  // Disable the default behaviour of tab while input is auto highlighted
  const handleTabDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab' || event.keyCode === 9) {
      event.preventDefault();
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleTabDown);
    return () => window.removeEventListener('keydown', handleTabDown);
  }, []);

  // Auto increase the textarea when content is exceeding
  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value, inputRef]);

  // Enter sends the message, Shift + Enter adds a new line
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

  return (
    <div className="shrink-0 border-t border-neon/15 px-3 py-2 font-jetbrains">
      <div className="mb-1.5 flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1 rounded border border-neon/25 bg-neon/[0.06] px-1.5 py-0.5 text-neon">
          <CommandIcon /> ~/nmap
        </span>
        <span className="text-neon/40">friday@startup</span>
        {busy && <span className="text-neon/60">receiving<span className="animate-blink">...</span></span>}
        {busy && nudged && (
          <span className="ml-auto animate-pulse rounded border border-amber/40 bg-amber/10 px-1.5 py-0.5 text-amber">
            hold on, the story is still playing. no input needed yet.
          </span>
        )}
      </div>
      <div className={`flex w-full items-start gap-2 *:outline-none ${busy ? "opacity-60" : ""}`}>
        <span className={`text-sm leading-5 ${busy ? "text-neon/40" : "text-neon"}`}>❯</span>
        <textarea
          ref={inputRef}
          rows={1}
          value={value}
          readOnly={busy}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={busy ? "story is playing... sit back and read, no input needed" : placeholder}
          className={`max-h-32 w-full resize-none bg-transparent text-sm leading-5 font-medium text-slate-100 placeholder:text-neon/30 ${busy ? "cursor-default caret-transparent" : "caret-neon"}`}
          autoFocus={true}
        />
      </div>
    </div>
  );
}

export default TerminalTextBox;
