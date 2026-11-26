import { findCourse } from "../../courses/data";
import { BALANCE_EXPLAIN, BALANCE_QUESTION, BALANCE_ROUNDS, balanceHeadline, newBalanceGame, rupees } from "../../courses/games/balance-rounds";
import { readBest, shuffle, submitBest } from "../../courses/games/game-utils";
import {
  ASSET_LIABILITY_CARDS,
  AUDIENCES,
  DEBIT_CREDIT_CARDS,
  GAMES,
  PHISH_CARDS,
  PORTS,
  PUZZLE_MESSAGES,
  QUERY_ROUNDS,
  SCAM_CARDS,
  TCP_UDP_CARDS,
  type GameId,
  type GameMeta,
  type SwipeCard,
} from "../../courses/games/games";
import { COURSES } from "../../courses/data";
import { QUIT_CHIP, isQuit, optionChips, pickIndex, printOptions, rule } from "../format";
import type { Chip, Command, Program, Term } from "../term";

type Over = { headline: string; score: string; best?: string; newBest: boolean };

const gameOver = (t: Term, game: GameMeta, over: Over) => {
  const course = findCourse(game.primer.course);
  const chapter = course?.chapters.find(ch => ch.id === game.primer.chapter);
  t.print("");
  t.print(rule("game over"));
  t.block([`{accent:${over.score}}`]);
  t.print(`**${over.headline}**`);
  if (over.newBest) t.print("{yellow:★ new personal best!}");
  else if (over.best) t.print(`{dim:${over.best}}`);
  t.print(`[[↻ play again|play ${game.id} now]]   [[all games|games]]${course && chapter ? `   [[learn it properly|learn ${course.id} ${chapter.number}]]` : ""}`);
  t.exit();
};

/** A game shell: handles quit, so each game only deals with answers */
const run = (t: Term, game: GameMeta, p: Omit<Program, "name"> & { name?: string }) => t.start({ name: game.id, ...p, input: line => (isQuit(line) ? (p.stop?.(), t.print("{dim:game stopped.}"), t.exit()) : p.input(line)) });

// ---------- swipe games ----------

type Sides = { left: string; right: string };

const SWIPES: Partial<Record<GameId, { cards: SwipeCard[] } & Sides>> = {
  "tcp-or-udp": { cards: TCP_UDP_CARDS, left: "tcp", right: "udp" },
  "real-or-phish": { cards: PHISH_CARDS, left: "phish", right: "real" },
  "scam-or-legit": { cards: SCAM_CARDS, left: "scam", right: "legit" },
  "debit-or-credit": { cards: DEBIT_CREDIT_CARDS, left: "debit", right: "credit" },
  "asset-or-liability": { cards: ASSET_LIABILITY_CARDS, left: "asset", right: "liability" },
};

const swipeHeadline = (score: number, total: number) =>
  score === total ? "perfect. are you even human?" : score >= total * 0.7 ? "sharp instincts" : score >= total * 0.4 ? "not bad, keep going" : "sneaky ones, right? try again";

const playSwipe = (t: Term, game: GameMeta, setup: { cards: SwipeCard[] } & Sides) => {
  const deck = shuffle(setup.cards);
  let i = 0;
  let score = 0;
  let streak = 0;
  const show = () => {
    t.print("");
    t.print(`{dim:${i + 1}/${deck.length}}  **${deck[i].prompt}**`);
  };
  const answer = (side: "left" | "right") => {
    const card = deck[i];
    const right = card.side === side;
    score += right ? 1 : 0;
    streak = right ? streak + 1 : 0;
    const label = card.side === "left" ? setup.left : setup.right;
    t.print(`${right ? `{green:✓ ${label}}${streak > 2 ? ` {orange:${streak}🔥}` : ""}` : `{red:✕ it's ${label}.}`} {dim:${card.why}}`);
    i++;
    if (i < deck.length) return show();
    const newBest = submitBest(game.id, score);
    const best = readBest(game.id);
    gameOver(t, game, { headline: swipeHeadline(score, deck.length), score: `${score}/${deck.length}`, best: best !== null ? `your best: ${best}/${deck.length}` : undefined, newBest });
  };
  t.print(`{dim:type} **l** {dim:or} **${setup.left}** {dim:for left,} **r** {dim:or} **${setup.right}** {dim:for right. arrow keys work too.}`);
  run(t, game, {
    prompt: () => `← ${setup.left} | ${setup.right} → ›`,
    chips: () => [{ label: `← ${setup.left}`, send: "l" }, { label: `${setup.right} →`, send: "r" }, QUIT_CHIP],
    keys: { ArrowLeft: "l", ArrowRight: "r" },
    input: line => {
      const s = line.toLowerCase();
      if (s === "l" || s === "left" || s === "1" || s === setup.left) return answer("left");
      if (s === "r" || s === "right" || s === "2" || s === setup.right) return answer("right");
      t.print(`{yellow:type l (${setup.left}) or r (${setup.right}).}`);
    },
  });
  show();
};

// ---------- port rush ----------

const ROUND_SECONDS = 30;
const WRONG_PENALTY = 3;

const playPortRush = (t: Term, game: GameMeta) => {
  let endsAt = Date.now() + ROUND_SECONDS * 1000;
  let score = 0;
  let streak = 0;
  let question = { target: PORTS[0], options: [] as string[] };
  let done = false;

  const make = (avoid?: number) => {
    const pool = PORTS.filter(p => p.port !== avoid);
    const target = pool[Math.floor(Math.random() * pool.length)];
    const decoys = shuffle(PORTS.filter(p => p.port !== target.port)).slice(0, 3);
    question = { target, options: shuffle([target, ...decoys]).map(p => p.service) };
    t.print("");
    t.print(`port {accent:**${target.port}**} → ?`);
    printOptions(t, question.options, true);
  };

  const finish = () => {
    if (done) return;
    done = true;
    window.clearInterval(timer);
    t.print("");
    t.print("{yellow:⏰ time's up!}");
    const newBest = submitBest(game.id, score);
    const best = readBest(game.id);
    gameOver(t, game, {
      headline: score >= 20 ? "port wizard. sysadmins fear you" : score >= 10 ? "solid. you know your doors" : "the doors are tricky. try again",
      score: `${score} points`,
      best: best !== null ? `your best: ${best}` : undefined,
      newBest,
    });
  };

  const timer = window.setInterval(() => (Date.now() >= endsAt ? finish() : t.refresh()), 250);
  const left = () => Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

  run(t, game, {
    prompt: () => `⏱ ${left()}s · ${score} pts ›`,
    chips: () => [...optionChips(4, true), QUIT_CHIP],
    stop: () => {
      done = true;
      window.clearInterval(timer);
    },
    input: line => {
      if (Date.now() >= endsAt) return finish();
      const picked = pickIndex(line, question.options.length) ?? question.options.findIndex(o => o.startsWith(line.toLowerCase()) && line.length > 1);
      if (picked === null || picked < 0) return t.print("{yellow:type 1, 2, 3 or 4.}");
      if (question.options[picked] === question.target.service) {
        streak++;
        score += streak >= 3 ? 2 : 1;
        t.print(`{green:✓ ${question.target.service}}${streak >= 3 ? " {orange:+2 streak 🔥}" : ""}`);
        make(question.target.port);
      } else {
        streak = 0;
        endsAt -= WRONG_PENALTY * 1000;
        t.print(`{red:✕ not ${question.options[picked]}.} {dim:−${WRONG_PENALTY}s}`);
      }
    },
  });
  t.print(`{dim:you have ${ROUND_SECONDS} seconds. a wrong answer costs ${WRONG_PENALTY}s. 3 right in a row = double points. go!}`);
  make();
};

// ---------- packet puzzle ----------

const MISTAKE_PENALTY = 2;

const packetize = (message: string) => {
  let offset = 0;
  return message.split(" ").map(word => {
    const packet = { seq: offset, word };
    offset += word.length + 1;
    return packet;
  });
};

const playPacketPuzzle = (t: Term, game: GameMeta) => {
  const startedAt = Date.now();
  let round = 0;
  let mistakes = 0;
  let packets = packetize(PUZZLE_MESSAGES[0]);
  let scrambled = shuffle(packets);
  let placed = 0;

  const show = () => {
    t.print("");
    t.print(`{dim:message ${round + 1}/${PUZZLE_MESSAGES.length}} · packets arrived out of order:`);
    t.print(scrambled.map((p, i) => `[[${String.fromCharCode(97 + i)}]] {dim:seq=${p.seq}} ${p.word}`).join("   "));
    t.print("{dim:type the letters in order of seq number, one by one or all at once.}");
  };

  const pick = (key: string) => {
    const i = key.charCodeAt(0) - 97;
    const packet = scrambled[i];
    if (!packet) return false;
    if (packet === packets[placed]) {
      placed++;
      return true;
    }
    mistakes++;
    t.print(`{red:✕ ${key} (seq=${packet.seq}) isn't next.} {dim:+${MISTAKE_PENALTY}s}`);
    return false;
  };

  run(t, game, {
    prompt: () => `puzzle ${round + 1}/${PUZZLE_MESSAGES.length} · ${placed}/${packets.length} ›`,
    chips: () => [...scrambled.map((_, i) => ({ label: String.fromCharCode(97 + i), send: String.fromCharCode(97 + i) })), QUIT_CHIP],
    input: line => {
      for (const key of line.toLowerCase().replace(/[^a-z]/g, "")) if (!pick(key)) break;
      if (placed) t.print(`{green:rebuilt:} ${packets.slice(0, placed).map(p => p.word).join(" ")}${placed < packets.length ? " {dim:…}" : " {green:✓}"}`);
      if (placed < packets.length) return;
      round++;
      if (round < PUZZLE_MESSAGES.length) {
        packets = packetize(PUZZLE_MESSAGES[round]);
        scrambled = shuffle(packets);
        placed = 0;
        return show();
      }
      const total = Math.round(((Date.now() - startedAt) / 1000 + mistakes * MISTAKE_PENALTY) * 10) / 10;
      const newBest = submitBest(game.id, total, true);
      const best = readBest(game.id);
      gameOver(t, game, {
        headline: total < 30 ? "faster than a router" : total < 60 ? "smooth reassembly" : "the packets got there… eventually",
        score: `${total}s`,
        best: best !== null ? `your best: ${best}s (lower is better)` : undefined,
        newBest,
      });
    },
  });
  t.print(`{dim:${PUZZLE_MESSAGES.length} messages. you're timed, and every wrong packet adds ${MISTAKE_PENALTY}s.}`);
  show();
};

// ---------- bigger audience ----------

type App = (typeof AUDIENCES)[number];

const playHigherLower = (t: Term, game: GameMeta) => {
  const fresh = (exclude?: App) => shuffle(AUDIENCES.filter(a => a !== exclude));
  let deck = fresh();
  let streak = 0;
  const show = () => {
    t.print("");
    t.print(`which app has more monthly users?   [[1]] {${deck[0].color}:**${deck[0].name}**}   {dim:vs}   [[2]] {${deck[1].color}:**${deck[1].name}**}`);
  };
  run(t, game, {
    prompt: () => `streak ${streak} · 1 or 2 ›`,
    chips: () => [
      { label: `1 ${deck[0].name}`, send: "1" },
      { label: `2 ${deck[1].name}`, send: "2" },
      QUIT_CHIP,
    ],
    keys: { ArrowLeft: "1", ArrowRight: "2" },
    input: line => {
      const picked = pickIndex(line, 2) ?? (deck[0].name.startsWith(line.toLowerCase()) ? 0 : deck[1].name.startsWith(line.toLowerCase()) ? 1 : null);
      if (picked === null || !line) return t.print("{yellow:type 1 or 2.}");
      const [mine, other] = picked === 0 ? [deck[0], deck[1]] : [deck[1], deck[0]];
      const correct = mine.users >= other.users;
      t.print(`${correct ? "{green:✓}" : "{red:✕}"} ${deck[0].name} {dim:${deck[0].users}B} · ${deck[1].name} {dim:${deck[1].users}B}`);
      if (!correct) {
        const newBest = submitBest(game.id, streak);
        const best = readBest(game.id);
        return gameOver(t, game, {
          headline: streak >= 8 ? "you could run a marketing agency" : streak >= 4 ? "good gut feeling" : "your gut lied to you",
          score: `streak ${streak}`,
          best: best !== null ? `your best: ${best}` : undefined,
          newBest,
        });
      }
      streak++;
      deck = deck.length > 2 ? deck.slice(1) : [deck[1], ...fresh(deck[1])];
      show();
    },
  });
  t.print("{dim:keep picking the bigger app. one wrong answer ends the run.}");
  show();
};

// ---------- query builder ----------

const QUERY_PENALTY = 3;

const playQueryBuilder = (t: Term, game: GameMeta) => {
  const startedAt = Date.now();
  let round = 0;
  let mistakes = 0;
  let placed = 0;
  let tiles: string[] = [];
  const target = () => QUERY_ROUNDS[round].tiles;
  const show = () => {
    tiles = shuffle([...target(), QUERY_ROUNDS[round].decoy]);
    placed = 0;
    t.print("");
    t.print(`{dim:query ${round + 1}/${QUERY_ROUNDS.length}} {accent:"${QUERY_ROUNDS[round].ask}"}`);
    t.print(tiles.map((tile, i) => `[[${i + 1}]] \`${tile}\``).join("  "));
  };
  run(t, game, {
    prompt: () => `sql ${round + 1}/${QUERY_ROUNDS.length} ›`,
    chips: () => [...tiles.map((tile, i) => ({ label: `${i + 1} ${tile}`, send: String(i + 1) })), QUIT_CHIP],
    input: line => {
      for (const n of line.split(/[\s,]+/).filter(Boolean)) {
        const tile = tiles[Number(n) - 1];
        if (!tile) {
          t.print(`{yellow:there's no tile ${n}.}`);
          break;
        }
        if (tile === target()[placed]) placed++;
        else {
          mistakes++;
          t.print(`{red:✕ \`${tile}\` doesn't go there${tile === QUERY_ROUNDS[round].decoy ? ". that one's the trap 🪤" : ""}.} {dim:+${QUERY_PENALTY}s}`);
          break;
        }
      }
      if (placed) t.print(`{green:›} \`${target().slice(0, placed).join(" ")}\`${placed === target().length ? " {green:✓ runs!}" : ""}`);
      if (placed < target().length) return;
      round++;
      if (round < QUERY_ROUNDS.length) return show();
      const total = Math.round(((Date.now() - startedAt) / 1000 + mistakes * QUERY_PENALTY) * 10) / 10;
      const newBest = submitBest(game.id, total, true);
      const best = readBest(game.id);
      gameOver(t, game, {
        headline: total < 40 ? "the database obeys you" : total < 80 ? "query master in training" : "SQL is a muscle. keep flexing",
        score: `${total}s`,
        best: best !== null ? `your best: ${best}s (lower is better)` : undefined,
        newBest,
      });
    },
  });
  t.print(`{dim:type tile numbers in the right order, like} \`3 1 4 2\`{dim:. one tile is a trap. mistakes add ${QUERY_PENALTY}s.}`);
  show();
};

// ---------- balance it ----------

const playBalanceIt = (t: Term, game: GameMeta) => {
  const rounds = newBalanceGame();
  let i = 0;
  let score = 0;
  const show = () => {
    const r = rounds[i];
    t.print("");
    t.print(`{dim:round ${i + 1}/${BALANCE_ROUNDS} ·} {accent:${r.business}}`);
    t.print(`**${BALANCE_QUESTION[r.missing](r.values)}**`);
    const cell = (part: "assets" | "liabilities" | "equity") => (part === r.missing ? "{accent:?}" : rupees(r.values[part]));
    t.block([`assets ${cell("assets")}  =  liabilities ${cell("liabilities")}  +  equity ${cell("equity")}`]);
    printOptions(t, r.options.map(rupees), true);
  };
  run(t, game, {
    prompt: () => `books ${i + 1}/${BALANCE_ROUNDS} · ${score} right ›`,
    chips: () => [...optionChips(3, true), QUIT_CHIP],
    input: line => {
      const r = rounds[i];
      const picked = pickIndex(line, r.options.length);
      if (picked === null) return t.print("{yellow:type 1, 2 or 3.}");
      const answer = r.values[r.missing];
      const right = r.options[picked] === answer;
      score += right ? 1 : 0;
      t.print(`${right ? "{green:balanced!}" : `{red:nope, it's ${rupees(answer)}.}`} {dim:${BALANCE_EXPLAIN[r.missing](r.values)}}`);
      i++;
      if (i < rounds.length) return show();
      const newBest = submitBest(game.id, score);
      const best = readBest(game.id);
      gameOver(t, game, { headline: balanceHeadline(score), score: `${score}/${BALANCE_ROUNDS}`, best: best !== null ? `your best: ${best}/${BALANCE_ROUNDS}` : undefined, newBest });
    },
  });
  show();
};

// ---------- menu, primer and launcher ----------

const startGame = (t: Term, game: GameMeta) => {
  const swipe = SWIPES[game.id];
  if (swipe) return playSwipe(t, game, swipe);
  if (game.id === "port-rush") return playPortRush(t, game);
  if (game.id === "packet-puzzle") return playPacketPuzzle(t, game);
  if (game.id === "higher-lower") return playHigherLower(t, game);
  if (game.id === "query-builder") return playQueryBuilder(t, game);
  if (game.id === "balance-it") return playBalanceIt(t, game);
};

const primer = (t: Term, game: GameMeta) => {
  const course = findCourse(game.primer.course);
  const chapter = course?.chapters.find(ch => ch.id === game.primer.chapter);
  t.print("");
  t.print(rule(game.title));
  t.print(`{dim:${game.tagline}}`);
  t.print("");
  t.print("{accent:BEFORE YOU PLAY · 30 SEC READ}");
  game.primer.points.forEach((point, i) => t.print(`{dim:${i + 1}.} ${point}`, { indent: true }));
  if (course && chapter) t.print(`{dim:want the full story?} [[${chapter.title} (${chapter.minutes} min)|learn ${course.id} ${chapter.number}]]`);
  t.print("");
  t.print("press **enter** to play, **q** to go back.");
  const chips: Chip[] = [{ label: "▶ play", send: "" }, ...(course && chapter ? [{ label: "learn first", send: "learn" }] : []), QUIT_CHIP];
  t.start({
    name: "primer",
    prompt: () => `${game.id} · ready? ›`,
    chips: () => chips,
    input: line => {
      if (isQuit(line)) return t.exit();
      if (line === "learn" && course && chapter) {
        t.exit();
        return void t.run(`learn ${course.id} ${chapter.number}`);
      }
      t.exit();
      startGame(t, game);
    },
  });
};

const listGames = (t: Term) => {
  t.print("learn by **playing**. every game starts with a 30-second refresher.");
  for (const course of COURSES) {
    const games = GAMES.filter(g => g.course === course.id);
    if (!games.length) continue;
    t.print("");
    t.print(rule(course.title, course.color));
    for (const g of games) {
      const best = readBest(g.id);
      t.print(`[[▶ ${g.title}|play ${g.id}]] {dim:· ${g.how}${best !== null ? ` · best ${best}` : ""}}`);
      t.print(`  {dim:${g.tagline}}`);
    }
  }
};

const play = (t: Term, args: string[]) => {
  if (!args[0]) return listGames(t);
  const game = GAMES.find(g => g.id === args[0]) ?? GAMES.find(g => g.id.startsWith(args[0].toLowerCase()));
  if (!game) return t.print(`{red:no game called} ${args[0]}. see [[games]].`);
  if (args[1] === "now") return startGame(t, game);
  primer(t, game);
};

export const gameCommands: Command[] = [
  { name: "games", usage: "games", about: "every game, grouped by course", group: "play", run: listGames },
  { name: "play", usage: "play <game>", about: "play a game (with a quick primer first)", group: "play", run: play, complete: () => GAMES.map(g => g.id) },
];
