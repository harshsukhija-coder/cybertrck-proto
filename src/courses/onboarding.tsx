import { useEffect, useState, type CSSProperties } from "react";
import networkPhoto from "../assets/courses/network.jpg";
import osiPhoto from "../assets/courses/osi.jpg";
import ipPhoto from "../assets/courses/ip.jpg";
import tcpUdpPhoto from "../assets/courses/tcp-udp.jpg";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import type { Gem } from "./gems";
import { INTERESTS, PACES, STYLES, type InterestId, type PaceId, type Prefs, type StyleId } from "./prefs";

const STYLE_PHOTOS: Record<StyleId, { photo: string; focus: string; exposure?: number }> = {
  stories: { photo: networkPhoto, focus: "60% 50%", exposure: 3 },
  games: { photo: tcpUdpPhoto, focus: "50% 50%" },
  quiz: { photo: ipPhoto, focus: "50% 70%" },
  deep: { photo: osiPhoto, focus: "50% 50%" },
};

const BUILD_LINES = ["reading your vibe…", "picking chapters…", "hiding games in your feed…", "done. enjoy the rabbit hole."];
const BUILD_STEP_MS = 520;

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter(x => x !== item) : [...list, item]);

type Props = { username: string; gem: Gem; initial: Prefs | null; onDone: (prefs: Prefs) => void };

const Onboarding = ({ username, gem, initial, onDone }: Props) => {
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<InterestId[]>(initial?.interests ?? []);
  const [styles, setStyles] = useState<StyleId[]>(initial?.styles ?? []);
  const [pace, setPace] = useState<PaceId>(initial?.pace ?? "daily");
  const [building, setBuilding] = useState(0);

  const canContinue = step === 0 ? interests.length > 0 : step === 1 ? styles.length > 0 : true;

  useEffect(() => {
    if (building === 0) return;
    const timer = window.setTimeout(() => {
      if (building < BUILD_LINES.length) setBuilding(b => b + 1);
      else onDone({ interests, styles, pace });
    }, BUILD_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [building, interests, styles, pace, onDone]);

  const next = () => {
    if (!canContinue) return;
    if (step < 2) setStep(step + 1);
    else setBuilding(1);
  };

  return (
    <div style={{ "--gem": gem.color } as CSSProperties} className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe">
      <div className="cv-grid pointer-events-none absolute inset-x-0 top-0 h-[700px]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-300px] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-(--gem) opacity-[0.12] blur-[140px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-full max-w-4xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-8">
        <header className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
            <OfftrckMark className="h-5 w-5 text-(--gem)" />
            offtrck
          </span>
          <div className="flex flex-1 gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-(--gem)" : "bg-white/10"}`} />
            ))}
          </div>
          {initial && (
            <a href="#/feed" className="font-jetbrains text-xs uppercase tracking-wider text-(--muted) hover:text-(--fg)">
              close
            </a>
          )}
        </header>

        {building > 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="relative h-40 w-32">
              {STYLES.slice(0, 3).map((style, i) => (
                <div
                  key={style.id}
                  className="absolute inset-0 transition-transform duration-700 ease-out"
                  style={{ transform: building > i ? `translateX(${(i - 1) * 56}px) rotate(${(i - 1) * 10}deg)` : undefined }}
                >
                  <ChapterCover
                    chapter={{ ...STYLE_PHOTOS[style.id], duo: style.duo, word: "" }}
                    className="h-full w-full rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10"
                  />
                </div>
              ))}
            </div>
            <h1 className="mt-10 font-display text-3xl font-bold lowercase tracking-[-0.03em] sm:text-4xl">
              building your <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">feed</span>
            </h1>
            <ul className="mt-6 space-y-1.5 font-jetbrains text-sm">
              {BUILD_LINES.slice(0, building).map(line => (
                <li key={line} className="animate-tile-in text-(--muted)">
                  <span className="text-(--gem)">✓</span> {line}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <main key={step} className="flex flex-1 animate-tile-in flex-col pt-12 sm:pt-16">
            {step === 0 && (
              <>
                <p className="font-jetbrains text-xs uppercase tracking-wider text-(--muted)">hey {username} · 1 of 3</p>
                <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold lowercase leading-[1.05] tracking-[-0.04em]">
                  what are you{" "}
                  <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">curious</span> about?
                </h1>
                <p className="mt-3 text-(--muted)">pick as many as you like. we'll put these first, and still sneak in a bit of everything.</p>
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {INTERESTS.map(interest => {
                    const on = interests.includes(interest.id);
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setInterests(toggle(interests, interest.id))}
                        className="group flex items-center gap-3 rounded-full border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-95 sm:px-5"
                        style={{
                          borderColor: on ? interest.color : "var(--line)",
                          background: on ? `${interest.color}1f` : "var(--panel)",
                        }}
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-black transition-transform"
                          style={{ background: on ? interest.color : `${interest.color}55`, transform: on ? "scale(1.1)" : undefined }}
                        >
                          {on ? "✓" : ""}
                        </span>
                        <span className="leading-tight">
                          <span className="block font-semibold">{interest.label}</span>
                          <span className="block text-xs text-(--muted)">{interest.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <p className="font-jetbrains text-xs uppercase tracking-wider text-(--muted)">2 of 3</p>
                <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold lowercase leading-[1.05] tracking-[-0.04em]">
                  how do you{" "}
                  <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">love</span> to learn?
                </h1>
                <p className="mt-3 text-(--muted)">pick one or more. this changes what shows up between chapters.</p>
                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {STYLES.map(style => {
                    const on = styles.includes(style.id);
                    return (
                      <button
                        key={style.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setStyles(toggle(styles, style.id))}
                        className={`group relative flex flex-col rounded-3xl border p-1.5 text-left transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] ${
                          on ? "border-(--gem) bg-white/[0.06]" : "border-(--line) bg-(--panel)"
                        }`}
                      >
                        <ChapterCover
                          chapter={{ ...STYLE_PHOTOS[style.id], duo: style.duo, word: style.word }}
                          wordClass="text-5xl sm:text-6xl"
                          className="aspect-[4/5] rounded-[20px]"
                        />
                        <span className="px-2 pb-2 pt-2.5 text-sm font-medium leading-snug">{style.label}</span>
                        <span
                          className={`absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-sm font-black transition-all ${
                            on ? "scale-100 bg-(--gem) text-black" : "scale-90 border-2 border-white/60 bg-black/20"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <p className="font-jetbrains text-xs uppercase tracking-wider text-(--muted)">3 of 3</p>
                <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold lowercase leading-[1.05] tracking-[-0.04em]">
                  how much{" "}
                  <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">time</span> do you have?
                </h1>
                <p className="mt-3 text-(--muted)">no pressure. we'll set a daily goal you can actually hit.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {PACES.map(p => {
                    const on = pace === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setPace(p.id)}
                        className={`flex items-center gap-4 rounded-3xl border px-5 py-5 text-left transition-all duration-200 hover:-translate-y-0.5 sm:flex-col sm:items-start ${
                          on ? "border-(--gem) bg-(--gem)/10" : "border-(--line) bg-(--panel)"
                        }`}
                      >
                        <span className={`font-poster text-6xl leading-none sm:text-7xl ${on ? "text-(--gem)" : ""}`}>{p.minutes}</span>
                        <span className="font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <div className="sticky bottom-0 mt-auto flex items-center justify-between gap-3 pb-1 pt-10 sm:static sm:mt-12">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="rounded-full border border-(--line) bg-black/40 px-5 py-3 font-medium text-(--muted) backdrop-blur hover:text-(--fg)"
                >
                  back
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={!canContinue}
                onClick={next}
                className="rounded-full bg-(--gem) px-7 py-3.5 font-bold text-black shadow-[0_10px_40px_-10px_var(--gem)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none disabled:hover:translate-y-0"
              >
                {step < 2 ? "continue →" : "build my feed →"}
              </button>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
