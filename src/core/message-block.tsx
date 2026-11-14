import { downloadText, notesFile, quizFile } from "./downloads";
import { vivid } from "./palette";
import {
  parseHighlights,
  speakers,
  type Callout,
  type Course,
  type StoryMessage,
  type TerminalBlock,
} from "./story";
import Visual from "./visuals";

// chip = padded pill for prose; flat keeps monospace columns aligned in terminal output
export const Highlighted = ({ text, chip = true }: { text: string; chip?: boolean }) => (
  <>
    {parseHighlights(text).map((part, i) =>
      typeof part === "string" ? (
        part
      ) : (
        <span
          key={i}
          className={`rounded-sm font-semibold box-decoration-clone ${chip ? "px-1" : ""}`}
          style={{ color: vivid[part.color], backgroundColor: `${vivid[part.color]}1f` }}
        >
          {part.text}
        </span>
      ),
    )}
  </>
);

const Terminal = ({ terminal }: { terminal: TerminalBlock }) => (
  <div className="mt-2 overflow-hidden rounded-md border border-neon/20 bg-black/70">
    <div className="flex items-center gap-1.5 border-b border-neon/10 bg-neon/[0.05] px-2.5 py-1 text-[10px] text-neon/50">
      <span className="h-2 w-2 rounded-full bg-[#ff5d73]/70" />
      <span className="h-2 w-2 rounded-full bg-[#ffd23f]/70" />
      <span className="h-2 w-2 rounded-full bg-[#3ddc84]/70" />
      <span className="ml-1.5">{terminal.title ?? "terminal"}</span>
    </div>
    <pre className="thin-scrollbar max-h-80 select-text overflow-auto px-3 py-2 text-[11.5px] leading-relaxed text-slate-300">
      {terminal.command.split("\n").map((line, i) => (
        <div key={i}>
          <span className="text-neon">{terminal.prompt ?? "$"}</span>{" "}
          <span className="font-semibold text-slate-50"><Highlighted text={line} chip={false} /></span>
        </div>
      ))}
      {terminal.output && (
        <div className="mt-1 text-slate-400">
          <Highlighted text={terminal.output} chip={false} />
        </div>
      )}
    </pre>
  </div>
);

const calloutTones: Record<Callout["tone"], { color: string; icon: string }> = {
  tip: { color: vivid.cyan, icon: "◆" },
  warning: { color: vivid.orange, icon: "▲" },
  danger: { color: vivid.red, icon: "■" },
};

const CalloutBox = ({ callout }: { callout: Callout }) => {
  const tone = calloutTones[callout.tone];
  return (
    <div className="mt-1 rounded-md border-l-2 px-3 py-2" style={{ borderColor: tone.color, backgroundColor: `${tone.color}12` }}>
      <p className="mb-1 text-xs font-bold tracking-wider uppercase" style={{ color: tone.color }}>
        {tone.icon} {callout.title}
      </p>
      <p className="select-text whitespace-pre-wrap text-[12.5px] leading-relaxed text-slate-300">
        <Highlighted text={callout.text} />
      </p>
    </div>
  );
};

const DownloadCard = ({ course, chapterIndex }: { course: Course; chapterIndex: number }) => {
  const chapter = course.chapters[chapterIndex];
  const save = (file: { name: string; text: string }) => (event: React.MouseEvent) => {
    event.stopPropagation();
    downloadText(file);
  };
  const buttonClass = "rounded border px-3 py-1.5 text-xs font-semibold transition hover:brightness-125";

  return (
    <div className="mt-1 rounded-md border border-dashed border-neon/40 bg-neon/[0.04] p-3">
      <p className="text-xs text-neon/60">[ unlocked ] {chapter.title} · {chapter.subtitle}</p>
      <p className="mt-1 text-[12.5px] text-slate-300">
        take the knowledge with you: in-depth notes (with extra stuff the chat skipped) and the quiz with an answer key.
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          className={buttonClass}
          style={{ color: vivid.green, borderColor: `${vivid.green}66`, backgroundColor: `${vivid.green}14` }}
          onClick={save(notesFile(course, chapter))}
        >
          ↓ download notes .md
        </button>
        <button
          className={buttonClass}
          style={{ color: vivid.yellow, borderColor: `${vivid.yellow}66`, backgroundColor: `${vivid.yellow}14` }}
          onClick={save(quizFile(course, chapter))}
        >
          ↓ download quiz .md
        </button>
      </div>
    </div>
  );
};

type MessageBlockProps = {
  course: Course;
  message: StoryMessage;
  time: string;
};

const MessageBlock = ({ course, message, time }: MessageBlockProps) => {
  const speaker = speakers[message.from];
  const isUser = message.from === "you";

  return (
    <div className="grid animate-message-in">
      <div className="min-h-0 overflow-hidden">
        <div className="border-t border-neon/[0.07] px-4 py-2.5 text-sm">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: speaker.color }}>
              {speaker.avatar ? (
                <img
                  src={speaker.avatar}
                  alt=""
                  className="h-5 w-5 rounded-full border object-cover"
                  style={{ borderColor: speaker.color }}
                />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: speaker.color }} />
              )}
              {speaker.name}
            </span>
            <span className="text-neon/30">{time}</span>
          </div>
          {message.text && (
            <p className={`select-text whitespace-pre-line ${isUser ? "font-medium text-slate-100" : "text-slate-300"}`}>
              {isUser && <span className="mr-2 text-neon">❯</span>}
              <Highlighted text={message.text} />
            </p>
          )}
          {message.callout && <CalloutBox callout={message.callout} />}
          {message.terminal && <Terminal terminal={message.terminal} />}
          {message.visual && <Visual name={message.visual} />}
          {message.downloads !== undefined && <DownloadCard course={course} chapterIndex={message.downloads} />}
          {message.image && (
            <figure className={`mt-2 ${message.illustration ? "w-full max-w-xl" : "w-fit"}`}>
              {/* Fixed height / aspect so the block doesn't jump when the image finishes loading */}
              <img
                src={message.image}
                alt={message.caption ?? ""}
                className={`rounded border border-neon/15 ${message.illustration ? "aspect-video w-full object-cover" : "h-44 w-auto"}`}
              />
              {message.caption && (
                <figcaption className="mt-1 text-xs italic text-neon/40">{message.caption}</figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBlock;
