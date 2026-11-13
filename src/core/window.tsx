import { useCallback, useEffect, useRef, useState } from "react";
// import { useAsciiText } from 'react-ascii-text';
import Draggable from "react-draggable";
import { NmapIcon } from "../icons/DesktopIcons";
import MessageBlock from "./message-block";
import { story, type StoryMessage } from "./story";
import TerminalTextBox from "./terminal-textbox";

const MESSAGE_GAP_MS = 650;

type ChatMessage = StoryMessage & { id: number; time: string };

const currentTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

type WindowProps = {
  title: string;
  minimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
};

const Window = ({ title, minimized, onMinimize, onClose }: WindowProps) => {
  const windowRef = useRef(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);
  const nextId = useRef(0);

  // The intro scene starts playing on mount
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [nextScene, setNextScene] = useState(1);
  const [busy, setBusy] = useState(true);

  // const asciiTextRef = useAsciiText({
  //   text: "nmap",
  //   isAnimated: false
  // });

  const addMessage = useCallback((message: StoryMessage) => {
    setMessages(prev => [...prev, { ...message, id: nextId.current++, time: currentTime() }]);
  }, []);

  // Messages of a scene pop up one after another, like output streaming into a terminal
  const revealScene = useCallback((index: number) => {
    const scene = story[index];
    scene.forEach((message, i) => {
      const timer = window.setTimeout(() => {
        addMessage(message);
        if (i === scene.length - 1) setBusy(false);
      }, 150 + i * MESSAGE_GAP_MS);
      timers.current.push(timer);
    });
  }, [addMessage]);

  const playScene = (index: number) => {
    setBusy(true);
    setNextScene(index + 1);
    revealScene(index);
  };

  useEffect(() => {
    revealScene(0);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [revealScene]);

  // Coming back from minimized should put the cursor straight back in the input
  useEffect(() => {
    if (!minimized) inputRef.current?.focus();
  }, [minimized]);

  const storyDone = nextScene >= story.length;

  const handleSubmit = (input: string) => {
    const text = input.trim();
    if (text) addMessage({ from: "you", text });

    if (text.toLowerCase() === "restart" || text.toLowerCase() === "clear") {
      setMessages([]);
      playScene(0);
      return;
    }

    if (storyDone) {
      addMessage({ from: "system", text: "that's all for now. type 'restart' to play again." });
      return;
    }

    playScene(nextScene);
  };

  // Clicking anywhere on the window puts the cursor back in the input, unless the user is selecting text
  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  const handleWindowButton = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  return (
    <Draggable nodeRef={windowRef} handle=".window-handle" cancel=".window-button">
      <div className={`pointer-events-auto w-[min(48rem,92vw)] ${minimized ? "hidden" : ""}`} ref={windowRef} onClick={focusInput}>
        <div className="animate-window-open flex h-[min(75vh,44rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel">
          {/* Header */}
          <div className="window-handle flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-neon/15 bg-neon/[0.04] px-3 text-xs active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <NmapIcon className="h-4 w-4 text-neon" />
              <span className="font-semibold text-neon">{title}</span>
              <span className="text-neon/40">friday@startup: ~/nmap</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="mr-2 rounded border border-neon/20 px-1.5 py-0.5 text-neon/60">target 192.168.1.0/24</span>
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
          {/* Body */}
          {/*<div className="px-2 py-1">
            <pre ref={asciiTextRef}></pre>
          </div>*/}
          {/* column-reverse keeps the list pinned to the bottom as new messages grow in */}
          <div className="thin-scrollbar flex min-h-0 flex-1 flex-col-reverse overflow-y-auto">
            <div>
              {messages.map(message => (
                <MessageBlock key={message.id} message={message} time={message.time} />
              ))}
            </div>
          </div>
          <TerminalTextBox
            inputRef={inputRef}
            onSubmit={handleSubmit}
            busy={busy}
            placeholder={busy ? "" : storyDone ? "type 'restart' to play again" : "press enter to continue..."}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
