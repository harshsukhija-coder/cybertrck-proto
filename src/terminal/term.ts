export type Tone = "fg" | "muted" | "dim" | "accent" | "green" | "red" | "yellow" | "blue" | "cyan" | "pink" | "orange" | "purple" | "code";

export type Seg = {
  text: string;
  tone?: Tone;
  /** Any CSS colour, wins over `tone` */
  color?: string;
  bold?: boolean;
  /** Tapping it types this command */
  cmd?: string;
  href?: string;
};

type EntryBody =
  | { kind: "line"; segs: Seg[]; bar?: string; indent?: boolean }
  /** Never wraps; scrolls sideways on small screens (tables, ascii art) */
  | { kind: "block"; lines: Seg[][] }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "echo"; prompt: string; text: string };

export type Entry = { id: number; owner: number } & EntryBody;

export type Chip = { label: string; send: string };

/** Something that takes over the prompt for a while: a lesson, a quiz, a game */
export type Program = {
  name: string;
  prompt?: () => string;
  chips?: () => Chip[];
  input: (line: string) => void;
  /** Called on files dropped or picked while this program runs */
  file?: (file: File) => void;
  /** Called when the program is stopped from outside (ctrl+c, quit) */
  stop?: () => void;
  /** Hide the typed text in the echo, for passwords */
  masked?: boolean;
  /** Keys that send an answer right away while the input is empty, e.g. ArrowLeft → "l" */
  keys?: Record<string, string>;
};

export type Command = {
  name: string;
  aliases?: string[];
  /** Short usage, like "learn <course> [chapter]" */
  usage: string;
  about: string;
  group: string;
  hidden?: boolean;
  run: (t: Term, args: string[], raw: string) => void | Promise<void>;
  complete?: (args: string[], t: Term) => string[];
};

const TONES = "fg|muted|dim|accent|green|red|yellow|blue|cyan|pink|orange|purple|code";
const TOKEN = new RegExp(String.raw`\*\*(.+?)\*\*|` + "`([^`]+)`" + String.raw`|\{(${TONES}|#[0-9a-fA-F]{3,8}):([^{}]+)\}|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|<<([^>|]+)\|([^>]+)>>`, "g");

/**
 * Tiny markup for terminal text:
 * **bold**, `code`, {green:coloured}, {#ff00aa:any colour}, [[tap me]] or [[label|command]], <<label|https://link>>
 */
export const parse = (text: string): Seg[] => {
  const segs: Seg[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index > last) segs.push({ text: text.slice(last, m.index) });
    if (m[1] !== undefined) segs.push({ text: m[1], bold: true, tone: "fg" });
    else if (m[2] !== undefined) segs.push({ text: m[2], tone: "code" });
    else if (m[3] !== undefined) {
      const outer: Partial<Seg> = m[3].startsWith("#") ? { color: m[3] } : { tone: m[3] as Tone };
      segs.push(...parse(m[4]).map(s => ({ ...s, ...(s.tone === "code" || s.color ? {} : outer) })));
    }
    else if (m[5] !== undefined) segs.push(...parse(m[5]).map(s => ({ ...s, cmd: m[6] ?? plain(m[5]) })));
    else segs.push({ text: m[7], href: m[8] });
    last = m.index + m[0].length;
  }
  if (last < text.length) segs.push({ text: text.slice(last) });
  return segs;
};

/** Removes the markup, for measuring and copying */
export const plain = (text: string) => parse(text).map(s => s.text).join("");

const MAX_ENTRIES = 1500;

export class Term {
  entries: Entry[] = [];
  program: Program | null = null;
  history: string[] = [];
  cwd = "~";
  username: string;
  /** Highlight colour, picked with the `theme` command */
  accent = "#4f8cff";
  commands = new Map<string, Command>();
  /** Set by the page: opens the file picker */
  pickFile: (accept: string) => void = () => {};
  /** Set by the page: logs out of the whole app */
  logout: () => void = () => {};
  /** Runs after every command and program input, e.g. to announce new badges */
  afterInput: (t: Term) => void = () => {};
  /** Gets a line no command matched, e.g. a file name. Returns true if it handled it. */
  fallback: (t: Term, line: string) => boolean = () => false;

  private nextId = 1;
  /** Which program printed an entry: 0 is the shell */
  private owner = 0;
  private runCount = 0;
  private listeners = new Set<() => void>();
  private version = 0;

  constructor(username: string) {
    this.username = username;
  }

  // ---------- React glue ----------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getVersion = () => this.version;

  private changed() {
    this.version++;
    for (const l of this.listeners) l();
  }

  // ---------- output ----------

  private push(entry: EntryBody) {
    this.entries.push({ ...entry, id: this.nextId++, owner: this.owner });
    if (this.entries.length > MAX_ENTRIES) this.entries.splice(0, this.entries.length - MAX_ENTRIES);
    this.changed();
  }

  /** Prints text with markup. Each "\n" starts a new line. */
  print(text = "", opts: { bar?: string; indent?: boolean } = {}) {
    for (const line of text.split("\n")) this.push({ kind: "line", segs: parse(line), ...opts });
  }

  segs(segs: Seg[]) {
    this.push({ kind: "line", segs });
  }

  block(lines: string[]) {
    this.push({ kind: "block", lines: lines.map(parse) });
  }

  image(src: string, alt = "", caption?: string) {
    this.push({ kind: "image", src, alt, caption });
  }

  clear() {
    this.entries = [];
    this.changed();
  }

  // ---------- programs ----------

  get isShell() {
    return this.program === null;
  }

  get currentOwner() {
    return this.owner;
  }

  /** Hands the prompt to a program until it calls `exit` */
  start(program: Program) {
    this.program = program;
    this.owner = ++this.runCount;
    this.changed();
  }

  exit() {
    this.program = null;
    this.owner = 0;
    this.changed();
    this.afterInput(this);
  }

  /** Stops whatever is running, like ctrl+c. `typed` is what was on the line. */
  interrupt(typed = "") {
    this.push({ kind: "echo", prompt: this.prompt(), text: `${typed}^C` });
    if (!this.program) return;
    this.program.stop?.();
    this.exit();
  }

  /** Lets a program redraw its prompt or chips without printing */
  refresh() {
    this.changed();
  }

  prompt() {
    if (this.program) return this.program.prompt?.() ?? `${this.program.name} ›`;
    return `${this.username}@offtrck:${this.cwd}$`;
  }

  dropFile(file: File) {
    if (this.program?.file) this.program.file(file);
    else this.print(`{red:no program is waiting for a file.} open a lab first, e.g. [[lab 1]]`);
  }

  // ---------- input ----------

  /** What the user typed or tapped */
  submit(line: string) {
    const text = line.replace(/\s+$/, "");
    if (text || !this.program) this.push({ kind: "echo", prompt: this.prompt(), text: this.program?.masked ? "•".repeat(text.length) : text });
    if (this.program) {
      if (/^(\^c|ctrl\+c)$/i.test(text.trim())) {
        this.program.stop?.();
        this.exit();
        return;
      }
      if (/^clear$/i.test(text.trim()) && !this.program.masked) {
        this.clear();
        return;
      }
      const typed = this.program.name === "login" ? undefined : this.find(text.trim().split(/\s+/)[0]);
      if (typed && typed.name !== "logout") {
        this.program.stop?.();
        this.exit();
        if (this.history.at(-1) !== text.trim()) this.history.push(text.trim());
        void this.run(text);
        return;
      }
      this.program.input(text.trim());
      if (this.program) this.afterInput(this);
      return;
    }
    if (text.trim() && this.history.at(-1) !== text.trim()) this.history.push(text.trim());
    void this.run(text);
  }

  /** A tapped command from an older output: leave any running program first */
  tap(cmd: string, owner: number) {
    if (this.program && owner !== this.owner) {
      this.program.stop?.();
      this.exit();
    }
    this.submit(cmd);
  }

  async run(line: string) {
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (!words.length) return;
    const [name, ...args] = words;
    const command = this.find(name);
    if (!command && this.fallback(this, line.trim())) return;
    if (!command) {
      const guess = this.suggest(name);
      this.print(`{red:command not found:} ${name}${guess ? `. did you mean [[${guess}]]?` : ""} type [[help]] to see everything.`);
      return;
    }
    try {
      await command.run(this, args, line.trim().slice(name.length).trim());
    } catch (error) {
      this.print(`{red:${command.name} crashed:} ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!this.program) this.afterInput(this);
  }

  register(list: Command[]) {
    for (const c of list) {
      this.commands.set(c.name, c);
      for (const a of c.aliases ?? []) this.commands.set(a, c);
    }
  }

  find(name: string) {
    const clean = name.replace(/^\.\//, "");
    return this.commands.get(clean.toLowerCase());
  }

  private suggest(name: string) {
    const lower = name.toLowerCase();
    const names = [...new Set([...this.commands.values()].filter(c => !c.hidden).map(c => c.name))];
    return names.find(n => n.startsWith(lower.slice(0, 2))) ?? names.find(n => lower.includes(n));
  }

  /** Tab completion: returns the completed line, or the list of options when it's ambiguous */
  complete(line: string): { line: string; options: string[] } {
    if (this.program) return { line, options: [] };
    const words = line.split(/\s+/);
    const last = words.at(-1) ?? "";
    let pool: string[];
    if (words.length <= 1) {
      pool = [...new Set([...this.commands.values()].filter(c => !c.hidden).map(c => c.name))];
    } else {
      pool = this.find(words[0])?.complete?.(words.slice(1), this) ?? [];
    }
    const options = pool.filter(p => p.startsWith(last)).sort();
    if (options.length === 1) return { line: [...words.slice(0, -1), options[0]].join(" ") + " ", options: [] };
    const common = options.reduce((acc, o) => {
      let i = 0;
      while (i < acc.length && acc[i] === o[i]) i++;
      return acc.slice(0, i);
    }, options[0] ?? "");
    return { line: common.length > last.length ? [...words.slice(0, -1), common].join(" ") : line, options };
  }
}
