import fridayAvatar from "../assets/characters/friday.jpg";
import rameshAvatar from "../assets/characters/ramesh.jpg";
import { chapterFive } from "./chapters/chapter-05";
import { chapterFour } from "./chapters/chapter-04";
import { chapterOne } from "./chapters/chapter-01";
import { chapterThree } from "./chapters/chapter-03";
import { chapterTwo } from "./chapters/chapter-02";
import type { VividColor } from "./palette";

export type Speaker = "system" | "friday" | "ramesh" | "you";

export type VisualKey =
  | "office-network"
  | "ip-anatomy"
  | "packet-journey"
  | "broadcast"
  | "who-is-who"
  | "devices-found"
  | "network-diagram"
  | "port-doors"
  | "handshake"
  | "port-coverage"
  | "os-fingerprint"
  | "recon-pipeline";

// Text and terminal output can mark important bits as {color:text}, e.g. {pink:192.168.1.30}
export type TerminalBlock = {
  command: string;
  output?: string;
  prompt?: string;
  title?: string;
};

export type Callout = {
  tone: "tip" | "warning" | "danger";
  title: string;
  text: string;
};

export type StoryMessage = {
  from: Speaker;
  text?: string;
  image?: string;
  caption?: string;
  terminal?: TerminalBlock;
  visual?: VisualKey;
  callout?: Callout;
  // Index of the chapter whose notes + quiz can be downloaded from this message
  downloads?: number;
};

// Asks the learner something (like their OS) once; later choice scenes with the same key reuse the answer
export type ChoiceScene = {
  kind: "choice";
  key: string;
  prompt: StoryMessage[];
  options: { label: string; messages: StoryMessage[] }[];
};

export type Scene = StoryMessage[] | ChoiceScene;

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Chapter = {
  title: string;
  subtitle: string;
  scenes: Scene[];
  quiz?: QuizQuestion[];
  notes: string;
};

export type Choices = Record<string, number>;

export const PASS_SCORE = 0.9;

export const speakers: Record<Speaker, { name: string; color: string; avatar?: string }> = {
  system: { name: "system", color: "#3DDC84" },
  friday: { name: "friday", color: "#C9A35A", avatar: fridayAvatar },
  ramesh: { name: "ramesh", color: "#6FA8B8", avatar: rameshAvatar },
  you: { name: "you", color: "#A1A8B0" },
};

export type HighlightPart = string | { color: VividColor; text: string };

const HIGHLIGHT_PATTERN = /\{(pink|yellow|cyan|orange|purple|red|green|blue):([^{}]+)\}/g;

export const parseHighlights = (text: string): HighlightPart[] => {
  const parts: HighlightPart[] = [];
  let last = 0;
  for (const match of text.matchAll(HIGHLIGHT_PATTERN)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push({ color: match[1] as VividColor, text: match[2] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
};

export const stripHighlights = (text: string) => text.replace(HIGHLIGHT_PATTERN, "$2");

export const isChoiceScene = (scene: Scene): scene is ChoiceScene => !Array.isArray(scene);

export const choiceOptionsMessage = (scene: ChoiceScene): StoryMessage => ({
  from: "system",
  text: `${scene.options.map((option, i) => `${i + 1}) ${option.label}`).join("\n")}\n\ntype the number and press enter.`,
});

export const pickedMessage = (scene: ChoiceScene, picked: number): StoryMessage => ({
  from: "system",
  text: `showing: ${scene.options[picked].label}`,
});

// What a scene looked like once it has been played, used to rebuild the chat on resume
export const playedScene = (scene: Scene, choices: Choices): StoryMessage[] => {
  if (!isChoiceScene(scene)) return scene;
  const picked = choices[scene.key];
  if (picked === undefined || !scene.options[picked]) return scene.prompt;
  return [...scene.prompt, pickedMessage(scene, picked), ...scene.options[picked].messages];
};

export const chapters: Chapter[] = [chapterOne, chapterTwo, chapterThree, chapterFour, chapterFive];
