import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import loginWallpaper from "../assets/backgrounds/login-wallpaper.jpg";
import { useClock } from "./use-clock";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const welcomeTimer = useRef<number>(undefined);

  const [mode, setMode] = useState<Mode>("login");
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const currentSteps = steps[mode];
  const step = currentSteps[answers.length];
  const finished = !step;
  const username = answers[0]?.trim() || "guest";

  useEffect(() => () => window.clearTimeout(welcomeTimer.current), []);

  // Any credentials are accepted for now
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" || finished) return;
    event.preventDefault();
    const nextAnswers = [...answers, input];
    setAnswers(nextAnswers);
    setInput("");
    if (nextAnswers.length === currentSteps.length) {
      welcomeTimer.current = window.setTimeout(() => onLogin(nextAnswers[0].trim() || "guest"), WELCOME_DELAY_MS);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setAnswers([]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div
      className="relative h-dvh w-full overflow-hidden bg-void"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Wallpaper — full-bleed, slow drift; crop shifts by breakpoint */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={loginWallpaper}
          alt=""
          className="animate-wallpaper-drift absolute inset-0 h-full w-full object-cover object-[28%_55%] sm:object-[32%_50%] lg:object-[22%_45%]"
        />
        {/* Mobile: keep city/laptop readable, darken bottom for console */}
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-black/25 to-black/85 md:hidden" />
        {/* Desktop: soft left vignette, stronger right for console */}
        <div className="absolute inset-0 hidden bg-linear-to-r from-black/15 via-black/35 to-black/80 md:block" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/40" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(61,220,132,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(61,220,132,0.5)_1px,transparent_1px)] [background-size:28px_28px]" />
      </div>

      {/* Chrome */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-5 md:p-6">
        <div className="pointer-events-auto text-sm font-semibold tracking-wide text-neon drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
          ⌬ offtrck
        </div>
        <div className="pointer-events-none text-right drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
          <p className="text-2xl font-extralight text-neon sm:text-3xl">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="hidden text-xs text-neon/50 sm:block">
            {now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="text-[10px] text-neon/45 sm:hidden">
            {now.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
          </p>
        </div>
      </header>

      <p className="pointer-events-none absolute bottom-5 left-6 z-10 hidden max-w-[16rem] text-xs leading-5 text-neon/40 lg:block">
        every network reveals secrets, if you know how to listen.
      </p>

      {/* Login console — bottom sheet on phone, right panel on desktop */}
      <div className="absolute inset-0 z-10 flex items-end justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-20 sm:px-4 md:items-center md:justify-end md:px-6 md:pb-6 md:pr-[min(6vw,4rem)] lg:pr-[8vw]">
        <div className="flex w-full max-w-xl flex-col gap-2 md:w-[min(36rem,100%)]">
          <div className="animate-window-open rounded-xl border border-neon/20 bg-black/70 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md sm:rounded-md sm:p-5 md:bg-black/75">
            <div className="thin-scrollbar max-h-[min(48dvh,26rem)] overflow-y-auto md:max-h-[min(70dvh,36rem)]">
              {bootLog.map((line, i) => (
                <p
                  key={line.text}
                  className="animate-line-in text-[11px] leading-5 text-slate-400 sm:text-sm sm:leading-6"
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

              <div className="animate-line-in" style={{ animationDelay: `${promptDelay}ms` }}>
                <p className="mt-3 mb-3 text-[11px] text-slate-300 sm:mt-4 sm:mb-4 sm:text-sm">
                  offtrck-os 1.0 offtrck tty1
                </p>

                {answers.map((answer, i) => (
                  <p key={`${mode}-${i}`} className="text-[12px] leading-6 text-slate-200 sm:text-sm">
                    <span className="text-neon">{currentSteps[i].prompt}</span>{" "}
                    {currentSteps[i].secret ? "" : answer}
                  </p>
                ))}

                {step ? (
                  <p className="text-[12px] leading-6 text-slate-200 sm:text-sm">
                    <span className="text-neon">{step.prompt}</span> {step.secret ? "" : input}
                    <span className="animate-blink ml-px inline-block h-4 w-2 translate-y-0.5 bg-neon" />
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-[11px] text-slate-400 sm:text-sm">
                      {mode === "login"
                        ? `Last login: ${now.toDateString()} on tty1`
                        : `useradd: account '${username}' created`}
                    </p>
                    <p className="text-sm text-neon sm:text-base">welcome to offtrck-os, {username}.</p>
                  </>
                )}

                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  type={step?.secret ? "password" : "text"}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  autoFocus
                  aria-label={step?.prompt ?? "console input"}
                  className="absolute h-px w-px opacity-0"
                />

                {!finished && (
                  <p className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neon/10 pt-3 text-[11px] text-neon/40 sm:mt-6 sm:text-xs">
                    <span>
                      {mode === "login" ? "no account? " : "already have an account? "}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          switchMode();
                        }}
                        className="text-neon/80 hover:text-neon hover:underline"
                      >
                        [ {mode === "login" ? "create account" : "back to login"} ]
                      </button>
                    </span>
                    <span>press enter ↵</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-neon/45 sm:text-xs md:justify-end">
            <p className="max-w-[14rem] leading-4 md:hidden">every network reveals secrets, if you know how to listen.</p>
            <a
              href="#/founders"
              onClick={(event) => event.stopPropagation()}
              className="shrink-0 text-neon/60 hover:text-neon hover:underline"
            >
              [ founders ]
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
