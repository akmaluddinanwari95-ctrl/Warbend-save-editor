import { Writer, features } from "./binary.ts";

export type SampleOptions = {
  version?: number;
  pad?: boolean;
};

/** Synthetic Warband save used to exercise the editor without a real sg00.sav. */
export function buildSampleSave(options: SampleOptions = {}): Uint8Array {
  const version = options.version ?? 1174;
  const pad = options.pad ?? version > 1143;
  const feat = features(version, pad);
  const w = new Writer();
  w.u8(0x57);
  w.u8(0x52);
  w.u8(0x44);
  w.u8(0x52);
  w.u32(version);
  w.u32(171);
  w.str("Calradia — slot 1");
  w.str("Alaric");
  w.i32(15);
  w.f32(214.5);
  w.i64(1_200_000);
  w.u32(42);
  w.u32(0);
  if (feat.difficulty) {
    w.i32(0);
    w.i32(0);
    w.i32(0);
    w.i32(0);
    w.i32(0);
  }
  w.i64(0);
  w.u32(14);
  w.u32(12);
  w.u32(2);
  w.u32(3);
  w.u32(1257);
  w.i32(0);
  w.f32(0.2);
  w.f32(0.1);
  w.f32(0);
  w.f32(0);
  w.strEmpty();
  w.u8(0);
  w.u32(0);
  w.u32(50);
  for (let i = 0; i < 6; i++) w.i32(i === 0 ? -1 : 0);
  w.i32(0);
  w.i32(100);
  w.str("Sample log");
  for (let i = 0; i < 6; i++) w.i32(0);
  w.i64(0);
  w.f32(0);
  w.i32(0);
  w.i32(0);
  w.i32(0);
  if (feat.classes) {
    for (let i = 0; i < 9; i++) w.strEmpty();
  }
  w.i32(2);
  w.i64(0);
  w.i64(0);
  w.i32(0);
  w.i32(0);
  w.i32(1);
  w.i32(0);
  w.i32(-1);
  w.i32(0);
  w.f32(10);
  w.str("A sample quest");
  w.strEmpty();
  w.strEmpty();
  for (let i = 0; i < feat.noteCount; i++) w.note(version);
  w.i32(0);
  if (feat.infoPages) w.i32(0);
  w.i32(1);
  w.i32(0);
  const factionNames = ["Player Faction", "Kingdom of Swadia", "Kingdom of Vaegirs", "Kingdom of Nords"];
  const relations = [
    [0, 25, -10, 40],
    [25, 100, -40, -20],
    [-10, -40, 100, 5],
    [40, -20, 5, 100],
  ];
  w.i32(factionNames.length);
  factionNames.forEach((name, index) => {
    w.i32(0);
    for (const value of relations[index] ?? []) w.f32(value);
    w.str(name);
    w.u8(0);
    w.u32(index === 0 ? 0x33445566 : 0xff204060 + index * 40);
    w.i32(0);
    for (let n = 0; n < feat.noteCount; n++) w.note(version);
  });
  w.i32(0);
  w.i32(1);
  w.i32(1);
  w.i32(0);
  w.i32(0);
  w.i32(0);
  w.i32(1);
  w.i32(3);
  w.i32(1);
  w.i32(0);
  w.i32(0);
  writeParty(w, version, pad, "p_main_party", "Alaric's party", [
    { troop: 0, count: 1, wounded: 0, flags: 0 },
    { troop: 5, count: 40, wounded: 6, flags: 0 },
    { troop: 6, count: 18, wounded: 0, flags: 1 },
  ]);
  w.zeros(48);
  w.i32(12);
  writeHero(w, version, {
    slots: slotMap([
      [2, 0],
      [22, 0],
    ]),
    attrs: [18, 14, 12, 10],
    profs: [160, 90, 70, 180, 40, 55, 0],
    skills: { 1: 6, 35: 8, 24: 4 },
    level: 15,
    gold: 123_456,
    xp: 80_000,
    health: 58,
    faction: 0,
    renamed: "",
  });
  writeHero(w, version, {
    slots: slotMap([
      [2, 2],
      [22, 40],
    ]),
    attrs: [20, 15, 12, 14],
    profs: [220, 180, 160, 40, 20, 30, 0],
    skills: { 1: 7, 35: 6 },
    level: 28,
    gold: 4_200,
    xp: 200_000,
    health: 64,
    faction: 1,
    renamed: "Count Klargus",
  });
  for (let i = 2; i < 12; i++) {
    writeRegular(w, version, 6 + (i % 3), 4);
  }
  for (let i = 0; i < 42; i++) w.i32(0);
  w.i32(2);
  w.i32(0);
  w.i32(0);
  w.i64(0);
  w.i64(0);
  w.i32(3);
  w.i32(1);
  w.i32(4);
  w.i32(2);
  return w.toUint8();
}

function slotMap(pairs: [number, number][]): number[] {
  const slots = Array.from({ length: 64 }, () => 0);
  for (const [index, value] of pairs) slots[index] = value;
  return slots;
}

function writeSkills(w: Writer, values: Record<number, number>) {
  const words = [0, 0, 0, 0, 0, 0];
  for (const [key, value] of Object.entries(values)) {
    const index = Number(key);
    const word = Math.floor(index / 8);
    const shift = (index % 8) * 4;
    words[word] = (words[word] ?? 0) | ((value & 0xf) << shift);
  }
  for (const word of words) w.u32(word ?? 0);
}

function writeHero(
  w: Writer,
  version: number,
  hero: {
    slots: number[];
    attrs: number[];
    profs: number[];
    skills: Record<number, number>;
    level: number;
    gold: number;
    xp: number;
    health: number;
    faction: number;
    renamed: string;
  },
) {
  w.i32(hero.slots.length);
  for (const slot of hero.slots) w.i64(slot);
  for (const attr of hero.attrs) w.i32(attr);
  for (const prof of hero.profs) w.f32(prof);
  writeSkills(w, hero.skills);
  for (let i = 0; i < 16; i++) w.note(version);
  w.i64(0x10);
  w.i32(-1);
  w.i32(20);
  w.i32(10);
  w.i32(30);
  w.i32(hero.level);
  w.u32(hero.gold);
  w.i32(hero.xp);
  w.f32(hero.health);
  w.i32(hero.faction);
  for (let i = 0; i < 106; i++) {
    w.i32(-1);
    w.i32(0);
  }
  w.zeros(32);
  w.u8(hero.renamed ? 1 : 0);
  if (hero.renamed) {
    w.str(hero.renamed);
    w.str(hero.renamed);
  }
  w.i32(0);
}

function writeRegular(w: Writer, version: number, attr: number, level: number) {
  w.i32(32);
  for (let i = 0; i < 32; i++) w.i64(0);
  w.i32(attr);
  w.i32(attr - 1);
  w.i32(4);
  w.i32(4);
  for (let i = 0; i < 7; i++) w.f32(20 + i);
  writeSkills(w, {});
  for (let i = 0; i < 16; i++) w.note(version);
  w.i64(0);
  w.i32(-1);
  w.i32(0);
  w.i32(0);
  w.i32(0);
  w.i32(level);
  w.i32(0);
}

function writeParty(
  w: Writer,
  version: number,
  pad: boolean,
  id: string,
  name: string,
  stacks: { troop: number; count: number; wounded: number; flags: number }[],
) {
  const feat = features(version, pad);
  w.str(id);
  w.str(name);
  w.i64(0);
  for (let i = 0; i < 8; i++) w.i32(0);
  for (let i = 0; i < 7; i++) w.f32(i < 2 ? 10 : 0);
  w.i32(stacks.length);
  for (const stack of stacks) {
    w.i32(stack.troop);
    w.i32(stack.count);
    w.i32(stack.wounded);
    w.i32(stack.flags);
  }
  w.f32(1);
  w.u8(0);
  w.strEmpty();
  for (let i = 0; i < 6; i++) w.f32(0);
  w.i32(1);
  w.f32(0);
  if (feat.marshall) w.i32(-1);
  w.i64(0);
  w.i32(0);
  if (feat.extraIcon) {
    w.i32(0);
    w.f32(0);
    w.f32(0);
    w.f32(0);
    w.f32(0);
  }
  if (feat.pad) w.i32(0);
  if (feat.attached) w.i32(-1);
  w.u8(0);
  w.i32(0);
  w.i32(0);
  for (let i = 0; i < feat.noteCount; i++) w.note(version);
  w.i32(0);
}
