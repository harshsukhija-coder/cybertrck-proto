import type { CourseChapter, LessonSlide } from "./types";

export type ChapterLayout = "carousel" | "poster" | "quiz" | "notes" | "split" | "story";

export const slideOf = <K extends LessonSlide["kind"]>(chapter: CourseChapter, kind: K) =>
  chapter.lesson.find((s): s is Extract<LessonSlide, { kind: K }> => s.kind === kind);

/** Layouts this chapter has enough content for */
export const layoutsFor = (chapter: CourseChapter): ChapterLayout[] => [
  "carousel",
  "split",
  ...(slideOf(chapter, "stat") ? (["poster"] as const) : []),
  ...(slideOf(chapter, "quiz") ? (["quiz"] as const) : []),
  ...(chapter.lesson.filter(s => s.kind === "text").length >= 2 ? (["notes"] as const) : []),
  ...(slideOf(chapter, "story") ? (["story"] as const) : []),
];
