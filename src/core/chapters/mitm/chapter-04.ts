import imIn from "../../../assets/memes/im-in.gif";
import myPrecious from "../../../assets/memes/my-precious.gif";
import hideThePain from "../../../assets/memes/hide-the-pain.gif";
import alwaysHasBeen from "../../../assets/memes/always-has-been.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "cyber-attacks · man in the middle · chapter 04" },
    { from: "system", text: "🕶️ tone: heist. quiet hands. loud cookies." },
  ],
  [
    { from: "kim", text: "i'm middle. what now? depends if traffic is encrypted — but the menu looks like this:" },
    { from: "system", visual: "session-hijack" },
  ],
  [
    { from: "kim", text: "power one: {cyan:eavesdrop}. plaintext is a postcard. i read sites, searches, forms." },
    {
      from: "system",
      dual: {
        kim: {
          title: "listen",
          prompt: "kim@kali:~$",
          command: "tcpdump -A -s 0 'tcp port 80' | rg -i 'password|user='",
          output: `GET /login HTTP/1.1
Host: mail.cafe-portal.local
...
username=sally&password={red:OatMilk42!}

{green:[+]} postcard captured · no lock on the door`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "mail.cafe-portal.local/login",
            secure: false,
            heading: "Sign in",
            body: "username: sally\npassword: ••••••••\n\n[ log in ]\n\n(http · no lock · still typing)",
          },
          note: "sally: 'it's just webmail' 😅",
        },
      },
    },
    { from: "sally", image: hideThePain, caption: "it's fine it's fine it's fine" },
    { from: "kim", image: imIn, caption: "credentials in the clear" },
  ],
  [
    { from: "kim", text: "power two: {orange:modify}. because packets pass through me, i can rewrite a request — or inject a page she never asked for." },
    {
      from: "system",
      dual: {
        kim: {
          title: "inject",
          prompt: "kim@kali:~$",
          command: "# mitmproxy script: swap download link\n# inject fake 'update available' banner",
          output: `{yellow:[~]} response rewritten
{pink:[+]} banner planted: "click to update flash" 🫠`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "news.example.com",
            secure: false,
            heading: "Local News",
            body: "headline: jazz night friday\n\n⚠️ UPDATE AVAILABLE — click here\n(sally did not ask for this)",
          },
          note: "page looks 'normal' · content was touched",
        },
      },
    },
  ],
  [
    { from: "kim", text: "power three: {pink:session hijack}. after login, the site hands a {yellow:session cookie} — the wristband that keeps you logged in." },
    { from: "kim", text: "steal the cookie, wear the wristband, walk into the account. password optional. 🎫" },
    {
      from: "system",
      dual: {
        kim: {
          title: "cookies",
          prompt: "kim@kali:~$",
          command: "echo $SESSION_COOKIE",
          output: `PHPSESSID={pink:7f3a9c…deadbeef}
{green:[+]} importing into attacker browser…
{green:[+]} inbox open · no password prompt`,
        },
        sally: {
          mode: "browser",
          title: "chrome",
          browser: {
            url: "mail.cafe-portal.local/inbox",
            secure: false,
            heading: "Inbox",
            body: "still logged in on her side too.\nboth of them are 'sally' now.",
          },
          note: "two sessions · one identity",
        },
      },
    },
    { from: "kim", image: myPrecious, caption: "session cookie" },
    { from: "system", image: alwaysHasBeen, caption: "wait… she's been in the middle the whole time?" },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "danger",
        title: "silent by design",
        text: "connection works. pages load. usually no popup that says 'someone is reading over your shoulder'.",
      },
    },
    { from: "friday", text: "okay i'm sweating. how do we not be sally." },
    { from: "ramesh", text: "chapter five: stack habits. https. warnings. vpn. mfa. and stop treating open wifi like a hug. 🛡️" },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "if traffic isn't encrypted, a mitm can…",
    options: ["only crash the wifi", "read it like a postcard", "make coffee", "fix MAC addresses on the moon"],
    answer: 1,
    explanation: "plaintext eavesdropping is the simplest win.",
  },
  {
    question: "session cookies matter because…",
    options: ["they brew espresso", "they keep you logged in — steal them, wear the session", "they are always https-only forever", "routers eat them"],
    answer: 1,
    explanation: "hijack = walk into the account without the password.",
  },
  {
    question: "modifying traffic means the attacker can…",
    options: ["only change the wallpaper", "alter requests or inject fake page content", "delete the sun", "fix Jules' apron"],
    answer: 1,
    explanation: "middle seat = rewrite opportunity.",
  },
  {
    question: "the scariest UI cue during a quiet mitm is often…",
    options: ["a huge red banner saying HACKED", "nothing unusual", "a police siren ringtone", "the laptop speaking latin"],
    answer: 1,
    explanation: "silence is why people get caught flat-footed.",
  },
];

const notes = `# man in the middle · chapter 04 — silent damage

Once middle, the attacker may:

1. **Eavesdrop** — read unencrypted traffic (sites, searches, plaintext logins)
2. **Modify** — change requests/responses, inject content
3. **Impersonate / hijack** — steal **session cookies** and use the logged-in session

Encryption decides how much of that menu is edible. Next chapter: defenses.
`;

export const mitmChapterFour: Chapter = {
  title: "silent damage",
  subtitle: "eavesdrop · rewrite · steal the wristband",
  scenes,
  quiz,
  notes,
};
