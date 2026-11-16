import { useEffect, useState, type CSSProperties } from "react";
import codeRain from "../assets/backgrounds/code-rain.jpg";
import corgiHacker from "../assets/founders/corgi-hacker.jpg";
import raccoonHacker from "../assets/founders/raccoon-hacker.jpg";
import { OfftrckBrand } from "../icons/OfftrckMark";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}=+*^?#01";
const SCRAMBLE_STEP_MS = 35;

type Member = { name: string; role: string; handle: string; image: string; caption: string; uid: number };

const team: Member[] = [
  {
    name: "Parikshit Chauhan",
    role: "Researcher",
    handle: "parikshit",
    image: raccoonHacker,
    caption: "fig. 01 · 03:12 am. subject hasn't blinked since tuesday.",
    uid: 1001,
  },
  {
    name: "Harsh",
    role: "Researcher",
    handle: "harsh",
    image: corgiHacker,
    caption: "fig. 02 · two keyboards, zero bugs. allegedly.",
    uid: 1002,
  },
];

// Text that "decrypts" one letter at a time, like a terminal cracking a hash
const scramble = (text: string, revealed: number, pick: (i: number) => number) =>
  text
    .split("")
    .map((char, i) => (i < revealed || char === " " ? char : SCRAMBLE_CHARS[pick(i) % SCRAMBLE_CHARS.length]))
    .join("");

const useScramble = (text: string, delayMs = 0) => {
  const [display, setDisplay] = useState(() => scramble(text, 0, i => i * 7));

  useEffect(() => {
    let revealed = 0;
    let interval: number | undefined;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        revealed += 1;
        setDisplay(scramble(text, revealed, () => Math.floor(Math.random() * SCRAMBLE_CHARS.length)));
        if (revealed >= text.length) window.clearInterval(interval);
      }, SCRAMBLE_STEP_MS);
    }, delayMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, delayMs]);

  return display;
};

const MemberCard = ({ member, index }: { member: Member; index: number }) => {
  const name = useScramble(member.name, 500 + index * 350);
  const record = String(index + 1).padStart(2, "0");

  return (
    <article
      className="group animate-line-in overflow-hidden rounded-lg border border-neon/20 bg-black/75 backdrop-blur-sm transition-colors hover:border-neon/50"
      style={{ animationDelay: `${300 + index * 250}ms` }}
    >
      <div className="glitch-image h-60" style={{ "--glitch-img": `url(${member.image})` } as CSSProperties}>
        <img
          src={member.image}
          alt={`${member.name} (artist's impression)`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="glitch-noise absolute inset-0 opacity-40" />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/10 to-transparent" />
        <p className="absolute right-3 bottom-2 left-3 truncate text-[10px] text-neon/60 italic">{member.caption}</p>
        <span className="absolute top-3 left-3 rounded border border-neon/30 bg-black/60 px-2 py-0.5 text-[10px] tracking-widest text-neon/80">
          RECORD {record}
        </span>
        <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded bg-black/60 px-2 py-0.5 text-[10px] text-neon/80">
          <span className="animate-blink h-1.5 w-1.5 rounded-full bg-neon" />
          online
        </span>
      </div>

      <div className="p-5">
        <h2 className="glitch-hover text-2xl font-bold tracking-wider text-neon uppercase" data-text={member.name}>
          {name}
        </h2>
        <p className="mt-1 text-sm tracking-[0.3em] text-amber uppercase">{member.role}</p>

        <div className="mt-4 rounded border border-neon/10 bg-black/60 p-3 text-xs leading-5 text-slate-400">
          <p>
            <span className="text-neon">$</span> id {member.handle}
          </p>
          <p>uid={member.uid}({member.handle}) gid=1000(offtrck) groups=research</p>
          <p>
            <span className="text-neon">$</span> finger {member.handle}
          </p>
          <p>role: {member.role.toLowerCase()} · access: root · status: <span className="text-neon">active</span></p>
        </div>
      </div>
    </article>
  );
};

const FoundersPage = () => (
  <div className="relative min-h-screen w-full overflow-x-hidden bg-void">
    <img src={codeRain} alt="" className="fixed inset-0 h-full w-full object-cover opacity-30" />
    <div className="fixed inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/95" />
    <div className="glitch-noise pointer-events-none fixed inset-0 opacity-50" />

    <header className="relative z-10 flex items-center justify-between px-6 py-5 text-sm">
      <OfftrckBrand markClassName="h-4 w-4" />
      <a href="#/" className="text-xs text-neon/60 hover:text-neon hover:underline">
        [ ← back to login ]
      </a>
    </header>

    <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-6 pb-16 md:pt-12">
      <p className="animate-line-in text-xs text-neon/60 md:text-sm">
        <span className="text-neon">root@offtrck</span>:~$ sudo cat /etc/offtrck/team
        <span className="animate-blink ml-1 inline-block h-3.5 w-2 translate-y-0.5 bg-neon" />
      </p>

      <h1
        className="glitch-text animate-line-in mt-6 text-5xl font-extrabold tracking-[0.2em] text-neon uppercase md:text-7xl"
        data-text="team"
        style={{ animationDelay: "120ms" }}
      >
        team
      </h1>
      <p className="animate-line-in mt-4 text-center text-sm text-neon/50" style={{ animationDelay: "200ms" }}>
        the minds behind offtrck · {team.length} records decrypted
      </p>

      <div className="mt-10 grid w-full gap-6 md:grid-cols-2">
        {team.map((member, index) => (
          <MemberCard key={member.handle} member={member} index={index} />
        ))}
      </div>

      <p className="mt-10 text-center text-[11px] tracking-widest text-neon/30 uppercase">
        access level: public · connection: encrypted · trace: none
      </p>
    </main>
  </div>
);

export default FoundersPage;
