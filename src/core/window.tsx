import { useCallback, useEffect, useRef, useState } from "react";
// import { useAsciiText } from 'react-ascii-text';
import Draggable from "react-draggable";
import { NmapIcon } from "../icons/DesktopIcons";
import MessageBlock from "./message-block";
import { chapters, PASS_SCORE, type QuizQuestion, type StoryMessage } from "./story";
import TerminalTextBox from "./terminal-textbox";

const MESSAGE_GAP_MS = 650;
const BEFORE_GLITCH_MS = 900;
const GLITCH_MS = 1800;

type ChatMessage = StoryMessage & { id: number; time: string };

type Phase = "story" | "quiz" | "failed" | "glitch";

const currentTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

const questionMessage = (quiz: QuizQuestion[], index: number): StoryMessage => {
  const { question, options } = quiz[index];
  const choices = options.map((option, i) => `${i + 1}) ${option}`).join("\n");
  return { from: "system", text: `question ${index + 1}/${quiz.length}\n${question}\n\n${choices}` };
};

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

  // The intro scene of the first chapter starts playing on mount
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [nextScene, setNextScene] = useState(1);
  const [phase, setPhase] = useState<Phase>("story");
  const [quizIndex, setQuizIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [busy, setBusy] = useState(true);

  // const asciiTextRef = useAsciiText({
  //   text: "nmap",
  //   isAnimated: false
  // });

  const chapter = chapters[chapterIndex];
  const upcomingChapter = chapters[chapterIndex + 1];
  const quiz = chapter.quiz ?? [];

  const addMessage = useCallback((message: StoryMessage) => {
    setMessages(prev => [...prev, { ...message, id: nextId.current++, time: currentTime() }]);
  }, []);

  const schedule = useCallback((delay: number, action: () => void) => {
    timers.current.push(window.setTimeout(action, delay));
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Messages pop up one after another, like output streaming into a terminal
  const reveal = useCallback((batch: StoryMessage[], onDone?: () => void) => {
    batch.forEach((message, i) => {
      schedule(150 + i * MESSAGE_GAP_MS, () => {
        addMessage(message);
        if (i < batch.length - 1) return;
        setBusy(false);
        onDone?.();
      });
    });
  }, [addMessage, schedule]);

  const say = (batch: StoryMessage[], onDone?: () => void) => {
    setBusy(true);
    reveal(batch, onDone);
  };

  useEffect(() => {
    reveal(chapters[0].scenes[0]);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [reveal]);

  // Coming back from minimized should put the cursor straight back in the input
  useEffect(() => {
    if (!minimized) inputRef.current?.focus();
  }, [minimized]);

  const chapterDone = nextScene >= chapter.scenes.length;

  const playScene = (index: number) => {
    setNextScene(index + 1);
    say(chapter.scenes[index]);
  };

  const startChapter = (index: number) => {
    setMessages([]);
    setChapterIndex(index);
    setPhase("story");
    setNextScene(1);
    say(chapters[index].scenes[0]);
  };

  const startQuiz = () => {
    setPhase("quiz");
    setQuizIndex(0);
    setCorrectCount(0);
    say([
      { from: "ramesh", text: `before we move on, a quick check. ${quiz.length} questions about what you just learned.` },
      { from: "system", text: `you need ${PASS_SCORE * 100}% to unlock the next chapter. type the number of your answer and press enter.` },
      questionMessage(quiz, 0),
    ]);
  };

  const startGlitch = () => {
    setBusy(true);
    setPhase("glitch");
    schedule(GLITCH_MS, () => startChapter(chapterIndex + 1));
  };

  const answerQuestion = (text: string) => {
    const question = quiz[quizIndex];
    const choice = Number(text);
    if (!Number.isInteger(choice) || choice < 1 || choice > question.options.length) {
      say([{ from: "system", text: `type a number from 1 to ${question.options.length}.` }]);
      return;
    }

    const isCorrect = choice - 1 === question.answer;
    const correct = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(correct);
    const feedback: StoryMessage = isCorrect
      ? { from: "system", text: `correct. ${question.explanation}` }
      : { from: "system", text: `not quite. the answer is ${question.answer + 1}) ${question.options[question.answer]}. ${question.explanation}` };

    const next = quizIndex + 1;
    if (next < quiz.length) {
      setQuizIndex(next);
      say([feedback, questionMessage(quiz, next)]);
      return;
    }

    const score = correct / quiz.length;
    const result = `score: ${Math.round(score * 100)}% (${correct}/${quiz.length}).`;
    if (score >= PASS_SCORE) {
      say([feedback, { from: "system", text: `${result} access granted.` }], () => {
        setBusy(true);
        schedule(BEFORE_GLITCH_MS, startGlitch);
      });
      return;
    }
    setPhase("failed");
    say([
      feedback,
      { from: "system", text: `${result} you need ${PASS_SCORE * 100}% to unlock the next chapter.` },
      { from: "ramesh", text: "no stress. type 'retry' to take the quiz again, or 'restart' to replay the chapter." },
    ]);
  };

  const handleSubmit = (input: string) => {
    const text = input.trim();
    const command = text.toLowerCase();
    if (text) addMessage({ from: "you", text });

    if (command === "restart" || command === "clear") {
      clearTimers();
      startChapter(chapterIndex);
      return;
    }

    if (phase === "quiz") {
      answerQuestion(text);
      return;
    }

    if (phase === "failed") {
      if (command === "retry") startQuiz();
      else say([{ from: "system", text: "type 'retry' to take the quiz again, or 'restart' to replay the chapter." }]);
      return;
    }

    if (!chapterDone) {
      playScene(nextScene);
      return;
    }

    if (chapter.quiz && upcomingChapter) {
      startQuiz();
      return;
    }

    say([{ from: "system", text: "that's all for now. type 'restart' to replay this chapter." }]);
  };

  const placeholder = (() => {
    if (busy) return "";
    if (phase === "quiz") return `type 1-${quiz[quizIndex].options.length} and press enter`;
    if (phase === "failed") return "type 'retry' or 'restart'";
    if (!chapterDone) return "press enter to continue...";
    if (chapter.quiz && upcomingChapter) return "press enter to start the quiz...";
    return "type 'restart' to replay this chapter";
  })();

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
        <div className={`relative flex h-[min(75vh,44rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel ${phase === "glitch" ? "animate-glitch" : "animate-window-open"}`}>
          {phase === "glitch" && upcomingChapter && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-black/90">
              <div className="glitch-noise absolute inset-0" />
              <div className="relative text-center">
                <p className="glitch-text text-4xl font-bold tracking-[0.3em] text-neon uppercase" data-text={upcomingChapter.title}>
                  {upcomingChapter.title}
                </p>
                <p className="mt-3 text-sm tracking-widest text-neon/60">{upcomingChapter.subtitle}</p>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="window-handle flex h-10 shrink-0 cursor-grab items-center justify-between border-b border-neon/15 bg-neon/[0.04] px-3 text-xs active:cursor-grabbing">
            <div className="flex items-center gap-2">
              <NmapIcon className="h-4 w-4 text-neon" />
              <span className="font-semibold text-neon">{title}</span>
              <span className="text-neon/40">{chapter.title} · {chapter.subtitle}</span>
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
            placeholder={placeholder}
          />
        </div>
      </div>
    </Draggable>
  );
};

export default Window;
