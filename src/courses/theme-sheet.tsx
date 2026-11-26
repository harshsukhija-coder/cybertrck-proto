import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { GEMS, useGem } from "./gems";
import { THEMES, useTheme, type ThemeId } from "./theme-store";

const Preview = ({ id, swatch, accent }: { id: ThemeId; swatch: [string, string, string]; accent: string }) => {
  if (id === "auto") {
    return (
      <span className="relative block aspect-[4/3] overflow-hidden rounded-xl">
        <span className="absolute inset-0" style={{ background: "#f4f2ec" }} />
        <span className="absolute inset-0" style={{ background: "#07080c", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
      </span>
    );
  }
  const [page, card, text] = swatch;
  return (
    <span className="block aspect-[4/3] overflow-hidden rounded-xl p-2" style={{ background: page }}>
      <span className="flex h-full flex-col gap-1 rounded-lg p-1.5" style={{ background: card }}>
        <span className="h-1.5 w-2/3 rounded-full" style={{ background: text, opacity: 0.85 }} />
        <span className="h-1.5 w-1/2 rounded-full" style={{ background: text, opacity: 0.35 }} />
        <span className="mt-auto h-2.5 w-8 rounded-full" style={{ background: accent }} />
      </span>
    </span>
  );
};

/** Pick the app's look and accent colour; a bottom sheet on phones, a pop-up on bigger screens */
export const ThemeSheet = ({ onClose }: { onClose: () => void }) => {
  const { theme, setTheme } = useTheme();
  const { gem, setGem } = useGem();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="cv-root fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm sm:items-center sm:p-6" style={{ background: "rgba(0,0,0,0.55)" }} onClick={onClose}>
      <div
        role="dialog"
        aria-label="Theme"
        onClick={e => e.stopPropagation()}
        style={{ "--gem": gem.color } as CSSProperties}
        className="max-h-[88vh] w-full animate-pop overflow-y-auto rounded-t-[28px] border border-(--line) bg-(--surface) px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl sm:max-w-md sm:rounded-[28px] sm:p-6"
      >
        <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden />
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold lowercase">theme</h2>
          <button type="button" onClick={onClose} aria-label="close" className="grid h-9 w-9 place-items-center rounded-full bg-white/5 hover:bg-white/10">
            ✕
          </button>
        </div>

        <p className="mt-4 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">look</p>
        <div role="radiogroup" aria-label="Look" className="mt-2 grid grid-cols-3 gap-2.5">
          {THEMES.map(t => {
            const on = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={on}
                title={t.about}
                onClick={() => setTheme(t.id)}
                className={`rounded-2xl border p-1.5 text-left transition active:scale-95 ${on ? "border-(--gem) ring-2 ring-(--gem)/40" : "border-(--line) hover:border-white/25"}`}
              >
                <Preview id={t.id} swatch={t.swatch} accent={gem.color} />
                <span className="mt-1.5 block px-1 text-xs font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 min-h-4 text-xs text-(--muted)">{THEMES.find(t => t.id === theme)?.about}</p>

        <p className="mt-5 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">accent</p>
        <div role="radiogroup" aria-label="Accent colour" className="mt-2 flex flex-wrap gap-3">
          {GEMS.map(g => {
            const on = gem.id === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={g.name}
                title={g.name}
                onClick={() => setGem(g.id)}
                className={`grid h-11 w-11 place-items-center rounded-full transition active:scale-90 ${on ? "ring-2 ring-offset-2 ring-offset-(--surface)" : "hover:scale-110"}`}
                style={{ background: g.color, "--tw-ring-color": g.color } as CSSProperties}
              >
                {on && <span className="text-sm font-bold text-black">✓</span>}
              </button>
            );
          })}
        </div>

        <button type="button" onClick={onClose} className="mt-6 w-full rounded-full bg-(--gem) py-3 text-sm font-bold text-black transition hover:opacity-90">
          looks good
        </button>
      </div>
    </div>,
    document.body,
  );
};
