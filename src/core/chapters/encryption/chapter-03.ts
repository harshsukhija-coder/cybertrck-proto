import easyButtonMeme from "../../../assets/memes/easy-button.gif";
import mathLadyMeme from "../../../assets/memes/math-lady.gif";
import mindBlownMeme from "../../../assets/memes/mind-blown.gif";
import sweatingMeme from "../../../assets/memes/sweating.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 03 · from caesar to modern keys" },
    { from: "ramesh", text: "before AES and https, people still needed secret messages. one of the oldest tricks: shift every letter by a fixed amount." },
    { from: "friday", text: "like a secret decoder ring?" },
    { from: "ramesh", text: "exactly. Julius Caesar allegedly used it. hence: {yellow:Caesar cipher}." },
  ],
  [
    { from: "ramesh", text: "rule for today: move every letter {yellow:three} places forward. A becomes D. B becomes E. ... Z wraps around to C." },
    { from: "friday", text: "so the alphabet slides..." },
    { from: "system", text: "A-Z mapped to D-C with key = 3.", visual: "caesar-wheel" },
  ],
  [
    { from: "friday", text: "so... {cyan:ATTACK AT DAWN} turns into {pink:DWWDFN DW GDZQ}? and i undo it by shifting back?" },
    { from: "ramesh", text: "yes. that is encryption and decryption. the {yellow:key} is the number 3. change the key to 5, and the whole mapping changes." },
    { from: "friday", text: "so the algorithm is 'shift by N'... and the key is just N?" },
    { from: "ramesh", text: "exactly. now the question that kills toy ciphers: how many possible N values exist?" },
    { from: "friday", text: "uh. 25? because 0 does nothing and 26 is a full loop back to the start?" },
    { from: "ramesh", text: "yes. and 25 is nothing. watch me break it." },
    { from: "system", text: "brute forcing caesar.", visual: "caesar-crack" },
  ],
  [
    { from: "friday", text: "key 3 pops out the english sentence immediately." },
    { from: "ramesh", text: "that's brute force. try every key. for Caesar it takes seconds. a laptop laughs at it." },
    { from: "friday", image: easyButtonMeme, caption: "breaking caesar in the year 2026" },
    { from: "friday", text: "so why did we learn a broken cipher?" },
    { from: "ramesh", text: "because the *ideas* are the same: plaintext, key, ciphertext, brute force. modern crypto just makes the keyspace so huge that brute force dies of old age." },
  ],
  [
    { from: "friday", text: "how huge are we talking?" },
    { from: "ramesh", text: "sit down." },
    { from: "system", text: "caesar vs AES key space.", visual: "key-space" },
    { from: "friday", image: mathLadyMeme, caption: "friday trying to fit 2^256 into his head" },
  ],
  [
    { from: "friday", text: "one billion keys a second... and it still needs more years than the universe has existed??" },
    { from: "ramesh", text: "for AES-128. AES-256 is another universe on top of that universe. this is what 'astronomically hard' means." },
    { from: "friday", image: mindBlownMeme, caption: "the moment brute force stopped sounding clever" },
    { from: "friday", image: sweatingMeme, caption: "friday's old 'i'll just guess the password' plan" },
  ],
  [
    { from: "ramesh", text: "modern algorithms (AES, ChaCha20) also scramble in complex rounds, not one alphabet slide. but the headline remains: {yellow:large keys + enormous keyspace}." },
    { from: "friday", text: "ok. strong locks. but... who holds the key when two strangers talk on the internet? i don't get that part." },
    { from: "ramesh", text: "that question splits encryption into two big families. symmetric and asymmetric. next chapter. i'll lead." },
    { from: "system", text: "chapter 3 complete. next: shared secrets and the key exchange problem." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "in a Caesar cipher with shift 3, what does A become?",
    options: ["A", "B", "C", "D"],
    answer: 3,
    explanation: "A→B→C→D. three steps forward.",
  },
  {
    question: "in our example, what is the key?",
    options: ["the word ATTACK", "the number 3 (the shift)", "the alphabet itself", "wireshark"],
    answer: 1,
    explanation: "the key is the shift amount.",
  },
  {
    question: "ATTACK AT DAWN with shift 3 becomes...",
    options: ["BUUBDL BU EBXO", "DWWDFN DW GDZQ", "ATTACK AT DAWN", "ZZZZZZ ZZ ZZZZ"],
    answer: 1,
    explanation: "each letter moves three places forward.",
  },
  {
    question: "how do you decrypt a Caesar ciphertext if you know the shift?",
    options: ["shift forward again", "shift backward by the same amount", "delete every third letter", "ask the isp"],
    answer: 1,
    explanation: "decryption reverses the shift.",
  },
  {
    question: "about how many useful keys does Caesar have?",
    options: ["2", "25", "2^128", "infinite"],
    answer: 1,
    explanation: "25 non-trivial shifts. easy to try them all.",
  },
  {
    question: "what does brute force mean here?",
    options: ["politely asking for the key", "trying every possible key until readable text appears", "turning off the wifi", "using a bigger font"],
    answer: 1,
    explanation: "exhaustive search of the keyspace.",
  },
  {
    question: "why is Caesar easy to break?",
    options: ["english doesn't exist", "the keyspace is tiny", "computers hate alphabets", "https blocks it"],
    answer: 1,
    explanation: "25 keys is nothing for a computer or even a patient human.",
  },
  {
    question: "roughly how big is an AES-128 keyspace?",
    options: ["25", "128", "2^128 possible keys", "128 websites"],
    answer: 2,
    explanation: "128 bits means 2^128 possible keys.",
  },
  {
    question: "why can't attackers just 'try all AES keys'?",
    options: [
      "because AES is illegal to attack",
      "because the number of keys is astronomically large",
      "because keys are always written on paper",
      "because wireshark refuses to open",
    ],
    answer: 1,
    explanation: "even crazy-fast guessing cannot finish before the heat death of everything.",
  },
  {
    question: "what lesson carries from Caesar to modern crypto?",
    options: [
      "always shift by 3",
      "plaintext + key → ciphertext, and keyspace size matters",
      "romans invented https",
      "never use keys",
    ],
    answer: 1,
    explanation: "same structure, wildly different key sizes and algorithms.",
  },
];

const notes = `# chapter 03 · from caesar to modern keys

> offtrck · encryption module · study notes

## Caesar cipher
- algorithm: shift each letter by N places in the alphabet (wrap around after Z)
- key: the number N
- example with N=3: \`ATTACK AT DAWN\` → \`DWWDFN DW GDZQ\`
- decrypt: shift backward by N

### alphabet map (N=3)
\`\`\`
plain:  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
cipher: D E F G H I J K L M N O P Q R S T U V W X Y Z A B C
\`\`\`

## breaking Caesar
only **25** useful keys. try each shift; the output that looks like real language is the answer. this is **brute force**.

## modern encryption
| system | keyspace | brute force? |
|---|---|---|
| Caesar | 25 | trivial |
| AES-128 | 2^128 ≈ 3.4×10^38 | impractical |
| AES-256 | 2^256 ≈ 1.2×10^77 | beyond astronomical |

thought experiment: 1 billion guesses/sec still needs on the order of 10^22 years for AES-128. the universe is ~10^10 years old.

modern ciphers also use many complex rounds (substitution + permutation), not a single alphabet slide. but the headline for beginners: **large keys make exhaustive search hopeless**.

## remember
Caesar teaches the vocabulary. AES teaches why the internet can trust math.
`;

export const encryptionChapterThree: Chapter = {
  title: "chapter 03",
  subtitle: "from caesar to modern keys",
  scenes,
  quiz,
  notes,
};
