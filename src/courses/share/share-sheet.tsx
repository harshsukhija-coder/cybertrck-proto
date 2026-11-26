import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { drawPostCard, type SharePost } from "./post-share";
import { SharePanel } from "./share-panel";

/** Pop-up with the share image, caption and social buttons for one feed post */
export const ShareSheet = ({ post, onClose, newCaption }: { post: SharePost; onClose: () => void; newCaption?: () => string }) => {
  const makeImage = useCallback(() => drawPostCard(post), [post]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`share: ${post.title}`}
        onClick={e => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-2xl animate-pop overflow-y-auto rounded-t-[28px] border border-(--line) bg-(--surface) p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-[28px] sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: post.color }}>
              share · {post.label}
            </p>
            <h2 className="mt-1 line-clamp-2 font-display text-2xl font-bold lowercase leading-tight">{post.title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/5 hover:bg-white/10">
            ✕
          </button>
        </div>
        <SharePanel
          makeImage={makeImage}
          initialCaption={post.caption}
          fileName={`offtrck-${post.key}.png`}
          title={post.title}
          color={post.color}
          url={post.url}
          newCaption={newCaption}
        />
      </div>
    </div>,
    document.body,
  );
};
