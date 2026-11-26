import { CARD_BG, CARD_W, drawFooter, siteUrl, startCard, toPng, wrap } from "../share/share-utils";
import { rosette } from "./badge-shape";
import type { Badge } from "./badges";

export const formatDate = (iso?: string) => {
  const date = !iso || iso === "today" ? new Date() : new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

/** Picks one of a few lines at random, so "another caption" gives something new */
export const buildCaption = (badge: Badge) => {
  const lines = [
    `${badge.emoji} ${badge.name} unlocked\n${badge.brag}. we move 😌`,
    `new badge who dis ${badge.emoji}\n${badge.name}. ${badge.brag} 💅`,
    `${badge.brag}. not to flex but… ${badge.emoji} ${badge.name}`,
    `${badge.emoji} ${badge.name} era activated\n${badge.brag}. ate 🔥`,
    `just unlocked ${badge.name} ${badge.emoji}\nmain character behaviour fr`,
  ];
  return [lines[Math.floor(Math.random() * lines.length)], `learn with me → ${siteUrl()}`, "", `#offtrck #${badge.hashtag}`].join("\n");
};

/** The 4:5 image people post: medal, badge name, their name and the offtrck brand */
export const drawBadgeCard = async (badge: Badge, username: string, earnedAt?: string) => {
  const { canvas, ctx } = await startCard(badge.color, "badge unlocked");

  // medal
  const cx = CARD_W / 2;
  const cy = 530;
  ctx.fillStyle = badge.color;
  ctx.beginPath();
  rosette(cx, cy, 250, 226, 16).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = CARD_BG;
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
  ctx.fillText(badge.name, cx, 890, CARD_W - 160);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = "400 36px 'Space Grotesk'";
  wrap(ctx, `✓ ${badge.how}`, CARD_W - 240).forEach((line, i) => ctx.fillText(line, cx, 975 + i * 48));

  ctx.fillStyle = badge.color;
  ctx.font = "500 28px 'JetBrains Mono'";
  ctx.fillText(`${username.toUpperCase()} · ${formatDate(earnedAt).toUpperCase()}`, cx, 1110);

  drawFooter(ctx);
  return toPng(canvas);
};
