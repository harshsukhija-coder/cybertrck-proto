import type { FeedItem } from "../../courses/feed-build";
import { drawPostCard, shareOfItem, type SharePost } from "../../courses/share/post-share";
import { shareLinks } from "../../courses/share/share-utils";
import { rule } from "../format";
import type { Term } from "../term";

/** Posts the feed has printed, so "share post <key>" can find them again */
const shown = new Map<string, SharePost>();

/** Remembers a feed item and returns a clickable share link for it, or "" if it can't be shared */
export const shareChip = (item: FeedItem) => {
  const post = shareOfItem(item);
  if (!post) return "";
  shown.set(post.key, post);
  return `[[↗ share|share post ${post.key}]]`;
};

export const sharePost = async (t: Term, args: string[]) => {
  const post = shown.get(args[0] ?? "");
  if (!post) return t.print("{dim:open your} [[feed]] {dim:and tap share under any post.}");
  const { key, caption, url } = post;

  if (args[1] === "image") {
    t.print("{dim:drawing the image…}");
    const blob = await drawPostCard(post).catch(() => null);
    if (!blob) return t.print("{red:couldn't draw the image.} the caption and links still work.");
    const href = URL.createObjectURL(blob);
    t.image(href, post.title);
    const a = document.createElement("a");
    a.href = href;
    a.download = `offtrck-${key}.png`;
    a.click();
    return t.print(`{green:saved} offtrck-${key}.png {dim:to your downloads. post it with the caption.}`);
  }
  if (args[1] === "copy" || args[1] === "link") {
    await navigator.clipboard.writeText(args[1] === "copy" ? caption : url).catch(() => undefined);
    return t.print(`{green:${args[1] === "copy" ? "caption" : "link"} copied ✓} paste it anywhere.`);
  }

  t.print(rule(`share · ${post.label}`, post.color));
  t.block(caption.split("\n").map(line => line.replace(/[{}[\]]/g, "")));
  t.print(`[[📋 copy caption|share post ${key} copy]]   [[🔗 copy link|share post ${key} link]]   [[🖼 download image|share post ${key} image]]`);
  t.segs(shareLinks(caption, url).flatMap(l => [{ text: `${l.label} ↗`, href: l.href }, { text: "   " }]));
  t.print("{dim:for instagram: download the image, copy the caption, then post both.}");
};
