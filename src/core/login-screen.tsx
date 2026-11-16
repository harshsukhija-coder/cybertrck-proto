import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import loginWallpaper from "../assets/backgrounds/login-wallpaper.jpg";
import { useClock } from "./use-clock";
import { useIsMobile, useKeyboardInset } from "./use-media";

const LINE_DELAY_MS = 90;
const WELCOME_DELAY_MS = 900;

type Mode = "login" | "signup";

type Step = { key: string; prompt: string; secret?: boolean };

const steps: Record<Mode, Step[]> = {
  login: [
    { key: "username", prompt: "offtrck login:" },
    { key: "password", prompt: "Password:", secret: true },
  ],
  signup: [
    { key: "username", prompt: "new username:" },
    { key: "email", prompt: "email address:" },
    { key: "password", prompt: "new password:", secret: true },
  ],
};

const bootLog: { status: "OK" | "WARN"; text: string }[] = [
  { status: "OK", text: "Started Journal Service." },
  { status: "OK", text: "Reached target Local File Systems." },
  { status: "OK", text: "Started Network Manager." },
  { status: "OK", text: "Started OpenSSH Daemon." },
  { status: "WARN", text: "Unknown device on 192.168.1.0/24: DESKTOP-X7Q" },
  { status: "OK", text: "Reached target Multi-User System." },
];

const promptDelay = (bootLog.length + 1) * LINE_DELAY_MS;

const LoginScreen = ({ onLogin }: { onLogin: (username: string) => void }) => {
  const now = useClock();
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeTimer = useRef<number>(undefined);

  const [mode, setMode] = useState<Mode>("login");
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const currentSteps = steps[mode];
  const step = currentSteps[answers.length];
  const finished = !step;
  const username = answers[0]?.trim() || "guest";
  const keyboardOpen = isMobile && keyboardInset > 0;

  useEffect(() => () => window.clearTimeout(welcomeTimer.current), []);

  useEffect(() => {
    if (!keyboardOpen) return;
    window.setTimeout(() => {
      inputRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 40);
  }, [keyboardOpen, answers.length, mode]);

  const submitStep = () => {
    if (finished) return;
    const nextAnswers = [...answers, input];
    setAnswers(nextAnswers);
    setInput("");
    if (nextAnswers.length === currentSteps.length) {
      welcomeTimer.current = window.setTimeout(() => onLogin(nextAnswers[0].trim() || "guest"), WELCOME_DELAY_MS);
      inputRef.current?.blur();
      return;
    }
    window.setTimeout(() => inputRef.current?.focus(), 30);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || finished) return;
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
    window.setTimeout(() => inputRef.current?.focus(), 30);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={loginWallpaper}
          alt=""
          className="animate-wallpaper-drift absolute inset-0 h-full w-full object-cover object-[30%_40%] sm:object-[32%_50%] lg:object-[22%_45%]"
        />
        <div className="absolute inset-0 bg-black/50 md:bg-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/85 md:hidden" />
        <div className="absolute inset-0 hidden bg-linear-to-r from-black/15 via-black/35 to-black/80 md:block" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/30" />
      </div>

      {!keyboardOpen && (
        <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-6 md:pt-6">
          <div className="text-sm font-semibold tracking-wide text-neon drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            ⌬ offtrck
          </div>
          <div className="text-right drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            <p className="text-2xl font-extralight text-neon md:text-3xl">
              {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className="text-[10px] text-neon/45 md:text-xs md:text-neon/50">
              {now.toLocaleDateString([], {
                weekday: isMobile ? "short" : "long",
                day: "numeric",
                month: isMobile ? "short" : "long",
              })}
            </p>
          </div>
        </header>
      )}

      <div
        className="absolute inset-x-0 z-10 flex justify-center px-4 md:inset-0 md:items-center md:justify-end md:px-6 lg:pr-[8vw]"
        style={{
          top: keyboardOpen ? "max(0.5rem, env(safe-area-inset-top))" : undefined,
          bottom: keyboardOpen ? keyboardInset + 8 : "max(1rem, env(safe-area-inset-bottom))",
          alignItems: "flex-end",
        }}
      >
        <div className={`w-full max-w-[20rem] md:max-w-xl md:w-[min(36rem,100%)] ${keyboardOpen ? "" : "mb-1 md:mb-0"}`}>
          {!keyboardOpen && isMobile && (
            <p className="mb-2.5 px-0.5 text-[11px] leading-4 text-neon/40">
              every network reveals secrets,<br />if you know how to listen.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            onClick={() => inputRef.current?.focus()}
            className="animate-window-open rounded-xl border border-neon/20 bg-black/78 p-3 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md md:rounded-md md:bg-black/75 md:p-5"
          >
            {!isMobile &&
              bootLog.map((line, i) => (
                <p
                  key={line.text}
                  className="animate-line-in text-sm leading-6 text-slate-400"
                  style={{ animationDelay: `${i * LINE_DELAY_MS}ms` }}
                >
                  [
                  {line.status === "OK" ? (
                    <span className="text-neon">  OK  </span>
                  ) : (
                    <span className="text-amber"> WARN </span>
                  )}
                  ] {line.text}
                </p>
              ))}

            <div className="animate-line-in" style={{ animationDelay: isMobile ? "0ms" : `${promptDelay}ms` }}>
              <p className={`text-neon/35 ${isMobile ? "mb-2 text-[10px]" : "mt-4 mb-4 text-sm text-slate-300"}`}>
                {isMobile ? "sign in" : "offtrck-os 1.0 · tty1"}
              </p>

              {answers.map((answer, i) => (
                <p key={`${mode}-${i}`} className="text-[12px] leading-5 text-slate-200 md:text-sm md:leading-6">
                  <span className="text-neon">{currentSteps[i].prompt}</span>{" "}
                  {currentSteps[i].secret ? "••••" : answer}
                </p>
              ))}

              {step ? (
                <label className="mt-1 block cursor-text">
                  <span className="text-[12px] text-neon md:text-sm">{step.prompt} </span>
                  {!isMobile && (
                    <span className="text-sm text-slate-200">
                      {step.secret ? "" : input}
                      <span className="animate-blink ml-px inline-block h-4 w-2 translate-y-0.5 bg-neon" />
                    </span>
                  )}
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    type={step.secret ? "password" : step.key === "email" ? "email" : "text"}
                    inputMode={step.key === "email" ? "email" : "text"}
                    enterKeyHint="go"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    aria-label={step.prompt}
                    placeholder={isMobile ? (step.secret ? "password" : "username") : undefined}
                    className={
                      isMobile
                        ? "mt-1.5 w-full rounded-md border border-neon/25 bg-black/60 px-2.5 py-2 text-slate-100 caret-neon outline-none placeholder:text-neon/30 focus:border-neon/50"
                        : "absolute h-px w-px opacity-0"
                    }
                  />
                </label>
              ) : (
                <>
                  <p className="mt-2 text-[11px] text-slate-400 md:text-sm">
                    {mode === "login"
                      ? `Last login: ${now.toDateString()} on tty1`
                      : `useradd: account '${username}' created`}
                  </p>
                  <p className="text-sm text-neon">welcome to offtrck-os, {username}.</p>
                </>
              )}
            </div>

            {!finished && (
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-neon/10 pt-2 text-[10px] text-neon/40 md:mt-5 md:pt-3 md:text-xs">
                <button type="button" onClick={switchMode} className="text-neon/65 hover:text-neon hover:underline">
                  {mode === "login" ? "create account" : "back to login"}
                </button>
                {isMobile ? (
                  <button
                    type="submit"
                    className="rounded-md border border-neon/40 bg-neon/12 px-2.5 py-1 text-[11px] font-semibold text-neon"
                  >
                    continue
                  </button>
                ) : (
                  <span>press enter ↵</span>
                )}
              </div>
            )}
          </form>

          {!keyboardOpen && (
            <div className="mt-2 flex justify-end px-0.5 text-[10px] md:text-xs">
              <a href="#/founders" className="text-neon/45 hover:text-neon hover:underline">
                founders
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
