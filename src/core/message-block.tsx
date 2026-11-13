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
        <div className="border-t border-neon/[0.07] px-4 py-2.5 text-sm">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: speaker.color }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: speaker.color }} />
              {speaker.name}
            </span>
            <span className="text-neon/30">{time}</span>
          </div>
          {message.text && (
            <p className={`select-text whitespace-pre-line ${isUser ? "font-medium text-slate-100" : "text-slate-300"}`}>
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
                className="h-44 w-auto rounded border border-neon/15"
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
