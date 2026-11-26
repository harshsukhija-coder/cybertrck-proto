import { rosette } from "./badge-shape";
import type { Badge } from "./badges";

const W = 1080;
const H = 1350;

const MARK_PATHS = [
  "M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z",
  "M12 7.8a4.2 4.2 0 0 1 4.2 4.2",
  "M16.2 12c1.1 0 2.2.35 3.1 1.05L21 14.2",
];

export const siteUrl = () => `${window.location.origin}${window.location.pathname}`;

export const formatDate = (iso?: string) => {
  const date = !iso || iso === "today" ? new Date() : new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

export const buildCaption = (badge: Badge) =>
  [
    `🏅 new badge unlocked on @offtrck: "${badge.name}"`,
    "",
    `${badge.brag}.`,
    "",
    `offtrck turns networking, accounting, money and more into bite-sized stories, quizzes and games. come learn with me 👉 ${siteUrl()}`,
    "",
    `#offtrck #${badge.hashtag} #learnwithofftrck`,
  ].join("\n");

const enc = encodeURIComponent;

export const shareLinks = (caption: string) => [
  { id: "x", label: "X", href: `https://twitter.com/intent/tweet?text=${enc(caption)}` },
  { id: "linkedin", label: "LinkedIn", href: `https://www.linkedin.com/feed/?shareActive=true&text=${enc(caption)}` },
  { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${enc(caption)}` },
  { id: "facebook", label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(siteUrl())}` },
];

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
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

/** The 4:5 image people post: medal, badge name, their name and the offtrck brand */
export const drawBadgeCard = async (badge: Badge, username: string, earnedAt?: string) => {
  await Promise.all(
    ["700 92px Unbounded", "700 44px Unbounded", "400 34px 'Space Grotesk'", "500 28px 'JetBrains Mono'"].map(font => document.fonts.load(font).catch(() => [])),
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0b0c10";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(255,255,255,0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(40, 40, W - 80, H - 80, 48);
  ctx.stroke();

  // brand, top left
  ctx.save();
  ctx.translate(96, 92);
  ctx.scale(2.6, 2.6);
  ctx.strokeStyle = badge.color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of MARK_PATHS) ctx.stroke(new Path2D(d));
  ctx.fillStyle = badge.color;
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
  ctx.fillStyle = badge.color;
  ctx.textAlign = "right";
  ctx.fillText("BADGE UNLOCKED", W - 96, 124);

  // medal
  const cx = W / 2;
  const cy = 530;
  ctx.fillStyle = badge.color;
  ctx.beginPath();
  rosette(cx, cy, 250, 226, 16).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#0b0c10";
  ctx.beginPath();
  ctx.arc(cx, cy, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = badge.color;
  ctx.lineWidth = 6;
  ctx.setLineDash(badge.tier === "gold" ? [] : [10, 14]);
  ctx.beginPath();
  ctx.arc(cx, cy, 164, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = "center";
  ctx.font = "180px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
  ctx.fillText(badge.emoji, cx, cy + 12);

  // text
  ctx.fillStyle = "#fff";
  ctx.font = "700 88px Unbounded";
  ctx.fillText(badge.name, cx, 890, W - 160);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "400 36px 'Space Grotesk'";
  wrap(ctx, `✓ ${badge.how}`, W - 240).forEach((line, i) => ctx.fillText(line, cx, 975 + i * 48));

  ctx.fillStyle = badge.color;
  ctx.font = "500 28px 'JetBrains Mono'";
  ctx.fillText(`${username.toUpperCase()} · ${formatDate(earnedAt).toUpperCase()}`, cx, 1110);

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.09)";
  ctx.fillRect(96, 1180, W - 192, 2);
  ctx.textAlign = "left";
  ctx.fillStyle = "#fff";
  ctx.font = "400 34px 'Space Grotesk'";
  ctx.fillText("learn by playing on offtrck", 96, 1240);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 26px 'JetBrains Mono'";
  ctx.fillText(window.location.host, W - 96, 1240);

  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error("canvas export failed"))), "image/png"));
};
