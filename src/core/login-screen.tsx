import { useState, type CSSProperties, type FormEvent, type InputHTMLAttributes } from "react";
import loginWallpaper from "../assets/backgrounds/login-wallpaper.jpg";
import { ChapterCover } from "../courses/chapter-cover";
import { useGem } from "../courses/gems";
import { ALL_CHAPTERS, COURSES } from "../courses/data";
import { GAMES } from "../courses/games/games";
import { OfftrckMark } from "../icons/OfftrckMark";

export type Space = "feed" | "desktop" | "terminal";

type Mode = "login" | "signup";

const byId = (id: string) => ALL_CHAPTERS.find(c => c.chapter.id === id)!.chapter;

/** Chapters taken from each course in turn, so the strip shows a mix of topics */
const MIXED = COURSES[0].chapters.flatMap((_, i) => COURSES.map(course => course.chapters[i]).filter(Boolean));

/** Covers floating behind the form, with their resting tilt */
const COLLAGE = [
  { chapter: byId("tcp-vs-udp"), className: "left-[2%] top-[10%] w-44 rotate-[-9deg]" },
  { chapter: byId("hooks"), className: "left-[34%] top-[2%] w-52 rotate-[4deg]" },
  { chapter: byId("stocks"), className: "right-0 top-[26%] w-44 rotate-[11deg]" },
  { chapter: byId("sql"), className: "left-[6%] top-[56%] w-40 rotate-[7deg]" },
  { chapter: byId("dns"), className: "left-[36%] top-[54%] w-52 rotate-[-5deg]" },
];

const PICKER_FAN = [byId("hooks"), byId("what-is-a-network"), byId("compound-interest")];

const Field = ({
  label,
  ...input
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="block">
    <span className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{label}</span>
    <input
      {...input}
      autoCapitalize="off"
      autoCorrect="off"
      spellCheck={false}
      className="mt-1.5 w-full rounded-2xl border border-(--line) bg-white/[0.04] px-4 py-3.5 text-[16px] text-(--fg) outline-none transition-colors placeholder:text-white/25 focus:border-(--gem) focus:bg-white/[0.06]"
    />
  </label>
);

const SpacePicker = ({ username, onPick }: { username: string; onPick: (space: Space) => void }) => (
  <div className="animate-tile-in">
    <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">signed in as {username}</p>
    <h1 className="mt-3 font-display text-[clamp(2rem,4.5vw,3rem)] font-bold lowercase leading-[1.05] tracking-[-0.04em]">
      where to, <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">{username}</span>?
    </h1>
    <p className="mt-3 text-(--muted)">three ways to learn. switch any time.</p>

    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onPick("feed")}
        className="group flex flex-col rounded-3xl border border-(--line) bg-(--panel) p-2 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-(--gem)/60"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[20px] bg-white/[0.03]">
          {PICKER_FAN.map((chapter, i) => (
            <div
              key={chapter.id}
              className="absolute w-[38%] transition-transform duration-500 ease-out"
              style={{ transform: `translateX(${(i - 1) * 55}%) rotate(${(i - 1) * 9}deg)`, zIndex: i === 1 ? 2 : 1 }}
            >
              <ChapterCover
                chapter={{ ...chapter, number: undefined }}
                wordClass="text-[clamp(1.1rem,4vw,1.6rem)]"
                className="aspect-[4/5] rounded-xl shadow-xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
          <span className="absolute left-3 top-3 rounded-full bg-(--gem) px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-black">
            new
          </span>
        </div>
        <div className="px-3 pb-3 pt-4">
          <h2 className="font-display text-xl font-bold lowercase">the feed →</h2>
          <p className="mt-1 text-sm text-(--muted)">tech, money and marketing as posts. double-tap what you love, play mini games.</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onPick("desktop")}
        className="group flex flex-col rounded-3xl border border-(--line) bg-(--panel) p-2 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#3ddc84]/60"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
          <img
            src={loginWallpaper}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-x-4 bottom-4 rounded-lg border border-[#3ddc84]/30 bg-black/70 p-3 font-jetbrains text-[11px] leading-5 text-[#3ddc84]">
            <p>
              {username}@offtrck<span className="text-white/40">:</span>
              <span className="text-[#7dd3fc]">~</span>
              <span className="text-white/40">$</span> ./start
            </p>
            <p className="text-[#3ddc84]/70">
              booting desktop<span className="ml-1 inline-block h-3 w-1.5 animate-blink bg-[#3ddc84] align-middle" />
            </p>
          </div>
          <span className="absolute left-3 top-3 rounded-full border border-[#3ddc84]/40 bg-black/60 px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-[#3ddc84]">
            classic
          </span>
        </div>
        <div className="px-3 pb-3 pt-4">
          <h2 className="font-display text-xl font-bold lowercase">the desktop →</h2>
          <p className="mt-1 text-sm text-(--muted)">the original hacker desktop. terminals, windows and missions.</p>
        </div>
      </button>
    </div>

    <button
      type="button"
      onClick={() => onPick("terminal")}
      className="mt-4 flex w-full items-center gap-4 rounded-3xl border border-(--line) bg-(--panel) p-4 text-left backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-(--gem)/60"
    >
      <span className="shrink-0 rounded-xl border border-white/10 bg-black/60 px-3 py-2.5 font-jetbrains text-[13px] text-(--gem)">
        $ _<span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-(--gem) align-middle" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg font-bold lowercase">the terminal →</span>
        <span className="mt-0.5 block text-sm text-(--muted)">everything above, but with commands. courses, games and badges by typing.</span>
      </span>
    </button>
  </div>
);

const LoginScreen = ({ onLogin }: { onLogin: (username: string, space: Space) => void }) => {
  const { gem } = useGem();
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signedIn, setSignedIn] = useState<string | null>(null);

  const ready = username.trim() && password && (mode === "login" || email.trim());

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setSignedIn(username.trim());
  };

  return (
    <div style={{ "--gem": gem.color } as CSSProperties} className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe">
      <div className="cv-grid pointer-events-none absolute inset-x-0 top-0 h-[700px]" aria-hidden />
      <div
        className="pointer-events-none absolute left-[20%] top-[-300px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-(--gem) opacity-[0.13] blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-full max-w-7xl items-center gap-10 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={signedIn ? "lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-3xl" : "max-w-md"}>
          <a href="#/courses" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
            <OfftrckMark className="h-6 w-6 text-(--gem)" />
            offtrck
          </a>

          {!signedIn && (
            <div className="no-scrollbar -mx-5 mt-8 flex gap-3 overflow-x-auto px-5 lg:hidden">
              {MIXED.map(chapter => (
                <ChapterCover
                  key={chapter.id}
                  chapter={{ ...chapter, number: undefined }}
                  wordClass="text-xl"
                  className="aspect-[4/5] w-28 shrink-0 rounded-2xl"
                />
              ))}
            </div>
          )}

          <div className="mt-10 lg:mt-14">
            {signedIn ? (
              <SpacePicker username={signedIn} onPick={space => onLogin(signedIn, space)} />
            ) : (
              <form key={mode} onSubmit={handleSubmit} className="animate-tile-in">
                <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold lowercase leading-[1.02] tracking-[-0.04em]">
                  {mode === "login" ? "log in. stay" : "join. get"}{" "}
                  <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">curious</span>.
                </h1>
                <p className="mt-3 text-(--muted)">
                  {mode === "login" ? "pick up where you left the rabbit hole." : `${ALL_CHAPTERS.length} chapters, ${COURSES.length} courses and ${GAMES.length} games are waiting for you.`}
                </p>

                <div className="mt-8 space-y-4">
                  <Field label="username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="packet_pal" autoFocus />
                  {mode === "signup" && (
                    <Field label="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@mail.com" />
                  )}
                  <Field
                    label="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!ready}
                  className="mt-7 w-full rounded-full bg-(--gem) py-4 font-bold text-black shadow-[0_10px_40px_-12px_var(--gem)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {mode === "login" ? "log in →" : "create account →"}
                </button>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="text-(--muted) hover:text-(--fg)"
                  >
                    {mode === "login" ? (
                      <>
                        new here? <span className="font-semibold text-(--gem)">create an account</span>
                      </>
                    ) : (
                      <>
                        have an account? <span className="font-semibold text-(--gem)">log in</span>
                      </>
                    )}
                  </button>
                  <a href="#/team" className="font-jetbrains text-[11px] uppercase tracking-wider text-(--muted) hover:text-(--fg)">
                    meet the team
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>

        {!signedIn && (
          <div className="relative hidden h-[620px] lg:block" aria-hidden>
            {COLLAGE.map(({ chapter, className }) => (
              <div key={chapter.id} className={`absolute transition-transform duration-500 hover:z-10 hover:scale-105 hover:rotate-0 ${className}`}>
                <ChapterCover
                  chapter={chapter}
                  wordClass="text-[2.6rem]"
                  className="aspect-[4/5] rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
