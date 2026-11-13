import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import hackerLaptop from "../assets/backgrounds/hacker-laptop.jpg";
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
    <div className="relative h-screen w-full overflow-hidden bg-void" onClick={() => inputRef.current?.focus()}>
      {/* Background */}
      <img src={hackerLaptop} alt="" className="absolute inset-0 h-full w-full object-cover object-[25%_center] opacity-70" />
      <div className="absolute inset-0 bg-linear-to-r from-black/20 via-black/55 to-black/90" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/50" />

      {/* Corners */}
      <div className="absolute top-5 left-6 text-sm font-semibold text-neon">⌬ offtrck</div>
      <div className="absolute top-5 right-6 text-right">
        <p className="text-3xl font-extralight text-neon">{now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
        <p className="text-xs text-neon/50">{now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>
      <p className="absolute bottom-5 left-6 hidden max-w-xs text-xs text-neon/40 md:block">
        every network reveals secrets, if you know how to listen.
      </p>

      {/* Console */}
      <div className="absolute inset-0 flex items-center justify-center px-4 md:justify-end md:pr-[8vw]">
        <div className="w-[min(36rem,100%)] rounded-md border border-neon/20 bg-black/75 p-5 text-sm leading-6 backdrop-blur-sm">
          {bootLog.map((line, i) => (
            <p key={line.text} className="animate-line-in text-slate-400" style={{ animationDelay: `${i * LINE_DELAY_MS}ms` }}>
              [{line.status === "OK" ? <span className="text-neon">  OK  </span> : <span className="text-amber"> WARN </span>}] {line.text}
            </p>
          ))}

          <div className="animate-line-in" style={{ animationDelay: `${promptDelay}ms` }}>
            <p className="mt-4 mb-4 text-slate-300">offtrck-os 1.0 offtrck tty1</p>

            {answers.map((answer, i) => (
              <p key={`${mode}-${i}`} className="text-slate-200">
                <span className="text-neon">{currentSteps[i].prompt}</span> {currentSteps[i].secret ? "" : answer}
              </p>
            ))}

            {step ? (
              <p className="text-slate-200">
                <span className="text-neon">{step.prompt}</span> {step.secret ? "" : input}
                <span className="animate-blink ml-px inline-block h-4 w-2 translate-y-0.5 bg-neon" />
              </p>
            ) : (
              <>
                <p className="mt-2 text-slate-400">
                  {mode === "login"
                    ? `Last login: ${now.toDateString()} on tty1`
                    : `useradd: account '${username}' created`}
                </p>
                <p className="text-neon">welcome to offtrck-os, {username}.</p>
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
              <p className="mt-6 border-t border-neon/10 pt-3 text-xs text-neon/40">
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
                <span className="float-right">press enter ↵</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
