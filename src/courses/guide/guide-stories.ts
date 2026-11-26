import type { InterestId } from "../prefs";
import type { Slide, Story } from "../stories/sources";
import { pathStatus, type GuideState } from "./guide-store";
import { pathHash, pathsFor, stepHref, type LearningPath } from "./paths";

const SOURCE = "offtrck guide";

const introSlides = (path: LearningPath): Slide[] => [
  {
    id: `path-${path.id}-intro`,
    kicker: `roadmap · ${path.title}`,
    title: `where are you on the ${path.title} path?`,
    body: "answer up to 5 quick questions and get your next 3 steps. takes about a minute.",
    list: path.stages.map((s, i) => ({ label: `${i + 1}. ${s.name}`, value: i === 0 ? "start" : "" })),
    link: { href: pathHash(path.id, true), label: "take the check" },
    source: SOURCE,
  },
  {
    id: `path-${path.id}-careers`,
    kicker: "where this can take you",
    title: path.careers.map(c => c.role).join(" · "),
    body: path.careers[0].does,
    link: { href: pathHash(path.id), label: "see the roadmap" },
    source: SOURCE,
  },
];

const progressSlides = (path: LearningPath, state: GuideState, finished: string[]): Slide[] => {
  const status = pathStatus(path, state, finished);
  const total = path.stages.length;
  const complete = status.stage >= total;
  const slides: Slide[] = [
    {
      id: `path-${path.id}-where-${status.stage}-${status.stepsDone}`,
      kicker: `your path · ${path.title}`,
      title: complete ? "you finished the whole path. 🏆" : `you're on stage ${status.stage + 1}: ${path.stages[status.stage].name}`,
      stat: { value: `${status.stepsDone}/${status.stepsTotal}`, label: "steps done" },
      list: path.stages.map((s, i) => ({ label: `${i + 1}. ${s.name}`, value: i < status.stage ? "✓" : i === status.stage ? "← you" : "" })),
      source: SOURCE,
    },
  ];
  status.next.forEach((step, k) => {
    const href = stepHref(step);
    slides.push({
      id: `path-${path.id}-step-${step.id}`,
      kicker: `next step ${k + 1} of ${status.next.length}`,
      title: step.label,
      body: `${step.why}. about ${step.minutes < 60 ? `${step.minutes} min` : `${Math.round(step.minutes / 60)} h`}.`,
      link: href ? { href, label: step.kind === "web" ? `open ${step.site}` : "start now" } : { href: pathHash(path.id), label: "tick it on your roadmap" },
      source: SOURCE,
    });
  });
  if (!complete) {
    const { check, name } = path.stages[status.stage];
    slides.push({
      id: `path-${path.id}-quiz-${status.stage}`,
      kicker: `can you answer this yet? · ${name} level`,
      title: check.q,
      trivia: { options: check.options, answer: check.answer },
      source: SOURCE,
    });
  } else {
    slides.push({
      id: `path-${path.id}-careers-done`,
      kicker: "where this can take you",
      title: path.careers.map(c => c.role).join(" · "),
      body: path.careers[0].does,
      source: SOURCE,
    });
  }
  return slides;
};

/** One story per path you're into: your stage, next steps and a taste of the next level */
export const guideStories = (interests: InterestId[], state: GuideState, finished: string[]): Story[] =>
  pathsFor(interests).map(path => ({
    id: `path-${path.id}`,
    label: `${path.label} path`,
    color: path.color,
    glyph: path.glyph,
    interests: path.interests,
    slides: state.checks[path.id] ? progressSlides(path, state, finished) : introSlides(path),
  }));
