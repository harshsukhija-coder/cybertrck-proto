import { plain, type Chip, type Term } from "./term";

/** How many monospace columns a string takes (emoji take two) */
export const columns = (text: string) => {
  let n = 0;
  for (const ch of plain(text)) {
    if (ch === "\u200d" || ch === "\ufe0f") continue;
    n += /\p{Extended_Pictographic}/u.test(ch) ? 2 : 1;
  }
  return n;
};

export const padEnd = (text: string, width: number) => text + " ".repeat(Math.max(0, width - columns(text)));
export const padStart = (text: string, width: number) => " ".repeat(Math.max(0, width - columns(text))) + text;

export const bar = (value: number, goal: number, width = 14) => {
  const filled = goal > 0 ? Math.round((Math.min(value, goal) / goal) * width) : 0;
  return `${"█".repeat(filled)}${"░".repeat(width - filled)}`;
};

/** Box-drawn table. Cells may use markup. */
export const table = (head: string[] | undefined, rows: string[][], tone = "dim") => {
  const all = head ? [head, ...rows] : rows;
  const widths = all[0].map((_, c) => Math.max(...all.map(r => columns(r[c] ?? ""))));
  const line = (l: string, m: string, r: string) => `{${tone}:${l}${widths.map(w => "─".repeat(w + 2)).join(m)}${r}}`;
  const row = (cells: string[], bold = false) =>
    `{${tone}:│}${cells.map((cell, c) => ` ${padEnd(bold ? `**${cell}**` : cell, widths[c])} `).join(`{${tone}:│}`)}{${tone}:│}`;
  return [
    line("┌", "┬", "┐"),
    ...(head ? [row(head, true), line("├", "┼", "┤")] : []),
    ...rows.map(r => row(r)),
    line("└", "┴", "┘"),
  ];
};

export const letter = (i: number) => String.fromCharCode(97 + i);

/** Reads "a", "b", "1", "2"… as an option index */
export const pickIndex = (input: string, count: number) => {
  const s = input.trim().toLowerCase();
  const n = /^\d+$/.test(s) ? Number(s) - 1 : s.length === 1 ? s.charCodeAt(0) - 97 : -1;
  return n >= 0 && n < count ? n : null;
};

export const printOptions = (t: Term, options: string[], numbered = false) =>
  options.forEach((o, i) => {
    const key = numbered ? String(i + 1) : letter(i);
    t.print(`  [[${key}]]  ${o}`, { indent: true });
  });

export const optionChips = (count: number, numbered = false): Chip[] =>
  Array.from({ length: count }, (_, i) => {
    const key = numbered ? String(i + 1) : letter(i);
    return { label: key, send: key };
  });

export const QUIT_CHIP: Chip = { label: "quit", send: "q" };
export const NEXT_CHIP: Chip = { label: "next ↵", send: "" };

export const isQuit = (input: string) => /^(q|quit|exit)$/i.test(input.trim());

export const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const narrow = () => window.innerWidth < 560;

/** A section title like "── games ──────" */
export const rule = (title: string, tone = "accent") => `{${tone}:── ${title} ${"─".repeat(Math.max(3, (narrow() ? 30 : 48) - columns(title)))}}`;
