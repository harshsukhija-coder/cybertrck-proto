import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import loginWallpaper from "../assets/backgrounds/login-wallpaper.jpg";
import { OfftrckBrand, OfftrckMark } from "../icons/OfftrckMark";
import { useClock } from "./use-clock";
import { useIsMobile, useKeyboardInset } from "./use-media";

const LINE_DELAY_MS = 90;
const WELCOME_DELAY_MS = 800;

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
  const userRef = useRef<HTMLInputElement>(null);
  const welcomeTimer = useRef<number>(undefined);

  const [mode, setMode] = useState<Mode>("login");
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [done, setDone] = useState(false);

  const currentSteps = steps[mode];
  const step = currentSteps[answers.length];
  const finished = !step;
  const username = answers[0]?.trim() || form.username.trim() || "guest";
  const keyboardOpen = isMobile && keyboardInset > 0;
  const canSubmit =
    Boolean(form.username.trim() && form.password.trim()) &&
    (mode === "login" || Boolean(form.email.trim()));

  useEffect(() => () => window.clearTimeout(welcomeTimer.current), []);

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
    if (isMobile) {
      if (!canSubmit) return;
      const name = form.username.trim();
      setDone(true);
      (document.activeElement as HTMLElement | null)?.blur();
      welcomeTimer.current = window.setTimeout(() => onLogin(name || "guest"), WELCOME_DELAY_MS);
      return;
    }
    submitStep();
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setAnswers([]);
    setInput("");
    setForm({ username: "", email: "", password: "" });
    setDone(false);
    window.setTimeout(() => {
      if (isMobile) userRef.current?.focus();
      else inputRef.current?.focus();
    }, 30);
  };

  const field =
    "w-full border-0 border-b border-white/15 bg-transparent px-0 py-3 text-[16px] text-white caret-neon outline-none placeholder:text-white/25 focus:border-neon/50";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src={loginWallpaper}
          alt=""
          className="animate-wallpaper-drift absolute -inset-[12%] h-[124%] w-[124%] max-w-none object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-black/45 md:bg-black/25" />
        <div className="absolute inset-0 bg-linear-to-b from-black/55 via-transparent to-black/75" />
      </div>

      {isMobile ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center px-6"
          style={{
            paddingTop: "max(1rem, env(safe-area-inset-top))",
            paddingBottom: keyboardOpen
              ? keyboardInset + 12
              : "max(1rem, env(safe-area-inset-bottom))",
            alignItems: keyboardOpen ? "flex-end" : "center",
          }}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            <div className="mb-10 flex flex-col items-center gap-3">
              <OfftrckMark className="h-10 w-10 text-neon drop-shadow-[0_0_12px_rgba(61,220,132,0.45)]" />
              <p className="text-[15px] font-medium tracking-[0.28em] text-neon">OFFTRCK</p>
            </div>

            {done ? (
              <p className="py-6 text-center text-[15px] text-neon">welcome, {username}</p>
            ) : (
              <>
                <div className="space-y-1">
                  <input
                    ref={userRef}
                    value={form.username}
                    onChange={(event) => setForm(prev => ({ ...prev, username: event.target.value }))}
                    type="text"
                    autoComplete="username"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                    placeholder="username"
                    className={field}
                  />
                  {mode === "signup" && (
                    <input
                      value={form.email}
                      onChange={(event) => setForm(prev => ({ ...prev, email: event.target.value }))}
                      type="email"
                      autoComplete="email"
                      autoCapitalize="off"
                      placeholder="email"
                      className={field}
                    />
                  )}
                  <input
                    value={form.password}
                    onChange={(event) => setForm(prev => ({ ...prev, password: event.target.value }))}
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="password"
                    enterKeyHint="go"
                    className={field}
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="mt-8 min-h-12 w-full rounded-full bg-neon text-[14px] font-semibold tracking-wide text-void disabled:opacity-35"
                >
                  {mode === "login" ? "continue" : "create account"}
                </button>

                <button
                  type="button"
                  onClick={switchMode}
                  className="mt-4 w-full py-2 text-center text-[12px] text-white/45"
                >
                  {mode === "login" ? "create account" : "sign in instead"}
                </button>
              </>
            )}

            {!keyboardOpen && (
              <a href="#/team" className="mt-8 block text-center text-[11px] tracking-wide text-white/30">
                team
              </a>
            )}
          </form>
        </div>
      ) : (
        <>
          <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-6">
            <OfftrckBrand className="text-sm tracking-wide drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]" markClassName="h-4 w-4" />
            <div className="text-right drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
              <p className="text-3xl font-extralight text-neon">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-neon/50">
                {now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </header>

          <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
            <div className="w-full max-w-xl md:w-[min(36rem,100%)]">
              <form
                onSubmit={handleSubmit}
                onClick={() => inputRef.current?.focus()}
                className="animate-window-open rounded-xl border border-neon/20 bg-black/78 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md"
              >
                {bootLog.map((line, i) => (
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

                <div className="animate-line-in" style={{ animationDelay: `${promptDelay}ms` }}>
                  <p className="mt-4 mb-4 text-sm text-slate-300">offtrck-os 1.0 · tty1</p>

                  {answers.map((answer, i) => (
                    <p key={`${mode}-${i}`} className="text-sm leading-6 text-slate-200">
                      <span className="text-neon">{currentSteps[i].prompt}</span>{" "}
                      {currentSteps[i].secret ? "••••" : answer}
                    </p>
                  ))}

                  {step ? (
                    <label className="mt-1 block cursor-text">
                      <span className="text-sm text-neon">{step.prompt} </span>
                      <span className="text-sm text-slate-200">
                        {step.secret ? "" : input}
                        <span className="animate-blink ml-px inline-block h-4 w-2 translate-y-0.5 bg-neon" />
                      </span>
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
                        autoFocus
                        aria-label={step.prompt}
                        className="absolute h-px w-px opacity-0"
                      />
                    </label>
                  ) : (
                    <>
                      <p className="mt-2 text-sm text-slate-400">
                        {mode === "login"
                          ? `Last login: ${now.toDateString()} on tty1`
                          : `useradd: account '${username}' created`}
                      </p>
                      <p className="text-sm text-neon">welcome to offtrck-os, {username}.</p>
                    </>
                  )}
                </div>

                {!finished && (
                  <div className="mt-5 flex items-center justify-between gap-2 border-t border-neon/10 pt-3 text-xs text-neon/40">
                    <button type="button" onClick={switchMode} className="text-neon/65 hover:text-neon hover:underline">
                      {mode === "login" ? "create account" : "back to login"}
                    </button>
                    <span>press enter ↵</span>
                  </div>
                )}
              </form>

              <div className="mt-2 flex justify-center px-0.5 text-xs">
                <a href="#/team" className="text-neon/45 hover:text-neon hover:underline">
                  team
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginScreen;
