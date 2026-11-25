import type { InterestId } from "./prefs";

/** How the tile sits in the collage: big poster, short tiles, tall strip, wide strip or the full-width finale */
export type TileShape = "hero" | "side" | "tall" | "wide" | "stack" | "boss";

export type LessonSlide =
  | { kind: "text"; title: string; body: string }
  | { kind: "stat"; big: string; body: string }
  | { kind: "quiz"; q: string; options: string[]; answer: number; why: string };

export type CourseChapter = {
  id: string;
  number: number;
  title: string;
  /** Big word printed on the cover */
  word: string;
  /** The question under the cover — the reason to click */
  hook: string;
  /** Half an answer, revealed on hover */
  tease: string;
  minutes: number;
  /** Unsplash photo, shown as a duotone */
  photo: string;
  /** Duotone colours: [shadows, highlights] */
  duo: [string, string];
  /** CSS object-position, so the subject stays in frame */
  focus: string;
  /** Brightness boost for very dark photos, so the highlight colour still shows */
  exposure?: number;
  shape: TileShape;
  /** Feed post caption */
  caption: string;
  /** Which onboarding interests this chapter matches */
  tags: InterestId[];
  /** Placeholder like count for the feed */
  likes: number;
  lesson: LessonSlide[];
};

export type Course = {
  id: string;
  title: string;
  /** Feed account name */
  handle: string;
  /** Short label for chips and stories */
  label: string;
  tagline: string;
  color: string;
  chapters: CourseChapter[];
};
