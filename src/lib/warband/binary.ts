/** Little-endian helpers for Mount & Blade: Warband sg*.sav files. */

export class Reader {
  readonly u8: Uint8Array;
  readonly dv: DataView;
  o = 0;

  constructor(u8: Uint8Array) {
    this.u8 = u8;
    this.dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  }

  get len() {
    return this.u8.length;
  }

  need(n: number) {
    if (n < 0 || this.o + n > this.len) {
      throw new Error(`File terpotong pada offset ${this.o}`);
    }
  }

  skip(n: number) {
    this.need(n);
    this.o += n;
  }

  u8b(): number {
    this.need(1);
    return this.u8[this.o++] ?? 0;
  }

  i32(): number {
    this.need(4);
    const v = this.dv.getInt32(this.o, true);
    this.o += 4;
    return v;
  }

  u32(): number {
    this.need(4);
    const v = this.dv.getUint32(this.o, true);
    this.o += 4;
    return v;
  }

  f32(): number {
    this.need(4);
    const v = this.dv.getFloat32(this.o, true);
    this.o += 4;
    return v;
  }

  u64(): bigint {
    this.need(8);
    const v = this.dv.getBigUint64(this.o, true);
    this.o += 8;
    return v;
  }

  i32at(off: number): number {
    if (off < 0 || off + 4 > this.len) throw new Error("di luar file");
    return this.dv.getInt32(off, true);
  }

  f32at(off: number): number {
    if (off < 0 || off + 4 > this.len) return Number.NaN;
    return this.dv.getFloat32(off, true);
  }

  /** Length-prefixed RGL string. Length includes the trailing NUL when present. */
  str(): string {
    const n = this.i32();
    if (n <= 0) return "";
    if (n > 8_000_000) throw new Error(`String tidak masuk akal (${n})`);
    this.need(n);
    const slice = this.u8.subarray(this.o, this.o + n);
    this.o += n;
    let end = slice.length;
    if (end > 0 && slice[end - 1] === 0) end--;
    return new TextDecoder().decode(slice.subarray(0, end));
  }
}

export class Writer {
  parts: Uint8Array[] = [];
  size = 0;

  push(a: Uint8Array) {
    this.parts.push(a);
    this.size += a.length;
  }

  u8(v: number) {
    const a = new Uint8Array(1);
    a[0] = v & 255;
    this.push(a);
  }

  i32(v: number) {
    const a = new Uint8Array(4);
    new DataView(a.buffer).setInt32(0, v | 0, true);
    this.push(a);
  }

  u32(v: number) {
    const a = new Uint8Array(4);
    new DataView(a.buffer).setUint32(0, v >>> 0, true);
    this.push(a);
  }

  f32(v: number) {
    const a = new Uint8Array(4);
    new DataView(a.buffer).setFloat32(0, v, true);
    this.push(a);
  }

  i64(v = 0) {
    const a = new Uint8Array(8);
    new DataView(a.buffer).setBigInt64(0, BigInt(Math.trunc(v)), true);
    this.push(a);
  }

  zeros(n: number) {
    this.push(new Uint8Array(n));
  }

  str(text: string) {
    const enc = new TextEncoder().encode(text);
    const a = new Uint8Array(enc.length + 1);
    a.set(enc, 0);
    this.i32(a.length);
    this.push(a);
  }

  strEmpty() {
    this.i32(0);
  }

  note(version: number) {
    this.strEmpty();
    this.i32(0);
    this.i32(-1);
    if (version > 1011) this.u8(0);
  }

  toUint8(): Uint8Array {
    const out = new Uint8Array(this.size);
    let o = 0;
    for (const p of this.parts) {
      out.set(p, o);
      o += p.length;
    }
    return out;
  }
}

export function viewOf(buf: Uint8Array): DataView {
  return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
}

export function readI32(buf: Uint8Array, off: number): number {
  return viewOf(buf).getInt32(off, true);
}

export function readU32(buf: Uint8Array, off: number): number {
  return viewOf(buf).getUint32(off, true);
}

export function readF32(buf: Uint8Array, off: number): number {
  return viewOf(buf).getFloat32(off, true);
}

export function readI64(buf: Uint8Array, off: number): number {
  return Number(viewOf(buf).getBigInt64(off, true));
}

export function writeI32(buf: Uint8Array, off: number, v: number) {
  viewOf(buf).setInt32(off, Math.trunc(v), true);
}

export function writeU32(buf: Uint8Array, off: number, v: number) {
  viewOf(buf).setUint32(off, Math.trunc(v) >>> 0, true);
}

export function writeF32(buf: Uint8Array, off: number, v: number) {
  viewOf(buf).setFloat32(off, v, true);
}

export function writeI64(buf: Uint8Array, off: number, v: number) {
  viewOf(buf).setBigInt64(off, BigInt(Math.trunc(v)), true);
}

export type SaveFeatures = {
  difficulty: boolean;
  classes: boolean;
  noteCount: number;
  infoPages: boolean;
  marshall: boolean;
  extraIcon: boolean;
  /** Extra undocumented int32 on parties after Warband 1.143. Tried both ways. */
  pad: boolean;
  attached: boolean;
};

export function features(version: number, pad: boolean): SaveFeatures {
  return {
    difficulty: version > 1136,
    classes: version > 1011,
    noteCount: version > 1011 ? 16 : 8,
    infoPages: version > 1011,
    marshall: (version >= 900 && version < 1000) || version >= 1020,
    extraIcon: version > 1136,
    pad: pad && version > 1143,
    attached: version > 1011,
  };
}

export function expectRange(name: string, n: number, lo: number, hi: number) {
  if (!Number.isInteger(n) || n < lo || n > hi) {
    throw new Error(`${name} di luar batas (${n})`);
  }
}

export const TF_HERO = 0x10n;
export const RELATION_SLOT = 22;
export const OCCUPATION_SLOT = 2;

export const ATTRS = [
  { key: "str", name: "Strength" },
  { key: "agi", name: "Agility" },
  { key: "int", name: "Intelligence" },
  { key: "cha", name: "Charisma" },
] as const;

export const PROFS = [
  "One-Handed",
  "Two-Handed",
  "Polearm",
  "Archery",
  "Crossbow",
  "Throwing",
  "Firearm",
] as const;

/** Native skill indices. Values are 4-bit nibbles inside 6 uint32 words. */
export const SKILLS: { id: number; name: string; group: string }[] = [
  { id: 0, name: "Trade", group: "Kepemimpinan" },
  { id: 1, name: "Leadership", group: "Kepemimpinan" },
  { id: 2, name: "Prisoner Management", group: "Kepemimpinan" },
  { id: 7, name: "Persuasion", group: "Kepemimpinan" },
  { id: 8, name: "Engineer", group: "Kecerdasan" },
  { id: 9, name: "First Aid", group: "Kecerdasan" },
  { id: 10, name: "Surgery", group: "Kecerdasan" },
  { id: 11, name: "Wound Treatment", group: "Kecerdasan" },
  { id: 12, name: "Inventory Management", group: "Kecerdasan" },
  { id: 13, name: "Spotting", group: "Kecerdasan" },
  { id: 14, name: "Path-finding", group: "Kecerdasan" },
  { id: 15, name: "Tactics", group: "Kecerdasan" },
  { id: 16, name: "Tracking", group: "Kecerdasan" },
  { id: 17, name: "Trainer", group: "Kecerdasan" },
  { id: 22, name: "Looting", group: "Agility" },
  { id: 23, name: "Horse Archery", group: "Agility" },
  { id: 24, name: "Riding", group: "Agility" },
  { id: 25, name: "Athletics", group: "Agility" },
  { id: 26, name: "Shield", group: "Agility" },
  { id: 27, name: "Weapon Master", group: "Agility" },
  { id: 33, name: "Power Draw", group: "Strength" },
  { id: 34, name: "Power Throw", group: "Strength" },
  { id: 35, name: "Power Strike", group: "Strength" },
  { id: 36, name: "Ironflesh", group: "Strength" },
];

export const OCCUPATION: Record<number, string> = {
  0: "Tidak aktif",
  2: "Lord",
  5: "Kompanion",
  6: "Bangsawan",
  7: "Seneschal",
  8: "Ksatria bandit",
  9: "Pretender",
  11: "Pensiun",
};

export function readSkills(buf: Uint8Array, off: number): number[] {
  const dv = viewOf(buf);
  const out: number[] = [];
  for (let i = 0; i < 48; i++) {
    const word = dv.getUint32(off + Math.floor(i / 8) * 4, true);
    const shift = (i % 8) * 4;
    out.push((word >>> shift) & 0xf);
  }
  return out;
}

export function writeSkill(buf: Uint8Array, off: number, index: number, value: number) {
  const dv = viewOf(buf);
  const wordOff = off + Math.floor(index / 8) * 4;
  const shift = (index % 8) * 4;
  const masked = (dv.getUint32(wordOff, true) & ~(0xf << shift)) | ((value & 0xf) << shift);
  dv.setUint32(wordOff, masked >>> 0, true);
}

export function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, Math.trunc(n)));
}
