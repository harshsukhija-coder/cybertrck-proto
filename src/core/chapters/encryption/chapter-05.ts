import alwaysHasBeenMeme from "../../../assets/memes/always-has-been.gif";
import epicHandshakeMeme from "../../../assets/memes/epic-handshake.gif";
import shallNotPassMeme from "../../../assets/memes/shall-not-pass.gif";
import spidermanPointingMeme from "../../../assets/memes/spiderman-pointing.gif";
import hackermanMeme from "../../../assets/memes/hackerman.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 05 · asymmetric encryption & the https team-up" },
    { from: "friday", text: "please tell me there is a way out of the key-exchange loop." },
    { from: "ramesh", text: "there is. {purple:asymmetric encryption}. instead of one shared key, a clever matched pair of keys that are mathematically linked." },
    { from: "friday", image: spidermanPointingMeme, caption: "public key and private key, recognising each other" },
  ],
  [
    { from: "ramesh", text: "one key is kept completely secret: the {green:private key}. it never leaves its owner." },
    { from: "ramesh", text: "the other is the {cyan:public key}. share it with anyone. post it. email it. print it on a hoodie. it doesn't matter." },
    { from: "system", text: "a math-linked pair.", visual: "key-pair" },
  ],
  [
    { from: "friday", text: "if i give my public key to the world... can't the world just reverse it into my private key?" },
    { from: "ramesh", text: "that's the clever part. the link is one-way in practice. locking is easy with the public key. unlocking needs the private key. public can close the lock. it cannot open it again." },
    { from: "friday", image: shallNotPassMeme, caption: "the private key, declining every visitor" },
  ],
  [
    { from: "ramesh", text: "think of the public key as an open padlock you hand out to everyone." },
    { from: "friday", text: "anyone can snap that padlock shut on a box and send the box to me..." },
    { from: "ramesh", text: "...and only you have the physical key that opens that padlock. more padlocks in the wild does not help thieves." },
    { from: "system", text: "open padlocks in, locked boxes home.", visual: "padlock-box" },
  ],
  [
    { from: "friday", text: "so if i want to send you a private message, i encrypt with {cyan:your public key}?" },
    { from: "ramesh", text: "yes. and even you, after encrypting it, cannot undo it. only my private key can. an eavesdropper who watched me publish my public key still can't read the message." },
    { from: "friday", text: "wait. so two people who never met can do this? without sharing a private key first?" },
    { from: "ramesh", text: "exactly. the key exchange problem: solved." },
  ],
  [
    { from: "friday", text: "then why did we bother with symmetric at all?? just use asymmetric for everything!" },
    { from: "ramesh", text: "fair question. answer: speed." },
    { from: "system", text: "fast vs slow.", visual: "speed-race" },
    { from: "ramesh", text: "asymmetric is brilliant for small secrets. it is not ideal for huge amounts of data. streaming a movie under pure RSA would make your laptop cry." },
  ],
  [
    { from: "friday", text: "so which one does the internet actually use?" },
    { from: "ramesh", text: "the clever answer: {yellow:both together}." },
    { from: "friday", image: epicHandshakeMeme, caption: "symmetric and asymmetric, every https connection" },
  ],
  [
    { from: "ramesh", text: "that combination is exactly what happens every time you see {green:https} and the padlock in your browser." },
    { from: "ramesh", text: "quick setup first: asymmetric solves the hard part. then symmetric does the heavy lifting." },
    { from: "system", text: "the https handshake, simplified.", visual: "https-handshake" },
  ],
  [
    { from: "friday", text: "step by step, in human words:" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "https in four beats",
        text: "1) website shares its {cyan:public key} (inside a certificate).\n2) your browser creates a brand-new {yellow:symmetric session key}.\n3) browser encrypts that session key with the website's public key and sends it. only the real site can unlock it with its {green:private key}.\n4) both sides now share the session key and switch to {pink:fast symmetric encryption} for all the real data.",
      },
    },
    { from: "ramesh", text: "best of both worlds. security of asymmetric for the delicate key delivery. performance of symmetric for everything after." },
  ],
  [
    { from: "friday", text: "and each visit gets a new session key?" },
    { from: "ramesh", text: "yep. disposable keys. even if one were exposed, it wouldn't unlock your past or future conversations." },
    { from: "system", text: "fresh keys, damaged blast radius.", visual: "session-keys" },
  ],
  [
    { from: "friday", text: "so when i finally send Dev the password on a real https page..." },
    { from: "system", text: "the attacker's wireshark now.", visual: "wireshark-tls" },
    { from: "friday", text: "noise. beautiful noise." },
    { from: "ramesh", text: "this mechanism protects your logins, payments and messages every single day. the padlock was never decoration." },
    { from: "friday", image: alwaysHasBeenMeme, caption: "the browser padlock: always encryption" },
  ],
  [
    { from: "friday", text: "ok. i think i get it. http was a postcard. encryption locked the box. symmetric is the fast lock once both sides have the key. asymmetric is how strangers share a key without meeting. https hires both." },
    { from: "ramesh", text: "teach that back to me any day. next concepts: hashing, then vpn. for now: quiz, notes, go protect that password." },
    { from: "friday", image: hackermanMeme, caption: "friday, about to click only on https" },
    { from: "system", text: "encryption module complete. next concept: hashing." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "asymmetric encryption uses...",
    options: ["one shared key only", "a matched public/private key pair", "no keys", "twenty five alphabet shifts"],
    answer: 1,
    explanation: "a mathematically linked pair: public + private.",
  },
  {
    question: "which key can be shared openly?",
    options: ["private key", "public key", "both must stay secret", "neither exists"],
    answer: 1,
    explanation: "public keys are meant to be distributed.",
  },
  {
    question: "which key must never leave its owner?",
    options: ["public key", "wifi password only", "private key", "the ciphertext"],
    answer: 2,
    explanation: "private key stays private. always.",
  },
  {
    question: "data encrypted with a public key can be decrypted by...",
    options: ["anyone with the public key", "only the matching private key", "any ISP", "caesar shift 3"],
    answer: 1,
    explanation: "public locks, private opens.",
  },
  {
    question: "the open-padlock metaphor means...",
    options: [
      "anyone can lock a box to you, only you can open it",
      "anyone can open your messages",
      "padlocks are decorative",
      "private keys should be emailed weekly",
    ],
    answer: 0,
    explanation: "hand out open padlocks; keep the opening key.",
  },
  {
    question: "why not encrypt all web traffic with asymmetric alone?",
    options: ["it is illegal", "it is much slower and not ideal for large data", "browsers forgot how", "public keys expire every second"],
    answer: 1,
    explanation: "asymmetric is great for small secrets, not bulk throughput.",
  },
  {
    question: "what does https use in practice?",
    options: ["only symmetric", "only asymmetric", "both: asymmetric to share a session key, then symmetric for data", "only caesar"],
    answer: 2,
    explanation: "the team-up is the whole trick.",
  },
  {
    question: "during https setup, what does your browser usually send under the website's public key?",
    options: ["its private key", "a fresh symmetric session key", "the wifi password in plaintext", "a meme"],
    answer: 1,
    explanation: "the session key is delivered safely via asymmetric encryption.",
  },
  {
    question: "why are new session keys created often?",
    options: [
      "to make the address bar blink",
      "so one leaked key doesn't unlock past or future conversations",
      "because aes only works once",
      "because private keys must be public",
    ],
    answer: 1,
    explanation: "fresh disposable keys limit damage.",
  },
  {
    question: "after https is in place, what does an attacker sniffing the connection see?",
    options: ["passwords in clear text", "ciphertext / noise", "your private key", "the session key written in english"],
    answer: 1,
    explanation: "application data on the wire is encrypted.",
  },
];

const notes = `# chapter 05 · asymmetric encryption & https

> offtrck · encryption module · study notes

## asymmetric encryption (public-key crypto)
uses a **matched key pair**:
| key | share? | job |
|---|---|---|
| public key | yes, openly | lock / encrypt to the owner |
| private key | never | unlock / decrypt (and sign, in other uses) |

property that matters here: data encrypted with the public key can only be decrypted with the matching private key.

### padlock metaphor
- public key = open padlock you hand out
- anyone can snap it shut on a box for you
- only your private key opens it

this solves the **key exchange problem**: strangers can send secrets without a pre-shared private key.

examples of asymmetric algorithms: RSA, ECDSA/ECDH curves (modern TLS prefers elliptic curves).

## speed tradeoff
| | symmetric | asymmetric |
|---|---|---|
| keys | one shared secret | public/private pair |
| speed | very fast | slower |
| best for | bulk data | key exchange, signatures, small secrets |

## https = both together
every padlock in your browser is roughly this dance:
1. site presents a certificate containing its **public key**
2. browser creates a fresh **symmetric session key**
3. browser encrypts that session key with the site's public key and sends it
4. only the site's **private key** unlocks it
5. both sides switch to fast **symmetric** crypto for the real traffic

result: security of asymmetric for the delicate handshake + performance of symmetric for the payload.

### session keys
new session keys are created often. a single leak should not unlock past or future conversations.

## from chapter 1 to here
- http postcard → readable to sniffers (Wireshark)
- encryption → ciphertext noise
- symmetric → fast shared-secret protection
- asymmetric → safe way to create that shared secret with strangers
- https → the daily team-up protecting logins, payments, messages

## remember
public locks. private opens.
https hires both families.
look for the padlock. protect the private key.
`;

export const encryptionChapterFive: Chapter = {
  title: "chapter 05",
  subtitle: "asymmetric & https",
  scenes,
  quiz,
  notes,
};
