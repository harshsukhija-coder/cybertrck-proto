export const CARD_W = 1080;
export const CARD_H = 1350;
export const CARD_BG = "#0b0c10";

const MARK_PATHS = [
  "M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z",
  "M12 7.8a4.2 4.2 0 0 1 4.2 4.2",
  "M16.2 12c1.1 0 2.2.35 3.1 1.05L21 14.2",
];

export const siteUrl = () => `${window.location.origin}${window.location.pathname}`;

const enc = encodeURIComponent;

export const shareLinks = (caption: string, url = siteUrl()) => [
  { id: "x", label: "X", href: `https://twitter.com/intent/tweet?text=${enc(caption)}` },
  { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/feed/?shareActive=true&text=${enc(caption)}` },
  { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${enc(caption)}` },
  { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
];

export const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
};

/** Cuts lines down to `max`, ending the last one with "…" */
export const clampLines = (lines: string[], max: number) =>
  lines.length <= max ? lines : [...lines.slice(0, max - 1), `${lines[max - 1].replace(/[\s,.;:]+\S*$/, "")}…`];

/** A blank 4:5 card with the offtrck brand top left and a label top right */
export const startCard = async (color: string, label: string) => {
  await Promise.all(
    ["700 92px Unbounded", "700 44px Unbounded", "400 34px 'Space Grotesk'", "500 28px 'JetBrains Mono'"].map(font => document.fonts.load(font).catch(() => [])),
  );

  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = CARD_BG;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 40, CARD_W - 80, CARD_H - 80, 48);
  ctx.stroke();

  ctx.save();
  ctx.translate(96, 92);
  ctx.scale(2.6, 2.6);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of MARK_PATHS) ctx.stroke(new Path2D(d));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(12, 12, 1.55, 0, Math.PI * 2);
  ctx.arc(21, 14.2, 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.font = "700 44px Unbounded";
  ctx.textBaseline = "middle";
  ctx.fillText("offtrck", 176, 124);

  ctx.font = "500 26px 'JetBrains Mono'";
  ctx.fillStyle = color;
  ctx.textAlign = "right";
  ctx.fillText(label.toUpperCase(), CARD_W - 96, 124, CARD_W - 480);
  ctx.textAlign = "left";

  return { canvas, ctx };
};

/** Divider plus "learn by playing on offtrck" and the site address */
export const drawFooter = (ctx: CanvasRenderingContext2D) => {
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(96, 1180, CARD_W - 192, 2);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "400 34px 'Space Grotesk'";
  ctx.fillText("learn by playing on offtrck", 96, 1240);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 26px 'JetBrains Mono'";
  ctx.fillText(window.location.host, CARD_W - 96, 1240);
  ctx.textAlign = "left";
};

export const toPng = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("canvas export failed"))), "image/png"));
