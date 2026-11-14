import dogChasingTailMeme from "../../../assets/memes/dog-chasing-tail.gif";
import hideThePainMeme from "../../../assets/memes/hide-the-pain.gif";
import kaChowMeme from "../../../assets/memes/ka-chow.gif";
import surprisedPikachuMeme from "../../../assets/memes/surprised-pikachu.gif";
import type { Chapter, QuizQuestion, Scene } from "../../story";

const scenes: Scene[] = [
  [
    { from: "system", text: "chapter 04 · symmetric encryption & the key exchange problem" },
    { from: "ramesh", text: "two families protect almost everything online. first family: {green:symmetric encryption}. most straightforward kind." },
    { from: "friday", text: "symmetric... like a matching pair of socks?" },
    { from: "ramesh", text: "same key on both sides. one shared secret. encrypt with it. decrypt with it." },
  ],
  [
    { from: "system", text: "one key · two laptops · ciphertext in the middle.", visual: "symmetric-flow" },
    { from: "friday", text: "so i lock with KEY... internet sees pink noise... Dev unlocks with the same KEY?" },
    { from: "ramesh", text: "you've got it. AES is the famous modern symmetric cipher. your https downloads, your disk encryption, a lot of vpn traffic inside the tunnel: symmetric is doing the heavy lifting." },
  ],
  [
    { from: "friday", text: "why do people love it so much?" },
    { from: "ramesh", text: "{green:speed}. insanely fast and efficient, even for huge amounts of data. movies. backups. entire websites." },
    { from: "friday", image: kaChowMeme, caption: "symmetric encryption, casually encrypting a 4gb file" },
  ],
  [
    { from: "friday", text: "there's a catch. i can feel a catch." },
    { from: "ramesh", text: "there is a big one. both sides need the same secret. so... how do you get that key to the other person?" },
    { from: "friday", text: "uh. text it to them?" },
    { from: "ramesh", text: "across the same internet you're trying to protect?" },
    { from: "friday", image: surprisedPikachuMeme, caption: "friday inventing the key exchange problem by accident" },
  ],
  [
    { from: "ramesh", text: "this challenge is so important it has a name: the {red:key exchange problem}." },
    { from: "ramesh", text: "if we simply send the key across the open network, anyone intercepting can grab a copy. once they have the key, our encryption is useless." },
    { from: "system", text: "trying to mail the key through the danger zone.", visual: "key-exchange-problem" },
  ],
  [
    { from: "friday", text: "wait. what if i encrypt the key before i send it?" },
    { from: "ramesh", text: "with what?" },
    { from: "friday", text: "with... another key?" },
    { from: "ramesh", text: "and how do you share *that* key?" },
    { from: "friday", text: "..." },
    { from: "friday", image: dogChasingTailMeme, caption: "encrypting the key with another key with another key" },
  ],
  [
    { from: "ramesh", text: "it's a loop. for a long time this was a fundamental limitation. two parties who never met, with only an insecure channel between them, had no safe way to agree on a shared secret." },
    { from: "friday", text: "so symmetric is fast and perfect... after the hard part is already solved." },
    { from: "ramesh", text: "exactly. something was needed to break the deadlock. that's what the second family was designed to solve." },
    { from: "friday", image: hideThePainMeme, caption: "cryptographers before public-key crypto existed" },
    { from: "system", text: "chapter 4 complete. next: asymmetric encryption & https." },
  ],
];

const quiz: QuizQuestion[] = [
  {
    question: "in symmetric encryption, how many secret keys are shared between sender and receiver?",
    options: ["zero", "the same one key on both sides", "two unrelated keys", "twenty five"],
    answer: 1,
    explanation: "one shared secret encrypts and decrypts.",
  },
  {
    question: "what is the big advantage of symmetric encryption?",
    options: ["it needs no keys", "it is very fast and efficient for large data", "it posts keys publicly", "it only works offline"],
    answer: 1,
    explanation: "speed makes it ideal for bulk data.",
  },
  {
    question: "which algorithm is a famous modern symmetric cipher?",
    options: ["Caesar-only", "AES", "HTTP", "SMTP"],
    answer: 1,
    explanation: "AES protects huge amounts of real traffic and stored data.",
  },
  {
    question: "what is the key exchange problem?",
    options: [
      "wifi passwords are too long",
      "how to get the same secret to both sides safely over an untrusted network",
      "how to delete ciphertext",
      "how to invent new alphabets",
    ],
    answer: 1,
    explanation: "sharing the symmetric key without exposing it is the hard part.",
  },
  {
    question: "what happens if you send the symmetric key in plaintext across the internet?",
    options: [
      "nothing, keys are magic",
      "an interceptor can copy it and unlock all the ciphertext",
      "the key destroys itself",
      "https becomes faster",
    ],
    answer: 1,
    explanation: "steal the key, steal the meaning.",
  },
  {
    question: "why can't you just 'encrypt the key with another key' forever?",
    options: [
      "you can, forever, no problem",
      "you still need a safe way to share that next key: a loop",
      "computers refuse nested keys",
      "aes forbids it",
    ],
    answer: 1,
    explanation: "each encrypted key needs its own prior secret. the deadlock remains.",
  },
  {
    question: "symmetric encryption is used a lot because...",
    options: [
      "it solves key exchange alone",
      "once keys exist, it protects big traffic quickly",
      "it never needs a key",
      "browsers forbid anything else",
    ],
    answer: 1,
    explanation: "it does the heavy lifting after a shared key exists.",
  },
  {
    question: "who must possess the symmetric key?",
    options: ["only the sender", "only the receiver", "both sender and receiver", "only the isp"],
    answer: 2,
    explanation: "both sides need the same secret.",
  },
  {
    question: "before public-key ideas, two strangers with only an open channel...",
    options: [
      "could easily invent a shared aes key safely",
      "had no safe way to agree on a shared secret",
      "used carrier pigeons exclusively",
      "disabled the internet",
    ],
    answer: 1,
    explanation: "that limitation is why asymmetric crypto mattered so much.",
  },
  {
    question: "symmetric encryption's serious problem is...",
    options: ["it is too slow", "both sides need the same secret delivered safely first", "it cannot encrypt text", "it only works on paper"],
    answer: 1,
    explanation: "the key exchange problem.",
  },
];

const notes = `# chapter 04 · symmetric encryption & the key exchange problem

> offtrck · encryption module · study notes

## symmetric encryption
- **same key** encrypts and decrypts
- sender and receiver must both hold that secret
- modern workhorse: **AES** (also ChaCha20 in many mobile/web stacks)

### strengths
- extremely fast
- great for large data (files, media, full https record payloads, disk encryption)

### weakness
- key distribution: both sides need the same secret *before* useful encrypted chat can happen

## the key exchange problem
if the only path between two people is an untrusted network:
- sending the key in the clear lets attackers copy it
- encrypting the key requires another key → infinite regress

historical wall: strangers with only an insecure channel had no safe way to agree on a shared secret.

## remember
symmetric = fast shared-secret crypto.
getting the shared secret there safely is a separate boss fight.
`;

export const encryptionChapterFour: Chapter = {
  title: "chapter 04",
  subtitle: "the key exchange problem",
  scenes,
  quiz,
  notes,
};
