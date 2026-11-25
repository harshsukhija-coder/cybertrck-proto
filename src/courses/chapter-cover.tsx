import type { CourseChapter } from "./networking";

type Props = {
  chapter: CourseChapter;
  /** Size of the big word, so small tiles and the hero fan stay balanced */
  wordClass?: string;
  className?: string;
};

/** Spotify-style duotone cover: the photo's darks map to duo[0], its lights to duo[1] */
export const ChapterCover = ({ chapter, wordClass = "text-5xl", className = "" }: Props) => {
  const [shadow, highlight] = chapter.duo;

  return (
    <div className={`relative isolate overflow-hidden ${className}`} style={{ background: highlight }}>
      <img
        src={chapter.photo}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        style={{ objectPosition: chapter.focus, filter: `grayscale(1) contrast(1.25) brightness(${chapter.exposure ?? 1})` }}
      />
      <div className="absolute inset-0 mix-blend-lighten" style={{ background: shadow }} />

      <span className="absolute left-4 top-3.5 font-jetbrains text-[11px] font-bold tracking-widest text-white/80">
        {String(chapter.number).padStart(2, "0")}
      </span>
      <span
        className={`absolute bottom-3 left-4 right-4 font-poster uppercase leading-[0.85] tracking-[-0.01em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.25)] ${wordClass}`}
      >
        {chapter.word}
      </span>
    </div>
  );
};
