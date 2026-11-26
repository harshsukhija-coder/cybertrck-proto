import { useEffect } from "react";
import { BadgeMedal } from "./badge-medal";
import { badgeHash, findBadge } from "./badges";

export const BadgeToast = ({ ids, onClose }: { ids: string[]; onClose: () => void }) => {
  const badge = ids.length ? findBadge(ids[ids.length - 1]) : undefined;

  useEffect(() => {
    if (!badge) return;
    const t = window.setTimeout(onClose, 9000);
    return () => window.clearTimeout(t);
  }, [badge, onClose]);

  if (!badge) return null;
  const more = ids.length - 1;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 md:bottom-6" role="status">
      <div className="flex w-full max-w-sm animate-pop items-center gap-3 rounded-3xl border border-(--line) bg-[#111318]/95 p-3 pr-4 shadow-2xl shadow-black/60 backdrop-blur-xl">
        <BadgeMedal badge={badge} earned className="w-14" />
        <div className="min-w-0 flex-1">
          <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: badge.color }}>
            new badge{more > 0 ? ` +${more} more` : ""}
          </p>
          <p className="truncate font-display text-base font-bold lowercase">{badge.name}</p>
          <a href={badgeHash(more > 0 ? undefined : badge.id)} onClick={onClose} className="text-sm font-semibold text-(--gem) hover:underline">
            {more > 0 ? "see your badges →" : "share it →"}
          </a>
        </div>
        <button type="button" onClick={onClose} aria-label="dismiss" className="self-start text-(--muted) hover:text-(--fg)">
          ✕
        </button>
      </div>
    </div>
  );
};
