import { useEffect, useState } from "react";
import { shareLinks } from "./share-utils";

const copy = (text: string) => navigator.clipboard?.writeText(text).catch(() => undefined);

type Props = {
  /** Must be stable (useCallback), it runs again whenever it changes */
  makeImage: () => Promise<Blob>;
  initialCaption: string;
  fileName: string;
  title: string;
  color: string;
  /** Link to what's being shared, offered as "copy link" */
  url?: string;
  /** Writes a fresh random caption, for the "another caption" button */
  newCaption?: () => string;
};

/** Image preview, editable caption and buttons for every way to share */
export const SharePanel = ({ makeImage, initialCaption, fileName, title, color, url, newCaption }: Props) => {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    makeImage()
      .then(blob => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImage({ blob, url: objectUrl });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [makeImage]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(t);
  }, [notice]);

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
      if (canShareFile && file) await navigator.share({ files: [file], text: caption, title });
      else await navigator.share({ text: caption, title });
    } catch {
      /* the user closed the share sheet */
    }
  };

  const button = "rounded-full border border-(--line) bg-(--panel) px-4 py-2.5 text-sm font-semibold transition hover:border-white/30";

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
      <div className="mx-auto w-full max-w-[260px] self-start overflow-hidden rounded-2xl border border-(--line) bg-black sm:max-w-none">
        {image ? (
          <img src={image.url} alt={`share image: ${title}`} className="block aspect-[4/5] w-full" />
        ) : failed ? (
          <div className="grid aspect-[4/5] place-items-center p-4 text-center text-xs text-(--muted)">couldn't draw the image. the caption and links still work.</div>
        ) : (
          <div className="aspect-[4/5] animate-pulse bg-white/5" />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <label className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--muted)" htmlFor="share-caption">
            your caption (edit it if you like)
          </label>
          {newCaption && (
            <button
              type="button"
              onClick={() => {
                let next = newCaption();
                for (let tries = 0; next === caption && tries < 5; tries++) next = newCaption();
                setCaption(next);
              }}
              className="shrink-0 rounded-full border border-(--line) px-3 py-1 text-xs font-semibold transition hover:border-white/30"
            >
              🎲 another caption
            </button>
          )}
        </div>
        <textarea
          id="share-caption"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          rows={7}
          className="mt-2 w-full resize-none rounded-2xl border border-(--line) bg-black/40 p-3 text-sm leading-relaxed outline-none focus:border-white/30"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {"share" in navigator && (
            <button type="button" onClick={nativeShare} className="rounded-full px-4 py-2.5 text-sm font-semibold text-black" style={{ background: color }}>
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
          {url && (
            <button
              type="button"
              onClick={() => {
                copy(url);
                setNotice("link copied ✓");
              }}
              className={button}
            >
              🔗 copy link
            </button>
          )}
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
          {shareLinks(caption, url).map(link => (
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
