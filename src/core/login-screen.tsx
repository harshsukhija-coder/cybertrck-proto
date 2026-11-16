import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import loginWallpaper from "../assets/backgrounds/login-wallpaper.jpg";
import { OfftrckMark } from "../icons/OfftrckMark";
import { useIsMobile, useKeyboardInset } from "./use-media";

const WELCOME_DELAY_MS = 750;

type Mode = "login" | "signup";

type Step = { key: string; prompt: string; secret?: boolean };

const steps: Record<Mode, Step[]> = {
  login: [
    { key: "username", prompt: "login:" },
    { key: "password", prompt: "password:", secret: true },
  ],
  signup: [
    { key: "username", prompt: "username:" },
    { key: "email", prompt: "email:" },
    { key: "password", prompt: "password:", secret: true },
  ],
};

const LoginScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeTimer = useRef<number>(undefined);

  const [mode, setMode] = useState<Mode>("login");
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [linking, setLinking] = useState(false);

  const currentSteps = steps[mode];
  const stepIndex = answers.length;
  const step = currentSteps[stepIndex];
  const username = answers[0]?.trim() || "guest";
  const keyboardOpen = isMobile && keyboardInset > 0;

  useEffect(() => () => window.clearTimeout(welcomeTimer.current), []);

  const submitStep = () => {
    if (!step || linking) return;
    if (!input.trim() && step.key !== "password") return;
    if (step.secret && !input) return;

    const nextAnswers = [...answers, input];
    setAnswers(nextAnswers);
    setInput("");

    if (nextAnswers.length === currentSteps.length) {
      setLinking(true);
      welcomeTimer.current = window.setTimeout(
        () => onLogin(nextAnswers[0].trim() || "guest"),
        WELCOME_DELAY_MS,
      );
      inputRef.current?.blur();
      return;
    }

    window.setTimeout(() => inputRef.current?.focus(), 20);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    submitStep();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitStep();
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setAnswers([]);
    setInput("");
    setLinking(false);
  };

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-void"
      style={{ paddingBottom: keyboardOpen ? keyboardInset : undefined }}
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={loginWallpaper}
          alt=""
          className="animate-wallpaper-drift absolute -inset-[10%] h-[120%] w-[120%] max-w-none object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/35 to-black/80" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div
          className={`flex flex-1 flex-col ${
            keyboardOpen ? "justify-end" : "justify-center gap-10"
          }`}
        >
          {!keyboardOpen && (
            <div className="flex flex-col items-center">
              <OfftrckMark className="h-14 w-14 text-neon drop-shadow-[0_0_18px_rgba(61,220,132,0.45)]" />
              <p className="mt-4 font-mono text-[14px] font-semibold tracking-[0.34em] text-neon">OFFTRCK</p>
              <p className="mt-1.5 font-mono text-[11px] text-white/40">
                {linking ? "link established…" : "establish a session"}
              </p>
            </div>
          )}

          {/* CLI only — no modal chrome */}
          <div className="font-mono text-[13px] leading-7 md:text-[14px]">
            <p className="text-neon/80">
              <span className="text-neon">guest@offtrck</span>
              <span className="text-white/35">:</span>
              <span className="text-[#7dd3fc]">~</span>
              <span className="text-white/35">$</span>{" "}
              <span className="text-white/80">{mode === "login" ? "login" : "useradd"}</span>
            </p>

            {answers.map((answer, i) => (
              <p key={`${mode}-${i}`} className="text-neon/85">
                <span className="text-neon">{currentSteps[i].prompt}</span>{" "}
                <span>{currentSteps[i].secret ? "********" : answer}</span>
              </p>
            ))}

            {linking ? (
              <p className="text-neon">
                welcome, {username}
                <span className="animate-blink ml-1 inline-block h-3.5 w-1.5 translate-y-px bg-neon align-middle" />
              </p>
            ) : (
              step && (
                <label className="flex min-h-11 items-center gap-2">
                  <span className="shrink-0 text-neon">{step.prompt}</span>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    type={step.secret ? "password" : step.key === "email" ? "email" : "text"}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    enterKeyHint="go"
                    aria-label={step.prompt}
                    className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[16px] text-neon caret-neon outline-none md:text-[14px]"
                  />
                </label>
              )
            )}

            {!linking && step && (
              <div className="mt-4 flex items-center justify-between text-[11px] text-white/35">
                <button type="button" onClick={switchMode} className="hover:text-neon">
                  {mode === "login" ? "./signup" : "./login"}
                </button>
                <button type="submit" className="hover:text-neon">
                  enter ↵
                </button>
              </div>
            )}
          </div>

          {!keyboardOpen && (
            <a
              href="#/team"
              className="block text-center font-mono text-[11px] text-white/25 hover:text-neon/70"
            >
              $ cat team
            </a>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;
