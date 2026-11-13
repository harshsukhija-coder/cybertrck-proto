import { speakers, type StoryMessage } from "./story";

type MessageBlockProps = {
  message: StoryMessage;
  time: string;
};

const MessageBlock = ({ message, time }: MessageBlockProps) => {
  const speaker = speakers[message.from];
  const isUser = message.from === "you";

  return (
    <div className="grid animate-message-in">
      <div className="min-h-0 overflow-hidden">
        <div
          className="border-t border-neon/10 border-l-2 px-4 py-2.5 text-sm transition-colors hover:bg-neon/5"
          style={{ borderLeftColor: `${speaker.color}66` }}
        >
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: speaker.color, textShadow: `0 0 8px ${speaker.color}80` }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: speaker.color, boxShadow: `0 0 6px ${speaker.color}` }} />
              {speaker.name}
            </span>
            <span className="text-neon/30">{time}</span>
          </div>
          {message.text && (
            <p className={`select-text ${isUser ? "font-semibold text-white" : "text-slate-200/90"}`}>
              {isUser && <span className="mr-2 text-neon">❯</span>}
              {message.text}
            </p>
          )}
          {message.image && (
            <figure className="mt-2 w-fit">
              {/* Fixed height so the block doesn't jump when the gif finishes loading */}
              <img
                src={message.image}
                alt={message.caption ?? ""}
                className="h-44 w-auto rounded-md border border-neon/20"
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
