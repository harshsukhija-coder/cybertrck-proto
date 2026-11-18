import type { Chapter, Course } from "./story";

const fileSlug = (course: Course, chapter: Chapter) =>
  `offtrck-${course.id}-${chapter.title.replace(/\s+/g, "-")}-${chapter.subtitle.replace(/\s+/g, "-")}`;

export const notesFile = (course: Course, chapter: Chapter) => ({ name: `${fileSlug(course, chapter)}-notes.md`, text: chapter.notes });

export const quizFile = (course: Course, chapter: Chapter) => {
  const quiz = chapter.quiz ?? [];
  const questions = quiz
    .map((q, i) => `### ${i + 1}. ${q.question}\n${q.options.map((option, j) => `- ${String.fromCharCode(97 + j)}) ${option}`).join("\n")}`)
    .join("\n\n");
  const answers = quiz
    .map((q, i) => `${i + 1}. **${String.fromCharCode(97 + q.answer)}) ${q.options[q.answer]}** · ${q.explanation}`)
    .join("\n");
  const text = `# ${chapter.title} · ${chapter.subtitle} · quiz\n\n> offtrck · ${course.moduleName} module · try it without peeking, answers at the bottom.\n\n${questions}\n\n---\n\n## answer key\n${answers}\n`;
  return { name: `${fileSlug(course, chapter)}-quiz.md`, text };
};

export const downloadText = ({
  name,
  text,
  mime = "text/markdown;charset=utf-8",
}: {
  name: string;
  text: string;
  mime?: string;
}) => {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};
