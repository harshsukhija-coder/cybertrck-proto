import { useEffect, useState } from "react";
import { INTERESTS, STYLES, type Prefs } from "../prefs";
import { useProgress } from "../progress";
import { BadgeMedal } from "./badge-medal";
import { buildCaption, drawBadgeCard, formatDate, shareLinks } from "./badge-share";
import { badgeHash, findBadge, type Badge } from "./badges";
import { useBadges, type BadgeState } from "./use-badges";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const TIER_LABEL = { bronze: "easy", silver: "medium", gold: "hard" } as const;

const BadgeTile = ({ state }: { state: BadgeState }) => {
  const { badge, value, goal, earnedAt } = state;
  return (
    <a
      href={badgeHash(badge.id)}
      className={`group flex flex-col items-center rounded-3xl border p-4 text-center transition hover:-translate-y-0.5 ${
        earnedAt ? "border-(--line) bg-(--panel) hover:border-white/25" : "border-dashed border-(--line) hover:border-white/20"
      }`}
    >
      <BadgeMedal badge={badge} earned={!!earnedAt} className="w-[72px] transition-transform group-hover:scale-105" />
      <p className="mt-3 font-display text-sm font-bold lowercase leading-tight">{badge.name}</p>
      {earnedAt ? (
        <p className="mt-1 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{formatDate(earnedAt)}</p>
      ) : (
        <>
          <p className="mt-1 line-clamp-2 text-xs text-(--muted)">{badge.how}</p>
          <div className="mt-auto w-full pt-3">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${(value / goal) * 100}%`, background: badge.color }} />
            </div>
            <p className="mt-1 font-jetbrains text-[10px] text-(--muted)">
              {value}/{goal}
            </p>
          </div>
        </>
      )}
    </a>
  );
};

const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => undefined);

const SharePanel = ({ badge, username, earnedAt }: { badge: Badge; username: string; earnedAt: string }) => {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [caption, setCaption] = useState(() => buildCaption(badge));
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let url = "";
    let cancelled = false;
    drawBadgeCard(badge, username, earnedAt).then(blob => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setImage({ blob, url });
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [badge, username, earnedAt]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

  const fileName = `offtrck-${badge.id}.png`;
  const download = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image.url;
    a.download = fileName;
    a.click();
  };

  const file = image ? new File([image.blob], fileName, { type: "image/png" }) : null;
  const canShareFile = !!file && !!navigator.canShare?.({ files: [file] });

  const nativeShare = async () => {
    try {
      if (canShareFile && file) await navigator.share({ files: [file], text: caption, title: `offtrck badge: ${badge.name}` });
      else await navigator.share({ text: caption });
    } catch {
      /* the user closed the share sheet */
    }
  };

  const button = "rounded-full border border-(--line) bg-(--panel) px-4 py-2.5 text-sm font-semibold transition hover:border-white/30";

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[260px] self-start overflow-hidden rounded-2xl border border-(--line) bg-black sm:max-w-none">
        {image ? <img src={image.url} alt={`share image for the ${badge.name} badge`} className="block aspect-[4/5] w-full" /> : <div className="aspect-[4/5] animate-pulse bg-white/5" />}
      </div>

      <div className="min-w-0">
        <label className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)" htmlFor="badge-caption">
          your caption (edit it if you like)
        </label>
        <textarea
          id="badge-caption"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={7}
          className="mt-2 w-full resize-none rounded-2xl border border-(--line) bg-black/40 p-3 text-sm leading-relaxed outline-none focus:border-white/30"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {"share" in navigator && (
            <button type="button" onClick={nativeShare} className="rounded-full px-4 py-2.5 text-sm font-semibold text-black" style={{ background: badge.color }}>
              share…
            </button>
          )}
          <button type="button" onClick={download} disabled={!image} className={button}>
            ⬇ save image
          </button>
          <button
            type="button"
            onClick={() => {
              copy(caption);
              setNotice("caption copied ✓");
            }}
            className={button}
          >
            copy caption
          </button>
        </div>

        <p className="mt-5 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">post it on</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              download();
              copy(caption);
              setNotice("image saved and caption copied. open instagram and paste it in your post ✓");
            }}
            className={button}
          >
            Instagram
          </button>
          {shareLinks(caption).map(link => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                copy(caption);
                if (link.id === "facebook" || link.id === "linkedin") setNotice("caption copied. attach the saved image for the best post ✓");
              }}
              className={button}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="mt-3 min-h-5 text-sm text-(--gem)" role="status">
          {notice}
        </p>
      </div>
    </div>
  );
};

const BadgeDetail = ({ state, username }: { state: BadgeState; username: string }) => {
  const { badge, value, goal, earnedAt } = state;
  const close = () => (window.location.hash = badgeHash());

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={close}>
      <div
        role="dialog"
        aria-label={badge.name}
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl animate-pop overflow-y-auto rounded-t-[28px] border border-(--line) bg-[#0d0f14] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7"
      >
        <div className="flex items-start gap-4">
          <BadgeMedal badge={badge} earned={!!earnedAt} className="w-20 sm:w-24" />
          <div className="min-w-0 flex-1">
            <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: earnedAt ? badge.color : undefined }}>
              {earnedAt ? `earned ${formatDate(earnedAt)}` : `locked · ${TIER_LABEL[badge.tier]}`}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold lowercase leading-tight sm:text-3xl">{badge.name}</h2>
            <p className="mt-1 text-(--muted)">{badge.how}</p>
          </div>
          <button type="button" onClick={close} aria-label="close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 hover:bg-white/10">
            ✕
          </button>
        </div>

        {earnedAt ? (
          <SharePanel badge={badge} username={username} earnedAt={earnedAt} />
        ) : (
          <div className="mt-6">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${(value / goal) * 100}%`, background: badge.color }} />
            </div>
            <p className="mt-2 text-sm text-(--muted)">
              {value}/{goal} so far. once you earn it, you can share it with a ready-made image and caption.
            </p>
            <a href={badge.go} className="mt-5 inline-flex rounded-full px-5 py-3 font-semibold text-black" style={{ background: badge.color }}>
              go earn it →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

type Props = { badgeId?: string; username: string; prefs: Prefs };

export const BadgesPage = ({ badgeId, username, prefs }: Props) => {
  const { list, earnedCount } = useBadges();
  const { totalDone, daysLearned } = useProgress();
  const earned = list.filter(b => b.earnedAt);
  const locked = list.filter(b => !b.earnedAt).sort((a, b) => b.value / b.goal - a.value / a.goal);
  const open = badgeId && findBadge(badgeId) ? list.find(b => b.badge.id === badgeId) : undefined;

  return (
    <>
      <div className="animate-tile-in px-4 sm:px-0">
        <section className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white/10 font-display text-2xl font-bold uppercase">{username[0]}</span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-bold tracking-[-0.03em]">{username}</h1>
            <p className="text-sm text-(--muted)">
              {plural(totalDone, "chapter")} · {plural(daysLearned, "day")} learning · {plural(earnedCount, "badge")}
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-3xl border border-(--line) bg-(--panel) p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold lowercase">your vibe</h2>
            <a href="#/feed/start" className="text-xs font-semibold text-(--gem) hover:underline">
              edit
            </a>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {prefs.interests.map(id => {
              const interest = INTERESTS.find(i => i.id === id);
              return (
                <span key={id} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${interest?.color}22`, color: interest?.color }}>
                  {interest?.label}
                </span>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-(--muted)">learns by: {prefs.styles.map(s => STYLES.find(x => x.id === s)?.word).join(", ")}</p>
        </section>

        <h2 className="mt-9 font-display text-3xl font-bold lowercase tracking-[-0.03em]">
          your <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">badges</span>
        </h2>
        <p className="mt-1 text-(--muted)">earn them by learning and playing. tap one you've earned to share it.</p>

        {earned.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {earned.map(state => (
              <BadgeTile key={state.badge.id} state={state} />
            ))}
          </div>
        )}

        <p className="mt-8 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)">
          still locked · {locked.length}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {locked.map(state => (
            <BadgeTile key={state.badge.id} state={state} />
          ))}
        </div>
      </div>
      {open && <BadgeDetail key={open.badge.id} state={open} username={username} />}
    </>
  );
};
