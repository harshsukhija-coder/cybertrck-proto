import type { ComponentType, SVGProps } from "react";
import bobAvatar from "../assets/characters/bob.jpg";
import fridayAvatar from "../assets/characters/friday.jpg";
import kimAvatar from "../assets/characters/kim.jpg";
import rameshAvatar from "../assets/characters/ramesh.jpg";
import sallyAvatar from "../assets/characters/sally.jpg";
import type { VividColor } from "./palette";

export type Speaker = "system" | "friday" | "ramesh" | "kim" | "sally" | "bob" | "you";

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
  | "recon-pipeline"
  | "http-vs-https"
  | "internet-path"
  | "wireshark-http"
  | "wireshark-tls"
  | "encrypt-flow"
  | "caesar-wheel"
  | "caesar-crack"
  | "key-space"
  | "symmetric-flow"
  | "key-exchange-problem"
  | "key-pair"
  | "padlock-box"
  | "speed-race"
  | "https-handshake"
  | "session-keys"
  | "wifi-handshake"
  | "monitor-mode"
  | "airodump-scan"
  | "target-lock"
  | "deauth-kick"
  | "handshake-caught"
  | "rockyou-crack"
  | "wifi-defense"
  | "smarter-neighbor"
  | "traffic-leaks"
  | "glass-vs-pipe"
  | "vpn-tunnel-flow"
  | "ip-mask"
  | "vpn-limits"
  | "vpn-vs-proxy"
  | "vpn-recap"
  | "trojan-package"
  | "extension-trick"
  | "reverse-shell"
  | "trojan-defense";

// Text and terminal output can mark important bits as {color:text}, e.g. {pink:192.168.1.30}
export type TerminalBlock = {
  command: string;
  output?: string;
  prompt?: string;
  title?: string;
};

export type SallyScreen = {
  title?: string;
  mode: "idle" | "mail" | "downloads" | "opened";
  email?: { from: string; subject: string; body: string; attachment: string };
  files?: { name: string; icon: "image" | "exe"; selected?: boolean }[];
  hideExtensions?: boolean;
  note?: string;
};

// Side-by-side: Kim's Kali terminal + Sally's Windows desktop
export type DualView = {
  kim?: TerminalBlock;
  sally?: SallyScreen;
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
  // Shows the image wide (scene illustrations) instead of meme-sized
  illustration?: boolean;
  terminal?: TerminalBlock;
  dual?: DualView;
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

export type Course = {
  id: string;
  title: string;
  // Small pill in the window header, e.g. the scan target
  badge: string;
  moduleName: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  chapters: Chapter[];
};

export const PASS_SCORE = 0.9;

export const speakers: Record<Speaker, { name: string; color: string; avatar?: string }> = {
  system: { name: "system", color: "#3DDC84" },
  friday: { name: "friday", color: "#C9A35A", avatar: fridayAvatar },
  ramesh: { name: "ramesh", color: "#6FA8B8", avatar: rameshAvatar },
  kim: { name: "kim", color: "#3DDC84", avatar: kimAvatar },
  sally: { name: "sally", color: "#8EC7FF", avatar: sallyAvatar },
  bob: { name: "bob", color: "#FFD23F", avatar: bobAvatar },
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
