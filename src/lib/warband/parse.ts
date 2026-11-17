import {
  ATTRS,
  OCCUPATION,
  OCCUPATION_SLOT,
  RELATION_SLOT,
  Reader,
  TF_HERO,
  expectRange,
  features,
  type SaveFeatures,
} from "./binary.ts";

export type StackRef = {
  troopId: number;
  countOff: number;
  woundedOff: number;
  flags: number;
};

export type PartyRef = {
  index: number;
  rawId: number;
  idNum: number;
  id: string;
  name: string;
  stacks: StackRef[];
};

export type FactionRef = {
  name: string;
  color: number;
  relationOff: number;
  count: number;
};

export type TroopRef = {
  index: number;
  hero: boolean;
  label: string;
  factionId: number;
  level: number;
  levelOff: number;
  numSlots: number;
  slotsOff: number;
  attrOff: number;
  profOff: number;
  skillOff: number;
  skillPointsOff: number;
  attrPointsOff: number;
  profPointsOff: number;
  goldOff: number;
  xpOff: number;
  healthOff: number;
  occupation: number | null;
};

export type ParsedSave = {
  buffer: Uint8Array;
  version: number;
  moduleVersion: number;
  pad: boolean;
  regularExtended: boolean;
  saveName: string;
  playerName: string;
  headerLevelOff: number;
  date: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
  factions: FactionRef[];
  mainParty: PartyRef;
  partiesFound: number;
  troops: TroopRef[];
  player: TroopRef;
  trailing: number;
};

function readNote(r: Reader, version: number): string {
  const text = r.str();
  r.skip(4);
  r.i32();
  if (version > 1011) r.u8b();
  return text;
}

function readSlots(r: Reader) {
  const num = r.i32();
  expectRange("jumlah slot", num, 0, 200_000);
  const off = r.o;
  r.skip(num * 8);
  return { num, off };
}

function readQuest(r: Reader, version: number, notes: number) {
  r.i32();
  r.i32();
  r.i32();
  r.f32();
  r.str();
  r.str();
  r.str();
  for (let i = 0; i < notes; i++) readNote(r, version);
  readSlots(r);
}

function readFaction(r: Reader, version: number, numFactions: number, notes: number): FactionRef {
  readSlots(r);
  const relationOff = r.o;
  r.skip(numFactions * 4);
  const name = r.str();
  r.u8b();
  const color = r.u32();
  r.i32();
  for (let i = 0; i < notes; i++) readNote(r, version);
  return { name: name || `Faksi ${numFactions}`, color, relationOff, count: numFactions };
}

function readParty(r: Reader, version: number, feat: SaveFeatures) {
  const id = r.str();
  const name = r.str();
  r.u64();
  r.skip(4 * 8);
  r.skip(4 * 7);
  const numStacks = r.i32();
  expectRange("jumlah stack", numStacks, 0, 5_000);
  const stacks: StackRef[] = [];
  for (let i = 0; i < numStacks; i++) {
    const troopId = r.i32();
    const countOff = r.o;
    r.i32();
    const woundedOff = r.o;
    r.i32();
    const flags = r.i32();
    stacks.push({ troopId, countOff, woundedOff, flags });
  }
  r.f32();
  r.u8b();
  r.str();
  r.skip(4 * 6);
  r.i32();
  r.f32();
  if (feat.marshall) r.i32();
  r.u64();
  r.i32();
  if (feat.extraIcon) {
    r.i32();
    r.skip(16);
  }
  if (feat.pad) r.i32();
  if (feat.attached) r.i32();
  r.u8b();
  const attached = r.i32();
  expectRange("party menempel", attached, 0, 20_000);
  r.skip(attached * 4);
  const particles = r.i32();
  expectRange("partikel", particles, 0, 20_000);
  r.skip(particles * 4);
  for (let i = 0; i < feat.noteCount; i++) readNote(r, version);
  readSlots(r);
  return { id, name, stacks };
}

type Prelude = {
  version: number;
  moduleVersion: number;
  saveName: string;
  playerName: string;
  headerLevelOff: number;
  date: number;
  hour: number;
  day: number;
  week: number;
  month: number;
  year: number;
  factions: FactionRef[];
  parties: PartyRef[];
  partyEnd: number;
};

function readPrelude(u8: Uint8Array, pad: boolean): Prelude {
  if (u8.length < 64 || u8[0] !== 0x57 || u8[1] !== 0x52 || u8[2] !== 0x44 || u8[3] !== 0x52) {
    throw new Error("Bukan file save Warband. Magic WRDR tidak ditemukan.");
  }
  const r = new Reader(u8);
  r.o = 4;
  const version = r.u32();
  const moduleVersion = r.u32();
  if (version <= 1011 || version > 2500) {
    throw new Error(
      `Versi save ${version} tidak didukung. Editor ini untuk Mount & Blade: Warband, bukan game asli 1.011 dan bukan Bannerlord.`,
    );
  }
  const feat = features(version, pad);
  const saveName = r.str();
  const playerName = r.str();
  const headerLevelOff = r.o;
  r.i32();
  const date = r.f32();
  r.u64();
  r.u32();
  r.u32();
  if (feat.difficulty) r.skip(20);
  r.u64();
  const hour = r.u32();
  const day = r.u32();
  const week = r.u32();
  const month = r.u32();
  const year = r.u32();
  r.i32();
  r.skip(16);
  r.str();
  r.u8b();
  r.skip(8);
  r.skip(4 * 6);
  r.i32();
  r.i32();
  r.str();
  r.skip(4 * 6);
  r.u64();
  r.f32();
  r.i32();
  r.i32();
  r.i32();
  if (feat.classes) {
    for (let i = 0; i < 9; i++) r.str();
  }
  const globals = r.i32();
  expectRange("variabel global", globals, 0, 2_000_000);
  r.skip(globals * 8);
  const triggers = r.i32();
  expectRange("trigger", triggers, 0, 200_000);
  r.skip(triggers * 28);
  const simple = r.i32();
  expectRange("simple trigger", simple, 0, 200_000);
  r.skip(simple * 8);
  const quests = r.i32();
  expectRange("quest", quests, 0, 20_000);
  for (let i = 0; i < quests; i++) readQuest(r, version, feat.noteCount);
  if (feat.infoPages) {
    const pages = r.i32();
    expectRange("info page", pages, 0, 20_000);
    for (let i = 0; i < pages; i++) {
      for (let k = 0; k < 16; k++) readNote(r, version);
    }
  }
  const sites = r.i32();
  expectRange("site", sites, 0, 100_000);
  for (let i = 0; i < sites; i++) readSlots(r);
  const numFactions = r.i32();
  expectRange("faksi", numFactions, 1, 4_000);
  const factions: FactionRef[] = [];
  for (let i = 0; i < numFactions; i++) {
    const fac = readFaction(r, version, numFactions, feat.noteCount);
    if (!fac.name || fac.name.startsWith("Faksi ")) fac.name = fac.name || `Faksi ${i}`;
    factions.push({ ...fac, name: fac.name || `Faksi ${i}` });
  }
  const tracks = r.i32();
  expectRange("jejak peta", tracks, 0, 2_000_000);
  r.skip(tracks * 24);
  const templates = r.i32();
  expectRange("template party", templates, 0, 100_000);
  for (let i = 0; i < templates; i++) {
    r.skip(12);
    readSlots(r);
  }
  const numRecords = r.i32();
  r.i32();
  expectRange("party", numRecords, 0, 200_000);
  const parties: PartyRef[] = [];
  for (let i = 0; i < numRecords; i++) {
    const valid = r.i32();
    if (!valid) continue;
    const rawId = r.i32();
    const idNum = r.i32();
    const party = readParty(r, version, feat);
    parties.push({ index: i, rawId, idNum, ...party });
  }
  if (parties.length === 0) throw new Error("Tidak ada party di dalam save.");
  return {
    version,
    moduleVersion,
    saveName,
    playerName,
    headerLevelOff,
    date,
    hour,
    day,
    week,
    month,
    year,
    factions,
    parties,
    partyEnd: r.o,
  };
}

function isPow2(n: number) {
  return n > 0 && (n & (n - 1)) === 0;
}

function plausibleTroopStart(r: Reader, off: number): boolean {
  if (off < 0 || off + 48 > r.len) return false;
  let numTroops: number;
  let slots: number;
  try {
    numTroops = r.i32at(off);
    slots = r.i32at(off + 4);
  } catch {
    return false;
  }
  if (numTroops < 5 || numTroops > 20_000) return false;
  if (!isPow2(slots) || slots < 16 || slots > 8192) return false;
  const attr = off + 8 + slots * 8;
  if (attr + 44 > r.len) return false;
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const a = r.i32at(attr + i * 4);
    if (a < 0 || a > 500) return false;
    sum += a;
  }
  if (sum < 3 || sum > 900) return false;
  for (let i = 0; i < 7; i++) {
    const p = r.f32at(attr + 16 + i * 4);
    if (!Number.isFinite(p) || p < 0 || p > 2500) return false;
  }
  return true;
}

function readTroop(r: Reader, version: number, index: number, regularExtended: boolean): TroopRef {
  const numSlots = r.i32();
  expectRange("slot troop", numSlots, 0, 100_000);
  if (numSlots !== 0 && !isPow2(numSlots)) throw new Error("slot troop bukan pangkat dua");
  const slotsOff = r.o;
  r.skip(numSlots * 8);
  const attrOff = r.o;
  const a0 = r.i32();
  const a1 = r.i32();
  const a2 = r.i32();
  const a3 = r.i32();
  if (index === 0 && (a0 < 0 || a1 < 0 || a2 < 0 || a3 < 0)) {
    throw new Error("atribut pemain tidak masuk akal");
  }
  const profOff = r.o;
  for (let i = 0; i < 7; i++) {
    const p = r.f32();
    if (!Number.isFinite(p) || p < -1 || p > 5000) throw new Error("proficiency tidak masuk akal");
  }
  const skillOff = r.o;
  r.skip(24);
  let note0 = "";
  if (version > 1011) {
    for (let i = 0; i < 16; i++) {
      const text = readNote(r, version);
      if (i === 0) note0 = text;
    }
  }
  const flags = r.u64();
  const hero = (flags & TF_HERO) !== 0n;
  r.i32();
  const skillPointsOff = r.o;
  r.i32();
  const attrPointsOff = r.o;
  r.i32();
  const profPointsOff = r.o;
  r.i32();
  let levelOff = -1;
  let level = 0;
  if (version > 1011) {
    levelOff = r.o;
    level = r.i32();
    if (level < -1 || level > 200) throw new Error("level tidak masuk akal");
  }
  let goldOff = -1;
  let xpOff = -1;
  let healthOff = -1;
  let factionId = -1;
  let renamed = "";
  if (hero || regularExtended) {
    goldOff = r.o;
    r.u32();
    xpOff = r.o;
    r.i32();
    healthOff = r.o;
    const health = r.f32();
    if (!Number.isFinite(health) || health < -10 || health > 100_000) {
      throw new Error("health tidak masuk akal");
    }
    factionId = r.i32();
    if (factionId < -5 || factionId > 10_000) throw new Error("faksi troop tidak masuk akal");
    r.skip(96 * 8);
    r.skip(10 * 8);
    r.skip(32);
    if (version > 1011) {
      const wasRenamed = r.u8b();
      if (wasRenamed) {
        renamed = r.str();
        r.str();
      }
    }
  }
  if (version > 1011) r.i32();
  let occupation: number | null = null;
  if (numSlots > OCCUPATION_SLOT) {
    occupation = Number(r.dv.getBigInt64(slotsOff + OCCUPATION_SLOT * 8, true));
    if (!Number.isFinite(occupation) || Math.abs(occupation) > 1_000_000) occupation = null;
  }
  const cleanNote = note0.replace(/\s+/g, " ").trim();
  const label =
    renamed.trim() ||
    (cleanNote.length > 0 && cleanNote.length <= 48 ? cleanNote : "") ||
    (hero ? `Hero #${index}` : `Pasukan #${index}`);
  return {
    index,
    hero,
    label,
    factionId,
    level,
    levelOff,
    numSlots,
    slotsOff,
    attrOff,
    profOff,
    skillOff,
    skillPointsOff,
    attrPointsOff,
    profPointsOff,
    goldOff,
    xpOff,
    healthOff,
    occupation,
  };
}

function readTail(r: Reader) {
  r.skip(42 * 4);
  const items = r.i32();
  expectRange("jenis item", items, 0, 100_000);
  for (let i = 0; i < items; i++) {
    const slots = r.i32();
    expectRange("slot item", slots, 0, 100_000);
    r.skip(slots * 8);
  }
  r.skip(16);
  r.skip(16);
}

function tryTroops(
  u8: Uint8Array,
  offset: number,
  version: number,
  regularExtended: boolean,
): { troops: TroopRef[]; end: number } {
  const r = new Reader(u8);
  r.o = offset;
  const num = r.i32();
  expectRange("jumlah troop", num, 1, 20_000);
  const troops: TroopRef[] = [];
  for (let i = 0; i < num; i++) troops.push(readTroop(r, version, i, regularExtended));
  if (!troops.some((t) => t.hero)) throw new Error("tidak ada hero");
  readTail(r);
  return { troops, end: r.o };
}

function pickMain(parties: PartyRef[]): PartyRef {
  const named = parties.find(
    (p) => /main_party/i.test(p.id) || /main_party/i.test(p.name) || /^player$/i.test(p.id),
  );
  return named ?? parties.find((p) => p.index === 0) ?? parties[0]!;
}

function parseWithPad(u8: Uint8Array, pad: boolean): ParsedSave {
  const pre = readPrelude(u8, pad);
  const r = new Reader(u8);
  const scanEnd = u8.length;
  let attempts = 0;
  for (let off = pre.partyEnd; off < scanEnd - 64; off++) {
    if (!plausibleTroopStart(r, off)) continue;
    attempts++;
    if (attempts > 48) break;
    for (const regularExtended of [false, true]) {
      try {
        const { troops, end } = tryTroops(u8, off, pre.version, regularExtended);
        const trailing = u8.length - end;
        if (trailing < 0 || trailing > 32) continue;
        const player = troops[0]?.hero ? troops[0] : troops.find((t) => t.hero);
        if (!player || player.goldOff < 0) continue;
        return {
          buffer: u8,
          version: pre.version,
          moduleVersion: pre.moduleVersion,
          pad,
          regularExtended,
          saveName: pre.saveName,
          playerName: pre.playerName,
          headerLevelOff: pre.headerLevelOff,
          date: pre.date,
          hour: pre.hour,
          day: pre.day,
          week: pre.week,
          month: pre.month,
          year: pre.year,
          factions: pre.factions,
          mainParty: pickMain(pre.parties),
          partiesFound: pre.parties.length,
          troops,
          player,
          trailing,
        };
      } catch {
        /* candidate rejected */
      }
    }
  }
  throw new Error(
    `Header terbaca (${pre.playerName || "tanpa nama"}, versi ${pre.version}) tetapi blok karakter tidak cocok. File ini mungkin rusak, terkompresi, atau bukan save Warband.`,
  );
}

export function parseSave(buffer: Uint8Array): ParsedSave {
  const u8 = buffer.byteOffset === 0 && buffer.byteLength === buffer.buffer.byteLength
    ? buffer
    : new Uint8Array(buffer);
  if (u8.length < 64 || u8[0] !== 0x57 || u8[1] !== 0x52 || u8[2] !== 0x44 || u8[3] !== 0x52) {
    throw new Error("Bukan file save Warband. Pilih file sg00.sav (atau sg01, sg02, …).");
  }
  const version = new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint32(4, true);
  const order = version > 1143 ? [true, false] : [false, true];
  let last = "Save tidak dikenali.";
  for (const pad of order) {
    try {
      return parseWithPad(u8, pad);
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(last);
}

export function factionCss(color: number): string {
  const r = (color >>> 16) & 255;
  const g = (color >>> 8) & 255;
  const b = color & 255;
  if (r + g + b < 24) return "var(--color-muted)";
  return `rgb(${r} ${g} ${b})`;
}

export function attrName(index: number): string {
  return ATTRS[index]?.name ?? `Atribut ${index}`;
}

export { OCCUPATION, RELATION_SLOT };
