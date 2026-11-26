import { useRef } from "react";
import Draggable from "react-draggable";
import TerminalPage, { type Frame } from "./terminal-page";

type Props = Frame & { username: string; onLogout: () => void };

/** The full offtrck terminal as a draggable window on the classic desktop */
const TerminalWindow = ({ username, onLogout, onMinimize, onClose }: Props) => {
  const windowRef = useRef<HTMLDivElement>(null);
  return (
    <Draggable nodeRef={windowRef} handle=".window-handle" cancel=".window-button">
      <div ref={windowRef} className="pointer-events-auto h-[min(80vh,46rem)] w-[min(60rem,92vw)] animate-window-open overflow-hidden rounded-lg border border-neon/20 shadow-2xl shadow-black/60">
        <TerminalPage username={username} onLogin={() => {}} onLogout={onLogout} frame={{ onMinimize, onClose }} />
      </div>
    </Draggable>
  );
};

export default TerminalWindow;
