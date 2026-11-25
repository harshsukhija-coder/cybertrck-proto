/**
 * Reads Cisco Packet Tracer .pkt / .pka files in the browser.
 *
 * File layout (documented by the open-source pka2xml project):
 *   1. bytes are reversed and XOR-ed with (length - i * length)
 *   2. Twofish-128 in EAX mode, key = 0x89 × 16, nonce = 0x10 × 16, tag = last 16 bytes
 *   3. XOR with (length - i)
 *   4. 4-byte big-endian size + zlib stream → XML
 */

// ---------- Twofish (encryption only, 128-bit key) ----------

const Q_TABLES = [
  [
    [8, 1, 7, 13, 6, 15, 3, 2, 0, 11, 5, 9, 14, 12, 10, 4],
    [14, 12, 11, 8, 1, 2, 3, 5, 15, 4, 10, 6, 7, 0, 9, 13],
    [11, 10, 5, 14, 6, 13, 9, 0, 12, 8, 15, 3, 2, 4, 7, 1],
    [13, 7, 15, 4, 1, 2, 6, 14, 9, 11, 3, 0, 8, 5, 12, 10],
  ],
  [
    [2, 8, 11, 13, 15, 7, 6, 14, 3, 1, 9, 4, 0, 10, 12, 5],
    [1, 14, 2, 11, 4, 12, 3, 7, 6, 13, 10, 5, 15, 9, 0, 8],
    [4, 12, 7, 5, 1, 6, 9, 10, 0, 14, 13, 8, 2, 11, 3, 15],
    [11, 9, 5, 1, 12, 3, 13, 14, 6, 4, 7, 15, 2, 0, 8, 10],
  ],
];

const ror4 = (x: number) => ((x >> 1) | (x << 3)) & 15;

const buildQ = ([t0, t1, t2, t3]: number[][]) =>
  Array.from({ length: 256 }, (_, x) => {
    let a = x >> 4;
    let b = x & 15;
    const a1 = a ^ b;
    const b1 = (a ^ ror4(b) ^ (8 * a)) & 15;
    a = t0[a1];
    b = t1[b1];
    const a3 = a ^ b;
    const b3 = (a ^ ror4(b) ^ (8 * a)) & 15;
    return (t3[b3] << 4) | t2[a3];
  });

const Q0 = buildQ(Q_TABLES[0]);
const Q1 = buildQ(Q_TABLES[1]);

const gfMul = (a: number, b: number, poly: number) => {
  let result = 0;
  while (b) {
    if (b & 1) result ^= a;
    a <<= 1;
    if (a & 0x100) a ^= poly;
    b >>= 1;
  }
  return result;
};

const MDS = [
  [0x01, 0xef, 0x5b, 0x5b],
  [0x5b, 0xef, 0xef, 0x01],
  [0xef, 0x5b, 0x01, 0xef],
  [0xef, 0x01, 0xef, 0x5b],
];

const RS = [
  [0x01, 0xa4, 0x55, 0x87, 0x5a, 0x58, 0xdb, 0x9e],
  [0xa4, 0x56, 0x82, 0xf3, 0x1e, 0xc6, 0x68, 0xe5],
  [0x02, 0xa1, 0xfc, 0xc1, 0x47, 0xae, 0x3d, 0x19],
  [0xa4, 0x55, 0x87, 0x5a, 0x58, 0xdb, 0x9e, 0x03],
];

/** MDS column for one input byte position, packed as a little-endian word */
const mdsColumn = (col: number, y: number) =>
  (gfMul(MDS[0][col], y, 0x169) |
    (gfMul(MDS[1][col], y, 0x169) << 8) |
    (gfMul(MDS[2][col], y, 0x169) << 16) |
    (gfMul(MDS[3][col], y, 0x169) << 24)) >>>
  0;

const byteOf = (word: number, i: number) => (word >>> (8 * i)) & 0xff;

/** h() for a 128-bit key: list = [L0, L1] */
const hByte = (i: number, x: number, l0: number, l1: number) => {
  switch (i) {
    case 0:
      return Q1[Q0[Q0[x] ^ byteOf(l1, 0)] ^ byteOf(l0, 0)];
    case 1:
      return Q0[Q0[Q1[x] ^ byteOf(l1, 1)] ^ byteOf(l0, 1)];
    case 2:
      return Q1[Q1[Q0[x] ^ byteOf(l1, 2)] ^ byteOf(l0, 2)];
    default:
      return Q0[Q1[Q1[x] ^ byteOf(l1, 3)] ^ byteOf(l0, 3)];
  }
};

const h = (x: number, l0: number, l1: number) =>
  (mdsColumn(0, hByte(0, byteOf(x, 0), l0, l1)) ^
    mdsColumn(1, hByte(1, byteOf(x, 1), l0, l1)) ^
    mdsColumn(2, hByte(2, byteOf(x, 2), l0, l1)) ^
    mdsColumn(3, hByte(3, byteOf(x, 3), l0, l1))) >>>
  0;

const rol = (x: number, n: number) => ((x << n) | (x >>> (32 - n))) >>> 0;
const ror = (x: number, n: number) => ((x >>> n) | (x << (32 - n))) >>> 0;
const readLE = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

type Cipher = (block: Uint8Array) => Uint8Array;

export const twofish128 = (key: Uint8Array): Cipher => {
  const m = [0, 1, 2, 3].map(i => readLE(key, 4 * i));
  const rsWord = (offset: number) => {
    let word = 0;
    for (let row = 0; row < 4; row++) {
      let v = 0;
      for (let j = 0; j < 8; j++) v ^= gfMul(RS[row][j], key[offset + j], 0x14d);
      word |= v << (8 * row);
    }
    return word >>> 0;
  };
  // S-box key words, used in reverse order
  const s0 = rsWord(8);
  const s1 = rsWord(0);

  const K: number[] = [];
  for (let i = 0; i < 20; i++) {
    const a = h(Math.imul(2 * i, 0x01010101) >>> 0, m[0], m[2]);
    const b = rol(h(Math.imul(2 * i + 1, 0x01010101) >>> 0, m[1], m[3]), 8);
    K.push((a + b) >>> 0, rol((a + 2 * b) >>> 0, 9));
  }

  const T = [0, 1, 2, 3].map(i => Uint32Array.from({ length: 256 }, (_, x) => mdsColumn(i, hByte(i, x, s0, s1))));
  const g = (x: number) => (T[0][x & 0xff] ^ T[1][(x >>> 8) & 0xff] ^ T[2][(x >>> 16) & 0xff] ^ T[3][x >>> 24]) >>> 0;

  return block => {
    let r0 = (readLE(block, 0) ^ K[0]) >>> 0;
    let r1 = (readLE(block, 4) ^ K[1]) >>> 0;
    let r2 = (readLE(block, 8) ^ K[2]) >>> 0;
    let r3 = (readLE(block, 12) ^ K[3]) >>> 0;
    for (let r = 0; r < 16; r++) {
      const f0 = g(r0);
      const f1 = g(rol(r1, 8));
      const n2 = ror((r2 ^ ((f0 + f1 + K[2 * r + 8]) >>> 0)) >>> 0, 1);
      const n3 = (rol(r3, 1) ^ ((f0 + 2 * f1 + K[2 * r + 9]) >>> 0)) >>> 0;
      r2 = r0;
      r3 = r1;
      r0 = n2;
      r1 = n3;
    }
    const out = new Uint8Array(16);
    [r2 ^ K[4], r3 ^ K[5], r0 ^ K[6], r1 ^ K[7]].forEach((w, i) => {
      for (let j = 0; j < 4; j++) out[4 * i + j] = (w >>> (8 * j)) & 0xff;
    });
    return out;
  };
};

// ---------- EAX mode (CMAC + CTR) ----------

const xorInto = (a: Uint8Array, b: Uint8Array) => {
  for (let i = 0; i < 16; i++) a[i] ^= b[i];
};

const double = (block: Uint8Array) => {
  const out = new Uint8Array(16);
  for (let i = 0; i < 16; i++) out[i] = ((block[i] << 1) | (i < 15 ? block[i + 1] >> 7 : 0)) & 0xff;
  if (block[0] & 0x80) out[15] ^= 0x87;
  return out;
};

const omac = (encrypt: Cipher, tweak: number, data: Uint8Array) => {
  const k1 = double(encrypt(new Uint8Array(16)));
  const k2 = double(k1);
  const message = new Uint8Array(16 + data.length);
  message[15] = tweak;
  message.set(data, 16);

  let x: Uint8Array = new Uint8Array(16);
  const blocks = Math.ceil(message.length / 16);
  for (let b = 0; b < blocks; b++) {
    const chunk = message.subarray(16 * b, 16 * b + 16);
    const block = new Uint8Array(16);
    block.set(chunk);
    if (b === blocks - 1) {
      if (chunk.length === 16) xorInto(block, k1);
      else {
        block[chunk.length] = 0x80;
        xorInto(block, k2);
      }
    }
    xorInto(block, x);
    x = encrypt(block);
  }
  return x;
};

const eaxDecrypt = (encrypt: Cipher, nonce: Uint8Array, input: Uint8Array) => {
  const cipherText = input.subarray(0, input.length - 16);
  const tag = input.subarray(input.length - 16);

  const n = omac(encrypt, 0, nonce);
  const expected = omac(encrypt, 1, new Uint8Array(0));
  xorInto(expected, n);
  xorInto(expected, omac(encrypt, 2, cipherText));
  if (!expected.every((v, i) => v === tag[i])) throw new Error("not a packet tracer file (checksum mismatch)");

  const out = new Uint8Array(cipherText.length);
  const counter = n.slice();
  for (let offset = 0; offset < cipherText.length; offset += 16) {
    const stream = encrypt(counter);
    const end = Math.min(16, cipherText.length - offset);
    for (let i = 0; i < end; i++) out[offset + i] = cipherText[offset + i] ^ stream[i];
    for (let i = 15; i >= 0; i--) {
      counter[i] = (counter[i] + 1) & 0xff;
      if (counter[i]) break;
    }
  }
  return out;
};

// ---------- Packet Tracer file ----------

const PT_KEY = new Uint8Array(16).fill(137);
const PT_NONCE = new Uint8Array(16).fill(16);

const inflate = async (data: Uint8Array) => {
  const stream = new Blob([data.slice()]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

/** Files saved by Packet Tracer before 7.0: XOR with (length - i), then zlib */
const decodeLegacy = async (file: Uint8Array) => {
  const data = file.slice();
  for (let i = 0; i < data.length; i++) data[i] ^= (data.length - i) & 0xff;
  return new TextDecoder().decode(await inflate(data.subarray(4)));
};

/** Turns the raw bytes of a .pkt/.pka file into its XML text */
export const decodePacketTracer = async (file: Uint8Array) => {
  try {
    return await decodeModern(file);
  } catch (modernError) {
    try {
      return await decodeLegacy(file);
    } catch {
      throw modernError;
    }
  }
};

const decodeModern = async (file: Uint8Array) => {
  const length = file.length;
  if (length < 64) throw new Error("file is too small to be a packet tracer file");

  const stage1 = new Uint8Array(length);
  for (let i = 0; i < length; i++) stage1[i] = file[length - 1 - i] ^ ((length - Math.imul(i, length)) & 0xff);

  const stage2 = eaxDecrypt(twofish128(PT_KEY), PT_NONCE, stage1);

  const size = stage2.length;
  for (let i = 0; i < size; i++) stage2[i] ^= (size - i) & 0xff;

  const xml = await inflate(stage2.subarray(4));
  return new TextDecoder().decode(xml);
};
