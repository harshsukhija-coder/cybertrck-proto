import type { Chapter } from "./story";

const fileSlug = (chapter: Chapter) =>
  `offtrck-${chapter.title.replace(/\s+/g, "-")}-${chapter.subtitle.replace(/\s+/g, "-")}`;

export const notesFile = (chapter: Chapter) => ({ name: `${fileSlug(chapter)}-notes.md`, text: chapter.notes });

export const quizFile = (chapter: Chapter) => {
  const quiz = chapter.quiz ?? [];
  const questions = quiz
    .map((q, i) => `### ${i + 1}. ${q.question}\n${q.options.map((option, j) => `- ${String.fromCharCode(97 + j)}) ${option}`).join("\n")}`)
    .join("\n\n");
  const answers = quiz
    .map((q, i) => `${i + 1}. **${String.fromCharCode(97 + q.answer)}) ${q.options[q.answer]}** · ${q.explanation}`)
    .join("\n");
  const text = `# ${chapter.title} · ${chapter.subtitle} · quiz\n\n> offtrck · nmap module · try it without peeking, answers at the bottom.\n\n${questions}\n\n---\n\n## answer key\n${answers}\n`;
  return { name: `${fileSlug(chapter)}-quiz.md`, text };
};

export const downloadText = ({ name, text }: { name: string; text: string }) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};
