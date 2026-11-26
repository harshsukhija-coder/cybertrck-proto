import { COURSES, chapterHash, findCourse } from "../data";
import type { FeedItem } from "../feed-build";
import type { Fact, Poll } from "../feed-extras";
import type { ChoiceRound } from "../games/fun-rounds";
import { gameHash, type GameMeta } from "../games/games";
import { QUICK_DECKS } from "../games/quick-rounds";
import { pathHash, type LearningPath } from "../guide/paths";
import type { LivePost } from "../live/live-sources";
import type { Course, CourseChapter } from "../types";
import { CARD_W, clampLines, drawFooter, siteUrl, startCard, toPng, wrap } from "./share-utils";

/** Everything needed to share one feed post: the caption, the link and what goes on the image */
export type SharePost = {
  key: string;
  /** Small label at the top right of the image */
  label: string;
  color: string;
  title: string;
  line?: string;
  /** Huge text above the title: a number or an emoji */
  big?: string;
  options?: string[];
  photo?: { src: string; focus?: string; exposure?: number };
  url: string;
  caption: string;
};

const link = (hash: string) => `${siteUrl()}${hash}`;
const hashtags = (tags: string[]) => ["offtrck", ...tags.slice(0, 2).map(t => t.replace(/[^a-z0-9]/gi, ""))].map(t => `#${t}`).join(" ");
/** A random line, so every share (and every "another caption") sounds a bit different */
const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];
const caption = (...lines: string[]) => lines.join("\n");
const choices = (options: string[]) => (options.length === 2 ? `${options[0]} or ${options[1]}?` : options.join(" / "));

export const shareChapter = (course: Course, chapter: CourseChapter): SharePost => {
  const url = link(chapterHash(course, chapter));
  return {
    key: chapter.id,
    label: `${course.title} · ch ${chapter.number}`,
    color: course.color,
    title: chapter.title,
    line: chapter.hook,
    photo: { src: chapter.photo, focus: chapter.focus, exposure: chapter.exposure },
    url,
    caption: caption(
      pick([
        `${chapter.hook} 👀\nspoiler: i know now. ${chapter.minutes} min →`,
        `pov: ${chapter.title} finally makes sense 🧠\ntook ${chapter.minutes} min →`,
        `${chapter.hook}\nwhy did nobody explain it like this 😭 →`,
        `${chapter.minutes} min and i'm the ${chapter.title} expert now 💅 →`,
        `${chapter.hook}\nthe answer lowkey shocked me 🤯 →`,
        `me: scrolling\nalso me: accidentally learning ${chapter.title} 📚 →`,
      ]),
      url,
      "",
      hashtags(chapter.tags),
    ),
  };
};

export const shareGame = (game: GameMeta): SharePost => {
  const url = link(gameHash(game.id));
  return {
    key: game.id,
    label: "mini game",
    color: game.duo[1],
    title: game.title,
    line: game.tagline,
    photo: { src: game.photo, focus: game.focus, exposure: game.exposure },
    url,
    caption: caption(
      pick([
        `${game.title} has me in a chokehold 🎮\nbeat my score. i dare you →`,
        `${game.tagline.toLowerCase()}. sounds easy. it's not 💀\nyour turn →`,
        `lost 20 min to ${game.title} and no regrets 😌\ntry it →`,
        `just one more round of ${game.title}. (it was not one more round) 🫠 →`,
        `${game.title} said "skill issue" and honestly fair 😭\nplay →`,
        `found my new 2am game 🌙 ${game.title} →`,
      ]),
      url,
      "",
      hashtags(game.tags),
    ),
  };
};

export const shareQuick = (game: GameMeta, r: ChoiceRound): SharePost => {
  const url = link(gameHash(game.id));
  return {
    key: `quick-${game.id}`,
    label: `quick play · ${game.title}`,
    color: game.duo[1],
    title: r.big ? r.kicker : r.prompt,
    big: r.big ? r.prompt : undefined,
    options: r.options,
    url,
    caption: caption(
      r.big ? `${r.kicker} ${r.prompt}` : r.prompt,
      `${choices(r.options)} 👀`,
      pick([
        "no googling. drop your answer 👇",
        "be honest, you'd fall for it 💀",
        "10 seconds. go ⏱️",
        "if you get this wrong we can't be friends 😤",
        "easy? then prove it 😏",
        "comment your answer before you check 👀",
      ]),
      `check it → ${url}`,
      "",
      hashtags(game.tags),
    ),
  };
};

export const sharePoll = (poll: Poll): SharePost => {
  const url = link("#/feed");
  return {
    key: poll.id,
    label: "poll",
    color: (findCourse(poll.courseId) ?? COURSES[0]).color,
    title: poll.q,
    options: poll.options,
    url,
    caption: caption(
      poll.q,
      choices(poll.options),
      pick([
        "gut answer only, no cap 🧢",
        "most people get this wrong fr 🫣",
        "vote first, google never 🙅",
        "the results had me shook 😳",
        "pick one. no overthinking 🫵",
        "be so for real with your answer 💀",
      ]),
      `vote → ${url}`,
      "",
      hashtags(poll.tags),
    ),
  };
};

export const shareFact = (fact: Fact): SharePost => {
  const url = link("#/feed");
  return {
    key: fact.id,
    label: "did you know?",
    color: fact.duo[1],
    big: fact.big,
    title: fact.line,
    line: fact.sub,
    url,
    caption: caption(
      pick([
        `wait. ${fact.big}?? ${fact.line} 😳`,
        `${fact.big}. ${fact.line}\nrent free in my head now 🧠`,
        `${fact.big}: ${fact.line}\nthe more you know ✨`,
        `${fact.big}. ${fact.line}\nnot me learning this at 2am 🌙`,
        `fun fact for your next awkward silence:\n${fact.big}. ${fact.line} 🤓`,
        `${fact.big}?? ${fact.line}\nbrain = expanded 🧠✨`,
      ]),
      `more → ${url}`,
      "",
      hashtags(fact.tags),
    ),
  };
};

export const shareLive = (post: LivePost): SharePost => {
  const paper = post.kind === "paper";
  return {
    key: post.id,
    label: paper ? "new research" : `live · ${post.source}`,
    color: post.color,
    title: post.title,
    line: post.body,
    url: post.link,
    caption: caption(
      paper
        ? pick([
            `new research just dropped 📄\n"${post.title}"`,
            `"${post.title}"\nreading papers now. character development 📚`,
            `nerd hours 🤓\n"${post.title}"`,
            `the science is in and it's giving 🔬\n"${post.title}"`,
            `big brain reading list 🧠\n"${post.title}"`,
          ])
        : pick([
            `${post.title} 👀`,
            `${post.title}\nthoughts? 👇`,
            `saw this and had to share 🔥\n${post.title}`,
            `the internet is wild today 😭\n${post.title}`,
            `${post.title}\nwe need to talk about this 🫠`,
          ]),
      post.link,
      "",
      `found it on @offtrck ✨ ${hashtags(post.hashtags)}`,
    ),
  };
};

export const shareGuide = (path: LearningPath): SharePost => {
  const url = link(pathHash(path.id, true));
  return {
    key: `path-${path.id}`,
    label: "roadmap",
    color: path.color,
    big: path.glyph,
    title: `the ${path.title} path`,
    line: path.tagline,
    url,
    caption: caption(
      pick([
        `entering my ${path.title} era 🧭`,
        `${path.title} arc starts now. no skips 🧭`,
        `${path.tagline.toLowerCase()}. we're so back 🧭`,
        `main character energy: learning ${path.title} 🎬`,
        `${path.title} glow up loading… 🧭`,
      ]),
      `1-min check, then your own roadmap →`,
      url,
      "",
      hashtags(path.interests),
    ),
  };
};

/** Share details for any feed item, or null for items that aren't posts */
export const shareOfItem = (item: FeedItem, quickRound?: ChoiceRound): SharePost | null => {
  switch (item.kind) {
    case "chapter":
      return shareChapter(item.course, item.chapter);
    case "game":
      return shareGame(item.game);
    case "quick": {
      const deck = QUICK_DECKS[item.game.id]?.() ?? [];
      const r = quickRound ?? deck[item.round % Math.max(1, deck.length)];
      return r ? shareQuick(item.game, r) : shareGame(item.game);
    }
    case "poll":
      return sharePoll(item.poll);
    case "fact":
      return shareFact(item.fact);
    case "live":
      return shareLive(item.post);
    case "guide":
      return shareGuide(item.path);
    default:
      return null;
  }
};

// ---------- the image ----------

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

/** Reads one axis of a CSS object-position like "50% 30%" or "center top" as 0..1 */
const focusAt = (focus: string | undefined, axis: 0 | 1) => {
  const word = (focus ?? "").trim().split(/\s+/)[axis] ?? "center";
  if (word.endsWith("%")) return Number.parseFloat(word) / 100;
  return { left: 0, top: 0, right: 1, bottom: 1 }[word] ?? 0.5;
};

const drawPhoto = async (ctx: CanvasRenderingContext2D, photo: NonNullable<SharePost["photo"]>, x: number, y: number, w: number, h: number) => {
  const img = await loadImage(photo.src).catch(() => null);
  if (!img) return false;
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) * focusAt(photo.focus, 0);
  const sy = (img.naturalHeight - sh) * focusAt(photo.focus, 1);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 36);
  ctx.clip();
  if (photo.exposure) ctx.filter = `brightness(${photo.exposure})`;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
  return true;
};

const isEmoji = (text: string) => /\p{Extended_Pictographic}/u.test(text);

/** The 4:5 image for a feed post: photo or big text, the title, then the line or the answer options */
export const drawPostCard = async (post: SharePost) => {
  const { canvas, ctx } = await startCard(post.color, post.label);
  const left = 96;
  const width = CARD_W - left * 2;
  const top = 200;
  const bottom = 1140;
  ctx.textBaseline = "top";
  let y = top;

  let hasPhoto = false;
  if (post.photo && !post.big) {
    const h = post.options ? 300 : 600;
    hasPhoto = await drawPhoto(ctx, post.photo, left, y, width, h);
    if (hasPhoto) y += h + 56;
  }

  // Measured first, drawn after, so cards without a photo can sit in the middle
  const blocks: { h: number; draw: (at: number) => void }[] = [];
  const used = () => blocks.reduce((sum, b) => sum + b.h, 0);

  if (post.big) {
    const big = post.big;
    const emoji = isEmoji(big);
    let size = emoji ? 200 : 240;
    const font = () => (emoji ? `${size}px 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif` : `700 ${size}px Unbounded`);
    ctx.font = font();
    while (ctx.measureText(big).width > width && size > 80) {
      size -= 10;
      ctx.font = font();
    }
    const f = font();
    blocks.push({
      h: size * 1.05 + 48,
      draw: at => {
        ctx.font = f;
        ctx.fillStyle = post.color;
        ctx.fillText(big, left, at);
      },
    });
  }

  let titleSize = (hasPhoto ? 62 : 74) - (post.title.length > 70 ? 14 : 0);
  const longestWord = post.title.toLowerCase().split(" ").reduce((a, b) => (b.length > a.length ? b : a), "");
  ctx.font = `700 ${titleSize}px Unbounded`;
  while (ctx.measureText(longestWord).width > width && titleSize > 34) {
    titleSize -= 4;
    ctx.font = `700 ${titleSize}px Unbounded`;
  }
  const titleFont = ctx.font;
  const titleLines = clampLines(wrap(ctx, post.title.toLowerCase(), width), post.options ? 3 : 4);
  blocks.push({
    h: titleLines.length * titleSize * 1.2 + 32,
    draw: at => {
      ctx.font = titleFont;
      ctx.fillStyle = "#fff";
      titleLines.forEach((text, i) => ctx.fillText(text, left, at + i * titleSize * 1.2));
    },
  });

  if (post.options) {
    const fit = post.options.slice(0, Math.max(1, Math.floor((bottom - y - used()) / 100)));
    blocks.push({
      h: fit.length * 100,
      draw: at => {
        fit.forEach((option, i) => {
          const oy = at + i * 100;
          ctx.strokeStyle = "rgba(255,255,255,0.18)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(left, oy, width, 84, 24);
          ctx.stroke();
          ctx.fillStyle = post.color;
          ctx.font = "500 28px 'JetBrains Mono'";
          ctx.fillText(String.fromCharCode(65 + i), left + 32, oy + 27);
          ctx.fillStyle = "#fff";
          ctx.font = "400 34px 'Space Grotesk'";
          ctx.fillText(option, left + 84, oy + 24, width - 116);
        });
      },
    });
  } else if (post.line) {
    const size = hasPhoto ? 36 : 40;
    const lineHeight = size * 1.33;
    ctx.font = `400 ${size}px 'Space Grotesk'`;
    const lineFont = ctx.font;
    const room = Math.max(1, Math.floor((bottom - y - used()) / lineHeight));
    const lines = clampLines(wrap(ctx, post.line, width), Math.min(room, 6));
    blocks.push({
      h: lines.length * lineHeight,
      draw: at => {
        ctx.font = lineFont;
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        lines.forEach((text, i) => ctx.fillText(text, left, at + i * lineHeight));
      },
    });
  }

  let at = hasPhoto ? y : top + Math.max(0, (bottom - top - used()) / 2);
  for (const block of blocks) {
    block.draw(at);
    at += block.h;
  }

  ctx.textBaseline = "middle";
  drawFooter(ctx);
  return toPng(canvas);
};
