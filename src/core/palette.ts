// Bright colours used to highlight the important bits in lessons, diagrams and terminal output
export const vivid = {
  pink: "#ff4fd8",
  yellow: "#ffd23f",
  cyan: "#22d3ee",
  orange: "#ff8a3d",
  purple: "#a78bfa",
  red: "#ff5d73",
  green: "#3ddc84",
  blue: "#60a5fa",
} as const;

export type VividColor = keyof typeof vivid;

export const isVividColor = (value: string): value is VividColor => value in vivid;
