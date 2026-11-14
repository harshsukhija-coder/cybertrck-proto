import mindBlownMeme from "../../../assets/memes/mind-blown.gif";
import myPreciousMeme from "../../../assets/memes/my-precious.gif";
import shhMeme from "../../../assets/memes/shh.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 02 · what is encryption?" },
    { from: "friday", text: "ok. encryption scrambles stuff. but... how? is it just random nonsense?" },
    { from: "ramesh", text: "no. if it were random, even Dev couldn't read it. random is a shredder. encryption is a lock." },
    { from: "friday", text: "a lock with a key?" },
    { from: "ramesh", text: "exactly. let's name the pieces." },
  ],
  [
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "the dictionary",
        text: "{cyan:plaintext} -> the original readable information. 'Mango$42', 'pay Dev 5000', 'i love pizza'.\n{pink:ciphertext} -> the scrambled unreadable version.\n{yellow:key} -> the secret that controls exactly how scrambling (and unscrambling) happens.\n{green:encryption} -> plaintext -> ciphertext.\n{orange:decryption} -> ciphertext -> plaintext.",
      },
    },
    { from: "friday", text: "so encryption is the process of taking readable information and turning it into a form that cannot be understood..." },
    { from: "ramesh", text: "...unless you have the right key. yes." },
  ],
  [
    { from: "ramesh", text: "watch the flow. same secret. two directions." },
    { from: "system", text: "plaintext, key, ciphertext, back again.", visual: "encrypt-flow" },
  ],
  [
    { from: "friday", text: "hold on. the attacker still gets the pink box. they just can't read it?" },
    { from: "ramesh", text: "correct. we are not hiding the fact that a message exists. we are making the contents useless without the key." },
    { from: "friday", text: "so security does not depend on hiding the data..." },
    { from: "ramesh", text: "...it depends on {yellow:protecting the key}. say it again. louder. tattoo it." },
    { from: "friday", image: shhMeme, caption: "the key, remaining a secret" },
  ],
  [
    { from: "friday", text: "what counts as a key? a password?" },
    { from: "ramesh", text: "sometimes a password is used to *derive* a key. but the key itself is usually a long string of bits: 128, 256 of them. a giant precise number the algorithm feeds on." },
    { from: "friday", text: "and without that number, ciphertext stays meaningless forever?" },
    { from: "ramesh", text: "in good modern crypto: for all practical purposes, yes. guessing is not realistic. we'll show you the scary numbers next chapter." },
    { from: "friday", image: myPreciousMeme, caption: "ramesh, about the key" },
  ],
  [
    { from: "friday", text: "real world examples. where is this happening to me right now?" },
    { from: "ramesh", text: "everywhere you don't notice:" },
    {
      from: "system",
      callout: {
        tone: "tip",
        title: "encryption in your daily life",
        text: "{green:https websites} -> every login, every payment form.\n{cyan:whatsapp / signal} -> messages locked on your phone before they leave.\n{yellow:phone lock / laptop disk encryption} -> stolen device ≠ stolen files.\n{orange:banking apps} -> your session is wrapped in crypto.\n{purple:vpn} -> (later module) a tunnel of ciphertext across a hostile network.",
      },
    },
    { from: "friday", image: mindBlownMeme, caption: "friday realising his pizza order was also ciphertext" },
  ],
  [
    { from: "friday", text: "one more dumb question. if someone steals the ciphertext but not the key... we are fine?" },
    { from: "ramesh", text: "not dumb. usually yes. if they steal the key, the lock is useless. that's why keys live in password managers, secure enclaves, hardware tokens, and short-lived sessions." },
    { from: "ramesh", text: "next i'll show you a tiny encryption algorithm. caesar's cipher. then we smash it. then you see why modern crypto does not smash so easily." },
    { from: "system", text: "chapter 2 complete. next: from caesar to modern keys." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "what is plaintext?",
    options: ["scrambled unreadable data", "the original readable information", "the wifi password only", "a type of firewall"],
    answer: 1,
    explanation: "plaintext is the readable original: a password, a message, a bank instruction.",
  },
  {
    question: "what is ciphertext?",
    options: ["the scrambled unreadable output of encryption", "a secret key", "an http header", "a cafe wifi name"],
    answer: 0,
    explanation: "ciphertext is what plaintext becomes after encryption.",
  },
  {
    question: "what does a key do?",
    options: [
      "deletes old messages",
      "controls exactly how data is scrambled and unscrambled",
      "speeds up the wifi",
      "chooses a font for the website",
    ],
    answer: 1,
    explanation: "the key drives both encryption and decryption.",
  },
  {
    question: "turning plaintext into ciphertext is called...",
    options: ["decryption", "encryption", "routing", "sniffing"],
    answer: 1,
    explanation: "encryption locks. decryption unlocks.",
  },
  {
    question: "turning ciphertext back into plaintext is called...",
    options: ["encryption", "compression", "decryption", "hashing"],
    answer: 2,
    explanation: "decryption reverses encryption when you have the right key.",
  },
  {
    question: "without the right key, ciphertext should be...",
    options: ["easy to read after zooming in", "meaningless", "the same as plaintext", "stored only on paper"],
    answer: 1,
    explanation: "no key, no meaning. that's the whole point.",
  },
  {
    question: "where does the security of encryption mostly live?",
    options: ["hiding the algorithm forever", "protecting the key", "using a secret wifi name", "closing your laptop lid"],
    answer: 1,
    explanation: "modern algorithms are public. secrets are the keys.",
  },
  {
    question: "which everyday thing relies on encryption?",
    options: ["https logins and payments", "writing on a sticky note", "speaking in a quiet room", "using a paper map"],
    answer: 0,
    explanation: "https (and messaging apps, disk encryption, banking apps) all lean on encryption.",
  },
  {
    question: "if an attacker steals ciphertext but not the key, what usually happens?",
    options: ["they can read everything instantly", "they see noise and cannot recover the original", "your phone unlocks", "the website shuts down"],
    answer: 1,
    explanation: "ciphertext without a key should stay useless.",
  },
  {
    question: "why is encryption not the same as 'random scrambling'?",
    options: [
      "because the receiver must be able to reverse it with the key",
      "because random is always secure",
      "because encryption never uses math",
      "because ciphertext must look like english",
    ],
    answer: 0,
    explanation: "it is controlled scrambling. the key makes reversing possible for the right person only.",
  },
];

const notes = `# chapter 02 · what is encryption?

> offtrck · encryption module · study notes

## definition
**encryption** is the process of taking readable information and scrambling it into a form that cannot be understood without the right secret.

## the five words
| word | meaning |
|---|---|
| plaintext | readable original data |
| ciphertext | scrambled unreadable data |
| key | secret that controls the transformation |
| encryption | plaintext → ciphertext |
| decryption | ciphertext → plaintext |

## the core idea
the transformation is **not random**. it is controlled by a **key**.
- same algorithm + wrong key = garbage
- same algorithm + right key = original message

**security does not depend on hiding the data. it depends on protecting the key.**

modern crypto usually publishes the algorithm (AES, ChaCha20, RSA, ...). attackers are assumed to know how it works. what they must not get is the key.

## keys in practice
- often 128 or 256 bits of randomness
- passwords are sometimes stretched into keys (PBKDF2, scrypt, argon2)
- keys are stored in password managers, OS keychains, TPMs/secure enclaves, or exist only briefly in memory for one session

## daily life
- https websites
- encrypted messengers
- full-disk encryption (BitLocker, FileVault, LUKS)
- banking apps
- (later) VPNs

## remember
plaintext in → key turns the dial → ciphertext out.
ciphertext in → same/related key → plaintext out.
lose the key, lose the meaning. protect the key.
`;

export const encryptionChapterTwo: Chapter = {
  title: "chapter 02",
  subtitle: "what is encryption?",
  scenes,
  quiz,
  notes,
};
