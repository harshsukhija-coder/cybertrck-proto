import { vivid } from "./palette";
import { parseHighlights, type DualView, type SallyScreen, type TerminalBlock } from "./story";

const Highlighted = ({ text }: { text: string }) => (
  <>
    {parseHighlights(text).map((part, i) =>
      typeof part === "string" ? (
        part
      ) : (
        <span key={i} className="rounded-sm font-semibold" style={{ color: vivid[part.color], backgroundColor: `${vivid[part.color]}1f` }}>
          {part.text}
        </span>
      ),
    )}
  </>
);

const KimPanel = ({ terminal }: { terminal: TerminalBlock }) => (
  <div className="overflow-hidden rounded-md border border-neon/25 bg-[#07110c]">
    <div className="flex items-center gap-2 border-b border-neon/15 bg-neon/[0.07] px-2.5 py-1.5 text-[10px]">
      <span className="h-2 w-2 rounded-full bg-[#ff5d73]/80" />
      <span className="h-2 w-2 rounded-full bg-[#ffd23f]/80" />
      <span className="h-2 w-2 rounded-full bg-[#3ddc84]/80" />
      <span className="ml-1 font-semibold tracking-wide text-neon/70 uppercase">kim · kali</span>
      <span className="ml-auto text-neon/40">{terminal.title ?? "terminal"}</span>
    </div>
    <pre className="thin-scrollbar max-h-64 select-text overflow-auto px-3 py-2 text-[11px] leading-relaxed text-slate-300">
      {terminal.command.split("\n").map((line, i) => (
        <div key={i} className="animate-line-in" style={{ animationDelay: `${i * 40}ms` }}>
          <span className="text-neon">{terminal.prompt ?? "kim@kali:~$"}</span>{" "}
          <span className="font-semibold text-slate-50">
            <Highlighted text={line} />
          </span>
        </div>
      ))}
      {terminal.output && (
        <div className="mt-1 text-slate-400">
          <Highlighted text={terminal.output} />
        </div>
      )}
    </pre>
  </div>
);

const FileIconGlyph = ({ kind }: { kind: "image" | "exe" }) =>
  kind === "image" ? (
    <span className="grid h-10 w-10 place-items-center rounded bg-[#1e3a5f] text-lg">🖼️</span>
  ) : (
    <span className="animate-pulse-ring grid h-10 w-10 place-items-center rounded bg-[#3b1d1d] text-lg">⚙️</span>
  );

const WifiBars = ({ bars }: { bars: number }) => (
  <span className="inline-flex items-end gap-px" aria-hidden>
    {[1, 2, 3, 4].map(level => (
      <span
        key={level}
        className={`w-[3px] rounded-sm ${level <= bars ? "animate-wifi-bars bg-[#8ec7ff]" : "bg-white/15"}`}
        style={{ height: `${4 + level * 3}px`, animationDelay: `${level * 80}ms` }}
      />
    ))}
  </span>
);

const SallyPanel = ({ screen }: { screen: SallyScreen }) => (
  <div className="overflow-hidden rounded-md border border-[#5b9bd5]/40 bg-[#0c1420]">
    <div className="flex items-center gap-2 border-b border-[#5b9bd5]/25 bg-[#152238] px-2.5 py-1.5 text-[10px]">
      <span className="h-2 w-2 rounded-full bg-[#ff5d73]/80" />
      <span className="h-2 w-2 rounded-full bg-[#ffd23f]/80" />
      <span className="h-2 w-2 rounded-full bg-[#3ddc84]/80" />
      <span className="ml-1 font-semibold tracking-wide text-[#8ec7ff]/80 uppercase">sally · windows 10</span>
      <span className="ml-auto text-[#8ec7ff]/50">{screen.title ?? "desktop"}</span>
    </div>

    {screen.mode === "idle" && (
      <div className="space-y-2 p-3 text-[11px] text-slate-300">
        <p className="text-[#8ec7ff]/70">🖥️ Desktop · 2:14 PM</p>
        <div className="grid grid-cols-3 gap-2">
          {["This PC", "Recycle Bin", "Chrome"].map(label => (
            <div key={label} className="rounded border border-white/10 bg-white/5 p-2 text-center">
              <div className="text-base">{label === "Chrome" ? "🌐" : label === "Recycle Bin" ? "🗑️" : "💻"}</div>
              <p className="mt-1 text-[10px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {screen.mode === "mail" && screen.email && (
      <div className="p-3 text-[11px] text-slate-200">
        <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
          <span className="animate-soft-bounce text-base">📬</span>
          <div>
            <p className="font-semibold text-[#8ec7ff]">Mail · Inbox</p>
            <p className="text-[10px] text-slate-500">1 new message</p>
          </div>
        </div>
        <div className="rounded border border-[#5b9bd5]/30 bg-[#101b2c] p-2.5">
          <p className="text-[10px] text-slate-500">From</p>
          <p className="font-semibold text-slate-100">{screen.email.from}</p>
          <p className="mt-2 text-[10px] text-slate-500">Subject</p>
          <p className="text-slate-100">{screen.email.subject}</p>
          <p className="mt-2 whitespace-pre-wrap text-slate-300">{screen.email.body}</p>
          <div className="mt-3 flex items-center gap-2 rounded border border-dashed border-[#ffd23f]/40 bg-[#ffd23f]/10 px-2 py-1.5">
            <span>📎</span>
            <span className="font-semibold text-[#ffd23f]">{screen.email.attachment}</span>
            <span className="ml-auto text-[10px] text-slate-500">download</span>
          </div>
        </div>
      </div>
    )}

    {screen.mode === "downloads" && (
      <div className="p-3 text-[11px] text-slate-200">
        <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
          <span>📁</span>
          <p className="font-semibold text-[#8ec7ff]">File Explorer · Downloads</p>
        </div>
        {screen.hideExtensions && (
          <p className="mb-2 rounded bg-[#ff8a3d]/15 px-2 py-1 text-[10px] text-[#ff8a3d]">
            ⚠️ Windows is hiding known file extensions
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {(screen.files ?? []).map(file => (
            <div
              key={file.name}
              className={`flex w-20 flex-col items-center gap-1 rounded p-1.5 ${file.selected ? "animate-pulse-ring bg-[#5b9bd5]/20 ring-1 ring-[#5b9bd5]/50" : "hover:bg-white/5"}`}
            >
              <FileIconGlyph kind={file.icon} />
              <p className="text-center text-[10px] leading-tight text-slate-300">{file.name}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {screen.mode === "opened" && (
      <div className="animate-session-flash space-y-2 p-3 text-[11px] text-slate-200">
        <p className="font-semibold text-[#8ec7ff]">🖥️ Sally&apos;s screen · nothing looks wrong</p>
        <div className="rounded border border-white/10 bg-black/40 p-3 text-center">
          <p className="text-2xl">😶‍🌫️</p>
          <p className="mt-1 text-slate-400">no photo window. no error. silence.</p>
          <p className="mt-2 text-[10px] text-[#ff5d73]">(background: reverse shell connecting…)</p>
        </div>
      </div>
    )}

    {screen.mode === "wifi" && (
      <div className="p-3 text-[11px] text-slate-200">
        <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
          <span className="animate-soft-bounce">📶</span>
          <div>
            <p className="font-semibold text-[#8ec7ff]">Wi-Fi networks</p>
            <p className="text-[10px] text-slate-500">choose a network</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {(screen.wifiNetworks ?? []).map(net => (
            <div
              key={`${net.name}-${net.fake ? "fake" : "real"}`}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                net.selected
                  ? "animate-pulse-ring border-[#5b9bd5]/60 bg-[#5b9bd5]/15"
                  : net.fake
                    ? "border-[#ff5d73]/35 bg-[#ff5d73]/08"
                    : "border-white/10 bg-white/5"
              }`}
            >
              <WifiBars bars={net.bars} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-100">{net.name}</p>
                <p className="text-[10px] text-slate-500">
                  {net.open ? "open · no password" : "secured"}
                  {net.fake ? " · 👀 twin" : ""}
                </p>
              </div>
              {net.selected && <span className="text-[10px] text-[#8ec7ff]">connected</span>}
              {net.fake && !net.selected && <span className="text-sm">🎭</span>}
            </div>
          ))}
        </div>
      </div>
    )}

    {screen.mode === "browser" && screen.browser && (
      <div className="p-3 text-[11px] text-slate-200">
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 font-mono text-[10px]">
          <span>{screen.browser.secure ? "🔒" : "⚠️"}</span>
          <span className={screen.browser.secure ? "text-[#3ddc84]" : "text-[#ff8a3d]"}>
            {screen.browser.secure ? "https://" : "http://"}
          </span>
          <span className="truncate text-slate-300">{screen.browser.url}</span>
        </div>
        <div className="rounded border border-[#5b9bd5]/25 bg-[#101b2c] p-3">
          <p className="text-sm font-semibold text-[#8ec7ff]">{screen.browser.heading ?? "page"}</p>
          <p className="mt-2 whitespace-pre-wrap text-slate-300">{screen.browser.body}</p>
        </div>
      </div>
    )}

    {screen.mode === "cert" && (
      <div className="animate-session-flash p-3 text-[11px] text-slate-200">
        <div className="rounded-lg border border-[#ff5d73]/50 bg-[#2a1014] p-3">
          <p className="flex items-center gap-2 text-base font-bold text-[#ff5d73]">
            <span className="animate-soft-bounce">🚨</span> Your connection is not private
          </p>
          <p className="mt-2 text-slate-300">
            Attackers might be trying to steal your information from{" "}
            <span className="font-mono text-[#ffd23f]">{screen.certHost ?? "this site"}</span>.
          </p>
          <p className="mt-2 text-[10px] text-slate-500">NET::ERR_CERT_AUTHORITY_INVALID</p>
          <div className="mt-3 flex gap-2">
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] text-slate-400">Back to safety</span>
            <span className="rounded border border-[#ff5d73]/40 px-2 py-1 text-[10px] text-[#ff5d73]">
              Advanced (don&apos;t)
            </span>
          </div>
        </div>
      </div>
    )}

    {screen.note && <p className="border-t border-white/10 px-3 py-1.5 text-[10px] text-slate-500">{screen.note}</p>}
  </div>
);

const DualScreen = ({ dual }: { dual: DualView }) => (
  <div className="mt-2 space-y-2">
    <div className="flex items-center justify-between text-[10px] tracking-wider text-neon/45 uppercase">
      <span>👀 split view</span>
      <span>kim terminal ↔ sally windows</span>
    </div>
    <div className="grid gap-2 lg:grid-cols-2">
      {dual.kim && <KimPanel terminal={dual.kim} />}
      {dual.sally && <SallyPanel screen={dual.sally} />}
    </div>
  </div>
);

export default DualScreen;
