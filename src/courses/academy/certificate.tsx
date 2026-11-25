import { useEffect, useRef, useState } from "react";
import { saveCertificate, useAcademy } from "./academy-progress";
import { ACADEMY_TITLE, COUNTS, MODULES } from "./content";

const W = 1600;
const H = 1130;
const INK = "#0d1220";
const ACCENT = "#2f6bff";

const certificateId = (name: string, date: string) => {
  let h = 2166136261;
  for (const ch of `${name.toLowerCase()}|${date}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return `OFT-NET-${h.toString(36).toUpperCase().padStart(7, "0").slice(0, 7)}`;
};

const prettyDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const fitText = (ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, start: number, maxWidth: number) => {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > 30) ctx.font = font((size -= 4));
};

/** A tiny network drawing in the corner, nodes and links */
const drawMotif = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  const nodes = [
    [0, 0], [90, -40], [170, 10], [70, 70], [160, 110], [250, 60],
  ];
  const links = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 5], [4, 5], [1, 3]];
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(47,107,255,0.35)";
  ctx.lineWidth = 2;
  for (const [a, b] of links) {
    ctx.beginPath();
    ctx.moveTo(nodes[a][0], nodes[a][1]);
    ctx.lineTo(nodes[b][0], nodes[b][1]);
    ctx.stroke();
  }
  for (const [i, [nx, ny]] of nodes.entries()) {
    ctx.beginPath();
    ctx.arc(nx, ny, i === 2 ? 9 : 6, 0, Math.PI * 2);
    ctx.fillStyle = i === 2 ? ACCENT : "#f6f3ec";
    ctx.fill();
    ctx.strokeStyle = ACCENT;
    ctx.stroke();
  }
  ctx.restore();
};

const draw = (canvas: HTMLCanvasElement, name: string, date: string, id: string, exam: number) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = "#f6f3ec";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.lineWidth = 1;
  ctx.strokeRect(62, 62, W - 124, H - 124);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(48, 48, 14, H - 96);

  drawMotif(ctx, W - 420, 170);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = INK;
  ctx.font = "700 34px Unbounded, sans-serif";
  ctx.fillText("offtrck", 140, 180);
  ctx.fillStyle = "rgba(13,18,32,0.55)";
  ctx.font = "400 34px Unbounded, sans-serif";
  ctx.fillText("academy", 140 + ctx.measureText("offtrck ").width + 40, 180);

  ctx.fillStyle = ACCENT;
  ctx.font = "700 22px 'JetBrains Mono', monospace";
  ctx.fillText("CERTIFICATE OF COMPLETION", 140, 300);

  ctx.fillStyle = "rgba(13,18,32,0.6)";
  ctx.font = "400 30px 'Space Grotesk', sans-serif";
  ctx.fillText("This certifies that", 140, 380);

  ctx.fillStyle = INK;
  fitText(ctx, name, size => `italic 400 ${size}px 'Instrument Serif', serif`, 150, W - 300);
  ctx.fillText(name, 136, 520);
  ctx.fillStyle = ACCENT;
  ctx.fillRect(140, 556, Math.min(ctx.measureText(name).width, W - 300), 4);

  ctx.fillStyle = "rgba(13,18,32,0.6)";
  ctx.font = "400 30px 'Space Grotesk', sans-serif";
  ctx.fillText("has successfully completed", 140, 640);
  ctx.fillStyle = INK;
  ctx.font = "700 54px Unbounded, sans-serif";
  ctx.fillText(ACADEMY_TITLE, 140, 720);

  ctx.fillStyle = "rgba(13,18,32,0.7)";
  ctx.font = "400 26px 'Space Grotesk', sans-serif";
  ctx.fillText(
    `${MODULES.length} modules · ${COUNTS.quizzes} quizzes · ${COUNTS.labs} Cisco Packet Tracer practicals · final exam ${exam}%`,
    140,
    780,
  );
  ctx.fillStyle = "rgba(13,18,32,0.5)";
  ctx.font = "400 22px 'Space Grotesk', sans-serif";
  const titles = MODULES.map(m => m.title);
  const half = Math.ceil(titles.length / 2);
  ctx.fillText(titles.slice(0, half).join("  ·  "), 140, 830);
  ctx.fillText(titles.slice(half).join("  ·  "), 140, 864);

  ctx.strokeStyle = "rgba(13,18,32,0.25)";
  ctx.lineWidth = 2;
  for (const [x, label, value] of [
    [140, "DATE", prettyDate(date)],
    [600, "CERTIFICATE ID", id],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(x, 960);
    ctx.lineTo(x + 380, 960);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = "500 30px 'Space Grotesk', sans-serif";
    ctx.fillText(value, x, 945);
    ctx.fillStyle = "rgba(13,18,32,0.5)";
    ctx.font = "700 16px 'JetBrains Mono', monospace";
    ctx.fillText(label, x, 995);
  }

  // seal
  const sx = W - 260;
  const sy = 870;
  ctx.beginPath();
  for (let i = 0; i < 48; i++) {
    const angle = (i / 48) * Math.PI * 2;
    const r = i % 2 ? 108 : 120;
    ctx.lineTo(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fillStyle = ACCENT;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx, sy, 88, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "400 64px Anton, sans-serif";
  ctx.fillText("PASS", sx, sy + 12);
  ctx.font = "700 15px 'JetBrains Mono', monospace";
  ctx.fillText("NETWORKING", sx, sy + 44);
  ctx.textAlign = "start";
};

const FONTS = ["700 34px Unbounded", "400 34px Unbounded", "italic 400 100px 'Instrument Serif'", "400 30px 'Space Grotesk'", "500 30px 'Space Grotesk'", "700 20px 'JetBrains Mono'", "400 60px Anton"];

export const CertificatePage = () => {
  const { certified, progress, gradedPassed, gradedTotal, examUnlocked, examPassed } = useAcademy();
  const saved = progress.certificate;
  const [name, setName] = useState(saved?.name ?? sessionStorage.getItem("offtrck.session.user") ?? "");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const [date] = useState(() => saved?.date ?? new Date().toISOString());
  const cleanName = name.trim() || "Your Name";
  const id = certificateId(cleanName, date.slice(0, 10));

  useEffect(() => {
    let alive = true;
    Promise.all(FONTS.map(f => document.fonts.load(f).catch(() => []))).then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (certified && canvasRef.current) draw(canvasRef.current, cleanName, date, id, progress.exam ?? 0);
  }, [certified, cleanName, date, id, progress.exam, fontsReady]);

  if (!certified) {
    const steps = [
      { label: `pass every quiz and practical (${gradedPassed}/${gradedTotal})`, ok: gradedPassed === gradedTotal, href: "#/academy" },
      { label: "pass the final exam", ok: examPassed, href: examUnlocked ? "#/academy/exam" : undefined },
    ];
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center sm:py-24">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/5 text-4xl">🔒</span>
        <h1 className="mt-6 font-display text-3xl font-bold lowercase tracking-[-0.03em]">your certificate is locked</h1>
        <p className="mt-3 text-white/60">Finish these and it's yours, with your name on it, ready to download.</p>
        <ul className="mt-8 grid gap-2 text-left">
          {steps.map(s => (
            <li key={s.label}>
              <a href={s.href} className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${s.ok ? "border-emerald-400/30 bg-emerald-400/5" : "border-white/10 bg-white/[0.03]"} ${s.href ? "transition hover:bg-white/[0.06]" : "pointer-events-none opacity-60"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs ${s.ok ? "bg-emerald-400 text-black" : "border border-white/20"}`}>{s.ok ? "✓" : ""}</span>
                <span className="text-white/85">{s.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveCertificate({ name: cleanName, id, date });
    const link = document.createElement("a");
    link.download = `offtrck-networking-certificate-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="font-jetbrains text-[11px] uppercase tracking-[0.18em] text-(--accent)">🎓 you did it</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,6vw,3.5rem)] font-bold lowercase leading-[1.02] tracking-[-0.04em]">
        you're officially <span className="font-accent font-normal italic tracking-normal text-(--accent)">certified.</span>
      </h1>
      <p className="mt-3 max-w-lg text-white/60">Every quiz passed, every network built and the final exam done. Put your name on it and show it off.</p>

      <label className="mt-8 block max-w-sm">
        <span className="font-jetbrains text-[10px] uppercase tracking-wider text-white/50">name on the certificate</span>
        <input
          value={name}
          maxLength={40}
          onChange={e => setName(e.target.value)}
          placeholder="Your Name"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg text-white outline-none transition focus:border-(--accent)"
        />
      </label>

      <div className="mt-6 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10">
        <canvas ref={canvasRef} className="block h-auto w-full" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={download} className="rounded-full bg-(--accent) px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5">
          ⬇ download PNG
        </button>
        <span className="font-jetbrains text-xs text-white/45">ID {id}</span>
      </div>
    </div>
  );
};
