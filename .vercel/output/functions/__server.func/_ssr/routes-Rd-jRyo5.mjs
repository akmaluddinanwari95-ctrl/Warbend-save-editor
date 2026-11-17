import { i as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as ScrollText, i as Shield, o as Download, r as Swords, s as Coins, t as Users } from "../_libs/lucide-react.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Rd-jRyo5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Little-endian helpers for Mount & Blade: Warband sg*.sav files. */
var Reader = class {
	u8;
	dv;
	o = 0;
	constructor(u8) {
		this.u8 = u8;
		this.dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
	}
	get len() {
		return this.u8.length;
	}
	need(n) {
		if (n < 0 || this.o + n > this.len) throw new Error(`File terpotong pada offset ${this.o}`);
	}
	skip(n) {
		this.need(n);
		this.o += n;
	}
	u8b() {
		this.need(1);
		return this.u8[this.o++] ?? 0;
	}
	i32() {
		this.need(4);
		const v = this.dv.getInt32(this.o, true);
		this.o += 4;
		return v;
	}
	u32() {
		this.need(4);
		const v = this.dv.getUint32(this.o, true);
		this.o += 4;
		return v;
	}
	f32() {
		this.need(4);
		const v = this.dv.getFloat32(this.o, true);
		this.o += 4;
		return v;
	}
	u64() {
		this.need(8);
		const v = this.dv.getBigUint64(this.o, true);
		this.o += 8;
		return v;
	}
	i32at(off) {
		if (off < 0 || off + 4 > this.len) throw new Error("di luar file");
		return this.dv.getInt32(off, true);
	}
	f32at(off) {
		if (off < 0 || off + 4 > this.len) return NaN;
		return this.dv.getFloat32(off, true);
	}
	/** Length-prefixed RGL string. Length includes the trailing NUL when present. */
	str() {
		const n = this.i32();
		if (n <= 0) return "";
		if (n > 8e6) throw new Error(`String tidak masuk akal (${n})`);
		this.need(n);
		const slice = this.u8.subarray(this.o, this.o + n);
		this.o += n;
		let end = slice.length;
		if (end > 0 && slice[end - 1] === 0) end--;
		return new TextDecoder().decode(slice.subarray(0, end));
	}
};
var Writer = class {
	parts = [];
	size = 0;
	push(a) {
		this.parts.push(a);
		this.size += a.length;
	}
	u8(v) {
		const a = /* @__PURE__ */ new Uint8Array(1);
		a[0] = v & 255;
		this.push(a);
	}
	i32(v) {
		const a = /* @__PURE__ */ new Uint8Array(4);
		new DataView(a.buffer).setInt32(0, v | 0, true);
		this.push(a);
	}
	u32(v) {
		const a = /* @__PURE__ */ new Uint8Array(4);
		new DataView(a.buffer).setUint32(0, v >>> 0, true);
		this.push(a);
	}
	f32(v) {
		const a = /* @__PURE__ */ new Uint8Array(4);
		new DataView(a.buffer).setFloat32(0, v, true);
		this.push(a);
	}
	i64(v = 0) {
		const a = /* @__PURE__ */ new Uint8Array(8);
		new DataView(a.buffer).setBigInt64(0, BigInt(Math.trunc(v)), true);
		this.push(a);
	}
	zeros(n) {
		this.push(new Uint8Array(n));
	}
	str(text) {
		const enc = new TextEncoder().encode(text);
		const a = new Uint8Array(enc.length + 1);
		a.set(enc, 0);
		this.i32(a.length);
		this.push(a);
	}
	strEmpty() {
		this.i32(0);
	}
	note(version) {
		this.strEmpty();
		this.i32(0);
		this.i32(-1);
		if (version > 1011) this.u8(0);
	}
	toUint8() {
		const out = new Uint8Array(this.size);
		let o = 0;
		for (const p of this.parts) {
			out.set(p, o);
			o += p.length;
		}
		return out;
	}
};
function viewOf(buf) {
	return new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
}
function readI32(buf, off) {
	return viewOf(buf).getInt32(off, true);
}
function readU32(buf, off) {
	return viewOf(buf).getUint32(off, true);
}
function readF32(buf, off) {
	return viewOf(buf).getFloat32(off, true);
}
function readI64(buf, off) {
	return Number(viewOf(buf).getBigInt64(off, true));
}
function writeI32(buf, off, v) {
	viewOf(buf).setInt32(off, Math.trunc(v), true);
}
function writeU32(buf, off, v) {
	viewOf(buf).setUint32(off, Math.trunc(v) >>> 0, true);
}
function writeF32(buf, off, v) {
	viewOf(buf).setFloat32(off, v, true);
}
function writeI64(buf, off, v) {
	viewOf(buf).setBigInt64(off, BigInt(Math.trunc(v)), true);
}
function features(version, pad) {
	return {
		difficulty: version > 1136,
		classes: version > 1011,
		noteCount: version > 1011 ? 16 : 8,
		infoPages: version > 1011,
		marshall: version >= 900 && version < 1e3 || version >= 1020,
		extraIcon: version > 1136,
		pad: pad && version > 1143,
		attached: version > 1011
	};
}
function expectRange(name, n, lo, hi) {
	if (!Number.isInteger(n) || n < lo || n > hi) throw new Error(`${name} di luar batas (${n})`);
}
var TF_HERO = 16n;
var ATTRS = [
	{
		key: "str",
		name: "Strength"
	},
	{
		key: "agi",
		name: "Agility"
	},
	{
		key: "int",
		name: "Intelligence"
	},
	{
		key: "cha",
		name: "Charisma"
	}
];
var PROFS = [
	"One-Handed",
	"Two-Handed",
	"Polearm",
	"Archery",
	"Crossbow",
	"Throwing",
	"Firearm"
];
/** Native skill indices. Values are 4-bit nibbles inside 6 uint32 words. */
var SKILLS = [
	{
		id: 0,
		name: "Trade",
		group: "Kepemimpinan"
	},
	{
		id: 1,
		name: "Leadership",
		group: "Kepemimpinan"
	},
	{
		id: 2,
		name: "Prisoner Management",
		group: "Kepemimpinan"
	},
	{
		id: 7,
		name: "Persuasion",
		group: "Kepemimpinan"
	},
	{
		id: 8,
		name: "Engineer",
		group: "Kecerdasan"
	},
	{
		id: 9,
		name: "First Aid",
		group: "Kecerdasan"
	},
	{
		id: 10,
		name: "Surgery",
		group: "Kecerdasan"
	},
	{
		id: 11,
		name: "Wound Treatment",
		group: "Kecerdasan"
	},
	{
		id: 12,
		name: "Inventory Management",
		group: "Kecerdasan"
	},
	{
		id: 13,
		name: "Spotting",
		group: "Kecerdasan"
	},
	{
		id: 14,
		name: "Path-finding",
		group: "Kecerdasan"
	},
	{
		id: 15,
		name: "Tactics",
		group: "Kecerdasan"
	},
	{
		id: 16,
		name: "Tracking",
		group: "Kecerdasan"
	},
	{
		id: 17,
		name: "Trainer",
		group: "Kecerdasan"
	},
	{
		id: 22,
		name: "Looting",
		group: "Agility"
	},
	{
		id: 23,
		name: "Horse Archery",
		group: "Agility"
	},
	{
		id: 24,
		name: "Riding",
		group: "Agility"
	},
	{
		id: 25,
		name: "Athletics",
		group: "Agility"
	},
	{
		id: 26,
		name: "Shield",
		group: "Agility"
	},
	{
		id: 27,
		name: "Weapon Master",
		group: "Agility"
	},
	{
		id: 33,
		name: "Power Draw",
		group: "Strength"
	},
	{
		id: 34,
		name: "Power Throw",
		group: "Strength"
	},
	{
		id: 35,
		name: "Power Strike",
		group: "Strength"
	},
	{
		id: 36,
		name: "Ironflesh",
		group: "Strength"
	}
];
var OCCUPATION = {
	0: "Tidak aktif",
	2: "Lord",
	5: "Kompanion",
	6: "Bangsawan",
	7: "Seneschal",
	8: "Ksatria bandit",
	9: "Pretender",
	11: "Pensiun"
};
function readSkills(buf, off) {
	const dv = viewOf(buf);
	const out = [];
	for (let i = 0; i < 48; i++) {
		const word = dv.getUint32(off + Math.floor(i / 8) * 4, true);
		const shift = i % 8 * 4;
		out.push(word >>> shift & 15);
	}
	return out;
}
function writeSkill(buf, off, index, value) {
	const dv = viewOf(buf);
	const wordOff = off + Math.floor(index / 8) * 4;
	const shift = index % 8 * 4;
	const masked = dv.getUint32(wordOff, true) & ~(15 << shift) | (value & 15) << shift;
	dv.setUint32(wordOff, masked >>> 0, true);
}
function clampInt(n, lo, hi) {
	if (!Number.isFinite(n)) return lo;
	return Math.max(lo, Math.min(hi, Math.trunc(n)));
}
function readNote(r, version) {
	const text = r.str();
	r.skip(4);
	r.i32();
	if (version > 1011) r.u8b();
	return text;
}
function readSlots(r) {
	const num = r.i32();
	expectRange("jumlah slot", num, 0, 2e5);
	const off = r.o;
	r.skip(num * 8);
	return {
		num,
		off
	};
}
function readQuest(r, version, notes) {
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
function readFaction(r, version, numFactions, notes) {
	readSlots(r);
	const relationOff = r.o;
	r.skip(numFactions * 4);
	const name = r.str();
	r.u8b();
	const color = r.u32();
	r.i32();
	for (let i = 0; i < notes; i++) readNote(r, version);
	return {
		name: name || `Faksi ${numFactions}`,
		color,
		relationOff,
		count: numFactions
	};
}
function readParty(r, version, feat) {
	const id = r.str();
	const name = r.str();
	r.u64();
	r.skip(32);
	r.skip(28);
	const numStacks = r.i32();
	expectRange("jumlah stack", numStacks, 0, 5e3);
	const stacks = [];
	for (let i = 0; i < numStacks; i++) {
		const troopId = r.i32();
		const countOff = r.o;
		r.i32();
		const woundedOff = r.o;
		r.i32();
		const flags = r.i32();
		stacks.push({
			troopId,
			countOff,
			woundedOff,
			flags
		});
	}
	r.f32();
	r.u8b();
	r.str();
	r.skip(24);
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
	expectRange("party menempel", attached, 0, 2e4);
	r.skip(attached * 4);
	const particles = r.i32();
	expectRange("partikel", particles, 0, 2e4);
	r.skip(particles * 4);
	for (let i = 0; i < feat.noteCount; i++) readNote(r, version);
	readSlots(r);
	return {
		id,
		name,
		stacks
	};
}
function readPrelude(u8, pad) {
	if (u8.length < 64 || u8[0] !== 87 || u8[1] !== 82 || u8[2] !== 68 || u8[3] !== 82) throw new Error("Bukan file save Warband. Magic WRDR tidak ditemukan.");
	const r = new Reader(u8);
	r.o = 4;
	const version = r.u32();
	const moduleVersion = r.u32();
	if (version <= 1011 || version > 2500) throw new Error(`Versi save ${version} tidak didukung. Editor ini untuk Mount & Blade: Warband, bukan game asli 1.011 dan bukan Bannerlord.`);
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
	r.skip(24);
	r.i32();
	r.i32();
	r.str();
	r.skip(24);
	r.u64();
	r.f32();
	r.i32();
	r.i32();
	r.i32();
	if (feat.classes) for (let i = 0; i < 9; i++) r.str();
	const globals = r.i32();
	expectRange("variabel global", globals, 0, 2e6);
	r.skip(globals * 8);
	const triggers = r.i32();
	expectRange("trigger", triggers, 0, 2e5);
	r.skip(triggers * 28);
	const simple = r.i32();
	expectRange("simple trigger", simple, 0, 2e5);
	r.skip(simple * 8);
	const quests = r.i32();
	expectRange("quest", quests, 0, 2e4);
	for (let i = 0; i < quests; i++) readQuest(r, version, feat.noteCount);
	if (feat.infoPages) {
		const pages = r.i32();
		expectRange("info page", pages, 0, 2e4);
		for (let i = 0; i < pages; i++) for (let k = 0; k < 16; k++) readNote(r, version);
	}
	const sites = r.i32();
	expectRange("site", sites, 0, 1e5);
	for (let i = 0; i < sites; i++) readSlots(r);
	const numFactions = r.i32();
	expectRange("faksi", numFactions, 1, 4e3);
	const factions = [];
	for (let i = 0; i < numFactions; i++) {
		const fac = readFaction(r, version, numFactions, feat.noteCount);
		if (!fac.name || fac.name.startsWith("Faksi ")) fac.name = fac.name || `Faksi ${i}`;
		factions.push({
			...fac,
			name: fac.name || `Faksi ${i}`
		});
	}
	const tracks = r.i32();
	expectRange("jejak peta", tracks, 0, 2e6);
	r.skip(tracks * 24);
	const templates = r.i32();
	expectRange("template party", templates, 0, 1e5);
	for (let i = 0; i < templates; i++) {
		r.skip(12);
		readSlots(r);
	}
	const numRecords = r.i32();
	r.i32();
	expectRange("party", numRecords, 0, 2e5);
	const parties = [];
	for (let i = 0; i < numRecords; i++) {
		if (!r.i32()) continue;
		const rawId = r.i32();
		const idNum = r.i32();
		const party = readParty(r, version, feat);
		parties.push({
			index: i,
			rawId,
			idNum,
			...party
		});
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
		partyEnd: r.o
	};
}
function isPow2(n) {
	return n > 0 && (n & n - 1) === 0;
}
function plausibleTroopStart(r, off) {
	if (off < 0 || off + 48 > r.len) return false;
	let numTroops;
	let slots;
	try {
		numTroops = r.i32at(off);
		slots = r.i32at(off + 4);
	} catch {
		return false;
	}
	if (numTroops < 5 || numTroops > 2e4) return false;
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
function readTroop(r, version, index, regularExtended) {
	const numSlots = r.i32();
	expectRange("slot troop", numSlots, 0, 1e5);
	if (numSlots !== 0 && !isPow2(numSlots)) throw new Error("slot troop bukan pangkat dua");
	const slotsOff = r.o;
	r.skip(numSlots * 8);
	const attrOff = r.o;
	const a0 = r.i32();
	const a1 = r.i32();
	const a2 = r.i32();
	const a3 = r.i32();
	if (index === 0 && (a0 < 0 || a1 < 0 || a2 < 0 || a3 < 0)) throw new Error("atribut pemain tidak masuk akal");
	const profOff = r.o;
	for (let i = 0; i < 7; i++) {
		const p = r.f32();
		if (!Number.isFinite(p) || p < -1 || p > 5e3) throw new Error("proficiency tidak masuk akal");
	}
	const skillOff = r.o;
	r.skip(24);
	let note0 = "";
	if (version > 1011) for (let i = 0; i < 16; i++) {
		const text = readNote(r, version);
		if (i === 0) note0 = text;
	}
	const hero = (r.u64() & TF_HERO) !== 0n;
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
		if (!Number.isFinite(health) || health < -10 || health > 1e5) throw new Error("health tidak masuk akal");
		factionId = r.i32();
		if (factionId < -5 || factionId > 1e4) throw new Error("faksi troop tidak masuk akal");
		r.skip(768);
		r.skip(80);
		r.skip(32);
		if (version > 1011) {
			if (r.u8b()) {
				renamed = r.str();
				r.str();
			}
		}
	}
	if (version > 1011) r.i32();
	let occupation = null;
	if (numSlots > 2) {
		occupation = Number(r.dv.getBigInt64(slotsOff + 16, true));
		if (!Number.isFinite(occupation) || Math.abs(occupation) > 1e6) occupation = null;
	}
	const cleanNote = note0.replace(/\s+/g, " ").trim();
	return {
		index,
		hero,
		label: renamed.trim() || (cleanNote.length > 0 && cleanNote.length <= 48 ? cleanNote : "") || (hero ? `Hero #${index}` : `Pasukan #${index}`),
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
		occupation
	};
}
function readTail(r) {
	r.skip(168);
	const items = r.i32();
	expectRange("jenis item", items, 0, 1e5);
	for (let i = 0; i < items; i++) {
		const slots = r.i32();
		expectRange("slot item", slots, 0, 1e5);
		r.skip(slots * 8);
	}
	r.skip(16);
	r.skip(16);
}
function tryTroops(u8, offset, version, regularExtended) {
	const r = new Reader(u8);
	r.o = offset;
	const num = r.i32();
	expectRange("jumlah troop", num, 1, 2e4);
	const troops = [];
	for (let i = 0; i < num; i++) troops.push(readTroop(r, version, i, regularExtended));
	if (!troops.some((t) => t.hero)) throw new Error("tidak ada hero");
	readTail(r);
	return {
		troops,
		end: r.o
	};
}
function pickMain(parties) {
	return parties.find((p) => /main_party/i.test(p.id) || /main_party/i.test(p.name) || /^player$/i.test(p.id)) ?? parties.find((p) => p.index === 0) ?? parties[0];
}
function parseWithPad(u8, pad) {
	const pre = readPrelude(u8, pad);
	const r = new Reader(u8);
	const scanEnd = u8.length;
	let attempts = 0;
	for (let off = pre.partyEnd; off < scanEnd - 64; off++) {
		if (!plausibleTroopStart(r, off)) continue;
		attempts++;
		if (attempts > 48) break;
		for (const regularExtended of [false, true]) try {
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
				trailing
			};
		} catch {}
	}
	throw new Error(`Header terbaca (${pre.playerName || "tanpa nama"}, versi ${pre.version}) tetapi blok karakter tidak cocok. File ini mungkin rusak, terkompresi, atau bukan save Warband.`);
}
function parseSave(buffer) {
	const u8 = buffer.byteOffset === 0 && buffer.byteLength === buffer.buffer.byteLength ? buffer : new Uint8Array(buffer);
	if (u8.length < 64 || u8[0] !== 87 || u8[1] !== 82 || u8[2] !== 68 || u8[3] !== 82) throw new Error("Bukan file save Warband. Pilih file sg00.sav (atau sg01, sg02, …).");
	const order = new DataView(u8.buffer, u8.byteOffset, u8.byteLength).getUint32(4, true) > 1143 ? [true, false] : [false, true];
	let last = "Save tidak dikenali.";
	for (const pad of order) try {
		return parseWithPad(u8, pad);
	} catch (error) {
		last = error instanceof Error ? error.message : String(error);
	}
	throw new Error(last);
}
function factionCss(color) {
	const r = color >>> 16 & 255;
	const g = color >>> 8 & 255;
	const b = color & 255;
	if (r + g + b < 24) return "var(--color-muted)";
	return `rgb(${r} ${g} ${b})`;
}
/** Synthetic Warband save used to exercise the editor without a real sg00.sav. */
function buildSampleSave(options = {}) {
	const version = options.version ?? 1174;
	const pad = options.pad ?? version > 1143;
	const feat = features(version, pad);
	const w = new Writer();
	w.u8(87);
	w.u8(82);
	w.u8(68);
	w.u8(82);
	w.u32(version);
	w.u32(171);
	w.str("Calradia — slot 1");
	w.str("Alaric");
	w.i32(15);
	w.f32(214.5);
	w.i64(12e5);
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
	w.f32(.2);
	w.f32(.1);
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
	if (feat.classes) for (let i = 0; i < 9; i++) w.strEmpty();
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
	const factionNames = [
		"Player Faction",
		"Kingdom of Swadia",
		"Kingdom of Vaegirs",
		"Kingdom of Nords"
	];
	const relations = [
		[
			0,
			25,
			-10,
			40
		],
		[
			25,
			100,
			-40,
			-20
		],
		[
			-10,
			-40,
			100,
			5
		],
		[
			40,
			-20,
			5,
			100
		]
	];
	w.i32(factionNames.length);
	factionNames.forEach((name, index) => {
		w.i32(0);
		for (const value of relations[index] ?? []) w.f32(value);
		w.str(name);
		w.u8(0);
		w.u32(index === 0 ? 860116326 : 4280303712 + index * 40);
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
		{
			troop: 0,
			count: 1,
			wounded: 0,
			flags: 0
		},
		{
			troop: 5,
			count: 40,
			wounded: 6,
			flags: 0
		},
		{
			troop: 6,
			count: 18,
			wounded: 0,
			flags: 1
		}
	]);
	w.zeros(48);
	w.i32(12);
	writeHero(w, version, {
		slots: slotMap([[2, 0], [22, 0]]),
		attrs: [
			18,
			14,
			12,
			10
		],
		profs: [
			160,
			90,
			70,
			180,
			40,
			55,
			0
		],
		skills: {
			1: 6,
			35: 8,
			24: 4
		},
		level: 15,
		gold: 123456,
		xp: 8e4,
		health: 58,
		faction: 0,
		renamed: ""
	});
	writeHero(w, version, {
		slots: slotMap([[2, 2], [22, 40]]),
		attrs: [
			20,
			15,
			12,
			14
		],
		profs: [
			220,
			180,
			160,
			40,
			20,
			30,
			0
		],
		skills: {
			1: 7,
			35: 6
		},
		level: 28,
		gold: 4200,
		xp: 2e5,
		health: 64,
		faction: 1,
		renamed: "Count Klargus"
	});
	for (let i = 2; i < 12; i++) writeRegular(w, version, 6 + i % 3, 4);
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
function slotMap(pairs) {
	const slots = Array.from({ length: 64 }, () => 0);
	for (const [index, value] of pairs) slots[index] = value;
	return slots;
}
function writeSkills(w, values) {
	const words = [
		0,
		0,
		0,
		0,
		0,
		0
	];
	for (const [key, value] of Object.entries(values)) {
		const index = Number(key);
		const word = Math.floor(index / 8);
		const shift = index % 8 * 4;
		words[word] = (words[word] ?? 0) | (value & 15) << shift;
	}
	for (const word of words) w.u32(word ?? 0);
}
function writeHero(w, version, hero) {
	w.i32(hero.slots.length);
	for (const slot of hero.slots) w.i64(slot);
	for (const attr of hero.attrs) w.i32(attr);
	for (const prof of hero.profs) w.f32(prof);
	writeSkills(w, hero.skills);
	for (let i = 0; i < 16; i++) w.note(version);
	w.i64(16);
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
function writeRegular(w, version, attr, level) {
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
function writeParty(w, version, pad, id, name, stacks) {
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
function Guide() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg text-fg",
						children: "Pakai di HP, tanpa APK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Editor ini sudah jalan di browser. Tidak perlu Android Studio untuk mengubah save. Chrome di Android bisa membuka file ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "sg00.sav"
							}),
							", menyuntingnya, lalu mengunduh hasilnya."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
						className: "mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-fg",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Tutup Mount & Blade sepenuhnya." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Salin ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "sg00.sav"
								}),
								" (atau slot lain) ke folder Download. Lihat bagian folder di bawah."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Di halaman ini, pilih file itu. Ubah denar, atribut, skill, pasukan, atau relasi." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								"Ketuk ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-accent",
									children: "Unduh save"
								}),
								". File baru berakhiran ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "-edited.sav"
								}),
								"."
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Salin kembali ke folder save, ganti nama menjadi persis seperti aslinya (misalnya sg00.sav), lalu buka game." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Simpan salinan file asli dulu. Kalau game menolak save, kembalikan salinan itu. Tambahkan halaman ini ke layar utama lewat menu Chrome → Tambahkan ke layar utama supaya ikonnya seperti aplikasi."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg text-fg",
						children: "Folder save di Android & M&BTool"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Port Warband menyimpan slot yang sama dengan PC: ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "sg00.sav"
							}),
							", ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "sg01.sav"
							}),
							", dan seterusnya, biasanya di dalam folder bernama ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Mount&Blade Warband Savegames"
							}),
							" lalu nama modul (Native, atau mod yang kamu mainkan)."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"Lokasinya sering tersembunyi di penyimpanan launcher, bukan di Documents. Cara yang paling andal: buka pengelola file yang mampu mencari seluruh penyimpanan (misalnya pengelola dengan izin “semua file”), cari nama ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "sg00.sav"
							}),
							", lalu salin ke Download."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-danger",
						children: [
							"Sejak Android 11, folder ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Android/data"
							}),
							" ditutup untuk aplikasi biasa — termasuk APK yang kamu buat sendiri dan pemilih file Chrome. Izin “akses semua file” yang bisa menembus folder itu ditolak Play Store, dan banyak HP tetap memblokirnya. Karena itu editor ini tidak berpura-pura membuka folder data secara langsung. Alur salin keluar → sunting → salin masuk tetap jalan di Android baru."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg text-fg",
						children: "Apa yang benar-benar diubah"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-2 flex list-disc flex-col gap-2 pl-5 text-sm text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Denar"
							}), " — emas troop pemain (yang dibaca game sebagai uangmu), bukan bendera emas party NPC."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "STR, AGI, INT, CHA"
							}), " — empat bilangan utuh di troop pemain, plus poin atribut, skill, dan proficiency."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Skill"
							}), " — 4 bit per skill di dalam enam bilangan 32-bit. Urutan mengikuti Native. Skill cadangan sengaja ditampilkan; kalau angkanya acak, file itu bukan pola Native."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Senjata"
							}), " — tujuh proficiency (one-handed sampai firearm)."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Pasukan"
							}), " — jumlah dan yang terluka pada stack yang sudah ada di party utama. Jenis pasukan baru tidak ditambah, karena satu stack tambahan menggeser data peta yang tidak aman diubah."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Faksi"
							}), " — matriks relasi (bilangan pecahan) antar faksi. Nama faksi diambil dari save."] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "Lord"
								}),
								" — slot 22, yaitu ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "troop_player_relation"
								}),
								" di Native dan banyak mod. Kalau modmu memindahkan slot itu, ubah nomor slot di tab Lord sebelum menyimpan."
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Angka diganti di tempatnya, panjang file tidak berubah, sisa save (quest, inventori, wajah) dibiarkan apa adanya. Bannerlord dan Mount & Blade 1.011 tidak didukung."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg text-fg",
						children: "Kalau tetap ingin APK"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							"APK tidak menambah kemampuan yang belum ada di halaman ini, dan tidak membuka ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg",
								children: "Android/data"
							}),
							" secara ajaib. Yang bisa APK lakukan hanya membungkus editor yang sama plus pemilih folder Storage Access Framework — dan folder data aplikasi lain tetap tertutup."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto rounded-lg border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-surface-2 text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Cara"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-3 py-2 font-medium",
									children: "Hasil"
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: "Browser HP"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-muted",
											children: "Sudah cukup. Tidak perlu PC."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: "Android Studio di PC"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-muted",
											children: "Satu-satunya jalur APK yang stabil. Pasang SDK, buat proyek kosong, salin logika pembaca save, bangun APK debug."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: "Termux"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-muted",
											children: "Secara teori bisa (OpenJDK + Gradle + command-line SDK). Unduhan SDK sangat besar dan sering gagal di HP. Tidak praktis."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: "AIDE"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-muted",
											children: "Proyeknya usang terhadap Gradle sekarang. Jangan diandalkan."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-t border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2",
											children: "Sketchware"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2 text-muted",
											children: "Editor blok. Tidak cocok untuk parser biner bersyarat versi ini."
										})]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "Jadi: tidak wajib pakai PC. Wajib hanya jika kamu memang ingin file APK. Untuk menyunting save hari ini, pakai tombol pilih file di atas."
					})
				]
			})
		]
	});
}
var nf = new Intl.NumberFormat("id-ID");
function SaveEditor() {
	const [loaded, setLoaded] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [rev, setRev] = (0, import_react.useState)(0);
	const [query, setQuery] = (0, import_react.useState)("");
	const [lordFilter, setLordFilter] = (0, import_react.useState)("all");
	const [relationSlot, setRelationSlot] = (0, import_react.useState)(22);
	const [playerFaction, setPlayerFaction] = (0, import_react.useState)(0);
	const [bothWays, setBothWays] = (0, import_react.useState)(true);
	const inputRef = (0, import_react.useRef)(null);
	function touch(message) {
		setRev((n) => n + 1);
		if (message) setNotice(message);
	}
	async function openFile(file) {
		try {
			const save = parseSave(new Uint8Array(await file.arrayBuffer()));
			const playerFac = save.factions.findIndex((f) => /player/i.test(f.name));
			setPlayerFaction(playerFac >= 0 ? playerFac : 0);
			setLoaded({
				save,
				name: file.name
			});
			setError("");
			setNotice("");
			setQuery("");
		} catch (err) {
			setError(err instanceof Error ? err.message : "File tidak bisa dibaca.");
		}
	}
	function openSample() {
		const save = parseSave(buildSampleSave());
		setPlayerFaction(0);
		setLoaded({
			save,
			name: "contoh-calradia.sav"
		});
		setError("");
		setNotice("Ini save contoh di memori, bukan permainanmu. Gunakan untuk mencoba tombolnya.");
	}
	function download() {
		if (!loaded) return;
		const copy = new Uint8Array(loaded.save.buffer);
		const blob = new Blob([copy.buffer]);
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		const base = loaded.name.replace(/\.sav$/i, "") || "sg00";
		a.href = url;
		a.download = `${base}-edited.sav`;
		a.click();
		URL.revokeObjectURL(url);
		setNotice("File terunduh. Ganti nama menjadi slot aslinya, lalu salin kembali ke folder save. Game harus dalam keadaan tertutup.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-5 px-4 py-6 pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-accent uppercase",
						children: "Mount & Blade · Warband"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl text-fg",
						children: "Calradia Editor"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-xl text-sm text-muted",
						children: "Sunting denar, atribut, skill, pasukan, dan relasi pada file save. Berjalan di browser HP — file tidak dikirim ke mana pun."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
					className: "mt-1 size-8 shrink-0 text-accent",
					"aria-hidden": "true"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center",
				onDragOver: (event) => event.preventDefault(),
				onDrop: (event) => {
					event.preventDefault();
					const file = event.dataTransfer.files[0];
					if (file) openFile(file);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, {
						className: "size-6 text-accent",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-fg",
						children: "Pilih sg00.sav atau jatuhkan di sini"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted",
						children: "Save PC dan port mobile (termasuk launcher M&BTool) memakai format yang sama."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: inputRef,
						className: "sr-only",
						type: "file",
						accept: ".sav,application/octet-stream",
						onChange: (event) => {
							const file = event.target.files?.[0];
							if (file) openFile(file);
							event.target.value = "";
						}
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 rounded-lg bg-surface-2 px-4 text-sm text-fg",
					onClick: openSample,
					children: "Coba save contoh"
				}), loaded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg",
					onClick: download,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
						className: "mr-2 inline size-4",
						"aria-hidden": "true"
					}), "Unduh save"]
				})]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-danger bg-surface px-3 py-2 text-sm text-fg",
				role: "alert",
				children: error
			}),
			notice && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted",
				children: notice
			}),
			loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorBody, {
				loaded,
				rev,
				query,
				lordFilter,
				relationSlot,
				playerFaction,
				bothWays,
				onQuery: setQuery,
				onLordFilter: setLordFilter,
				onRelationSlot: setRelationSlot,
				onPlayerFaction: setPlayerFaction,
				onBothWays: setBothWays,
				onTouch: touch,
				onDownload: download
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guide, {})
		]
	});
}
function EditorBody({ loaded, rev, query, lordFilter, relationSlot, playerFaction, bothWays, onQuery, onLordFilter, onRelationSlot, onPlayerFaction, onBothWays, onTouch, onDownload }) {
	const { save } = loaded;
	const buf = save.buffer;
	const gold = readU32(buf, save.player.goldOff);
	const skills = readSkills(buf, save.player.skillOff);
	const partySize = save.mainParty.stacks.reduce((sum, stack) => {
		const count = readI32(buf, stack.countOff);
		return stack.flags & 1 ? sum : sum + Math.max(0, count);
	}, 0);
	const heroes = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return save.troops.filter((troop) => {
			if (!troop.hero || troop.index === save.player.index) return false;
			if (lordFilter === "lord" && troop.occupation !== 2) return false;
			if (lordFilter === "companion" && troop.occupation !== 5) return false;
			if (lordFilter === "lady" && troop.occupation !== 6) return false;
			if (!needle) return true;
			const faction = save.factions[troop.factionId]?.name ?? "";
			return `${troop.label} ${faction} ${troop.index}`.toLowerCase().includes(needle);
		});
	}, [
		save,
		query,
		lordFilter
	]);
	const fac = save.factions[playerFaction];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-4" }),
					label: "Denar",
					value: nf.format(gold)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Swords, { className: "size-4" }),
					label: "Level",
					value: String(readI32(buf, save.player.levelOff))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }),
					label: "Pasukan",
					value: nf.format(partySize)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-4" }),
					label: "Tahun",
					value: String(save.year || "—")
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				save.playerName || "Pemain",
				" · ",
				save.saveName || loaded.name,
				" · Warband ",
				save.version,
				save.player.index !== 0 ? " · troop pemain bukan indeks 0, periksa sebelum bermain" : ""
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "hero",
			className: "flex flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "flex gap-2 overflow-x-auto pb-1",
					"aria-label": "Bagian save",
					children: [
						["hero", "Karakter"],
						["skills", "Skill"],
						["arms", "Senjata"],
						["party", "Pasukan"],
						["faction", "Faksi"],
						["lords", "Lord"],
						["guide", "Panduan"]
					].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value,
						className: "min-h-11 shrink-0 rounded-lg bg-surface px-3 text-sm text-muted data-[state=active]:bg-primary data-[state=active]:text-primary-fg",
						children: label
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "hero",
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									writeU32(buf, save.player.goldOff, 1e6);
									onTouch("Denar diubah menjadi 1.000.000.");
								},
								children: "1.000.000 denar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									ATTRS.forEach((_, i) => writeI32(buf, save.player.attrOff + i * 4, 30));
									writeI32(buf, save.player.attrPointsOff, 30);
									onTouch("Atribut dijadikan 30.");
								},
								children: "Atribut 30"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Denar",
							value: gold,
							min: 0,
							max: 2e9,
							onChange: (v) => {
								writeU32(buf, save.player.goldOff, v);
								onTouch();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Level",
							value: readI32(buf, save.player.levelOff),
							min: 1,
							max: 80,
							onChange: (v) => {
								writeI32(buf, save.player.levelOff, v);
								writeI32(buf, save.headerLevelOff, v);
								onTouch();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 gap-3",
							children: ATTRS.map((attr, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: attr.name,
								value: readI32(buf, save.player.attrOff + index * 4),
								min: 1,
								max: 80,
								onChange: (v) => {
									writeI32(buf, save.player.attrOff + index * 4, v);
									onTouch();
								}
							}, attr.key))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-1 gap-3 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Poin atribut",
									value: readI32(buf, save.player.attrPointsOff),
									min: 0,
									max: 500,
									onChange: (v) => {
										writeI32(buf, save.player.attrPointsOff, v);
										onTouch();
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Poin skill",
									value: readI32(buf, save.player.skillPointsOff),
									min: 0,
									max: 500,
									onChange: (v) => {
										writeI32(buf, save.player.skillPointsOff, v);
										onTouch();
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Poin proficiency",
									value: readI32(buf, save.player.profPointsOff),
									min: 0,
									max: 5e4,
									onChange: (v) => {
										writeI32(buf, save.player.profPointsOff, v);
										onTouch();
									}
								})
							]
						}),
						save.player.xpOff >= 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Experience",
							value: readI32(buf, save.player.xpOff),
							min: 0,
							max: 2e9,
							onChange: (v) => {
								writeI32(buf, save.player.xpOff, v);
								onTouch();
							}
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "skills",
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
							onClick: () => {
								for (const skill of SKILLS) writeSkill(buf, save.player.skillOff, skill.id, 10);
								onTouch("Skill yang terdaftar dijadikan 10.");
							},
							children: "Semua skill utama = 10"
						}),
						[
							"Kepemimpinan",
							"Kecerdasan",
							"Agility",
							"Strength"
						].map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-xl border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-2 text-sm text-accent",
								children: group
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-col gap-2",
								children: SKILLS.filter((skill) => skill.group === group).map((skill) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: skill.name,
									value: skills[skill.id] ?? 0,
									min: 0,
									max: 15,
									onChange: (v) => {
										writeSkill(buf, save.player.skillOff, skill.id, v);
										onTouch();
									}
								}, skill.id))
							})]
						}, group)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Nilai di atas 10 bisa disimpan (maks. 15) tetapi layar karakter Warband biasanya berhenti di 10."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "arms",
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
						onClick: () => {
							PROFS.forEach((_, i) => writeF32(buf, save.player.profOff + i * 4, 400));
							onTouch("Proficiency dijadikan 400.");
						},
						children: "Semua senjata 400"
					}), PROFS.map((name, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: name,
						value: Math.round(readF32(buf, save.player.profOff + index * 4)),
						min: 0,
						max: 1e3,
						onChange: (v) => {
							writeF32(buf, save.player.profOff + index * 4, v);
							onTouch();
						}
					}, name))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "party",
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							save.mainParty.name || save.mainParty.id || "Party utama",
							" · ",
							save.mainParty.stacks.length,
							" stack. Jumlah yang sudah ada bisa diubah. Menambah jenis pasukan baru tidak dilakukan, supaya sisa file tidak bergeser."
						]
					}), save.mainParty.stacks.map((stack, index) => {
						const count = readI32(buf, stack.countOff);
						const wounded = readI32(buf, stack.woundedOff);
						const troop = save.troops[stack.troopId];
						const prisoner = (stack.flags & 1) !== 0;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl border border-border bg-surface p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-2 flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm text-fg",
									children: troopLabel(troop, stack.troopId)
								}), prisoner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-accent",
									children: "Tawanan"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Jumlah",
									value: count,
									min: 0,
									max: 1e4,
									onChange: (v) => {
										writeI32(buf, stack.countOff, v);
										if (readI32(buf, stack.woundedOff) > v) writeI32(buf, stack.woundedOff, v);
										onTouch();
									}
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Terluka",
									value: wounded,
									min: 0,
									max: Math.max(0, count),
									onChange: (v) => {
										writeI32(buf, stack.woundedOff, Math.min(v, readI32(buf, stack.countOff)));
										onTouch();
									}
								})]
							})]
						}, index);
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "faction",
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm text-muted",
							children: ["Faksi yang mewakilimu", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "min-h-11 rounded-lg border border-border bg-surface px-3 text-fg",
								value: playerFaction,
								onChange: (event) => onPlayerFaction(Number(event.target.value)),
								children: save.factions.map((faction, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: index,
									children: faction.name || `Faksi ${index}`
								}, index))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm text-fg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: bothWays,
								onChange: (event) => onBothWays(event.target.checked)
							}), "Tulis relasi dua arah"]
						}),
						fac && save.factions.map((other, index) => {
							if (index === playerFaction) return null;
							const value = Math.round(readF32(buf, fac.relationOff + index * 4));
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-3 shrink-0 rounded-full",
									style: { background: factionCss(other.color) }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "min-w-0 flex-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: other.name || `Faksi ${index}`,
										value,
										min: -100,
										max: 100,
										onChange: (v) => {
											writeF32(buf, fac.relationOff + index * 4, v);
											if (bothWays) writeF32(buf, other.relationOff + playerFaction * 4, v);
											onTouch();
										}
									})
								})]
							}, index);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "lords",
					className: "flex flex-col gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"Relasi lord memakai slot ",
								relationSlot,
								" (Native: troop_player_relation). Nama yang tidak diubah pemain sering tidak tersimpan di save — yang tampil adalah indeks, faksi, dan catatan pertama."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Nomor slot",
								value: relationSlot,
								min: 0,
								max: 200,
								onChange: onRelationSlot
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ghost, {
								onClick: () => {
									let changed = 0;
									for (const troop of heroes) {
										if (troop.numSlots <= relationSlot) continue;
										writeI64(buf, troop.slotsOff + relationSlot * 8, 100);
										changed++;
									}
									onTouch(`${changed} hero di daftar ini dijadikan relasi 100.`);
								},
								children: "Semua yang tersaring = 100"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "min-h-11 rounded-lg border border-border bg-surface px-3 text-sm text-fg",
							placeholder: "Cari nama atau faksi",
							value: query,
							onChange: (event) => onQuery(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex gap-2 overflow-x-auto",
							children: [
								["all", "Semua hero"],
								["lord", "Lord"],
								["companion", "Kompanion"],
								["lady", "Bangsawan"]
							].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: `min-h-11 shrink-0 rounded-lg px-3 text-sm ${lordFilter === id ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`,
								onClick: () => onLordFilter(id),
								children: label
							}, id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [heroes.length, " hero"]
						}),
						heroes.map((troop) => {
							const faction = save.factions[troop.factionId]?.name;
							const can = troop.numSlots > relationSlot;
							const relation = can ? readI64(buf, troop.slotsOff + relationSlot * 8) : 0;
							const role = troop.occupation != null ? OCCUPATION[troop.occupation] : void 0;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-xl border border-border bg-surface p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "text-sm text-fg",
										children: [troop.label, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted",
											children: [" · #", troop.index]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: [
											role,
											faction,
											`lv ${troop.level}`
										].filter(Boolean).join(" · ")
									}),
									can ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Relasi",
										value: relation,
										min: -100,
										max: 100,
										onChange: (v) => {
											writeI64(buf, troop.slotsOff + relationSlot * 8, v);
											onTouch();
										}
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs text-danger",
										children: [
											"Slot ",
											relationSlot,
											" tidak ada pada hero ini."
										]
									})
								]
							}, troop.index);
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "guide",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Guide, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
							className: "min-h-11 cursor-pointer text-fg",
							children: "Detail pembacaan"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2",
							children: [
								"Versi game ",
								save.version,
								", modul ",
								save.moduleVersion,
								". Pad party 1.143: ",
								save.pad ? "ya" : "tidak",
								". Inventori troop biasa: ",
								save.regularExtended ? "ikut tersimpan" : "tidak dimuat",
								". ",
								save.troops.length,
								" troop, ",
								save.factions.length,
								" faksi, ",
								save.partiesFound,
								" party. Sisa byte di akhir file: ",
								save.trailing,
								"."
							]
						})]
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface px-4 py-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-3xl items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-sm text-muted",
					children: loaded.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg",
					onClick: onDownload,
					children: "Unduh save"
				})]
			})
		})
	] });
}
function troopLabel(troop, id) {
	if (!troop) return `Troop #${id}`;
	return troop.label || `Troop #${id}`;
}
function Stat({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-1 text-xs text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-accent",
				children: icon
			}), label]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "truncate text-lg text-fg",
			children: value
		})]
	});
}
function Ghost({ children, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "min-h-11 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg",
		onClick,
		children
	});
}
function Field({ label, value, min, max, onChange }) {
	const set = (next) => onChange(clampInt(next, min, max));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-3 py-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex items-center gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-11 rounded-lg bg-surface-2 text-lg text-fg",
					onClick: () => set(value - 1),
					"aria-label": `Kurangi ${label}`,
					children: "−"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "h-11 w-24 rounded-lg border border-border bg-bg text-center text-sm text-fg",
					inputMode: "numeric",
					type: "number",
					min,
					max,
					value: Number.isFinite(value) ? value : 0,
					onChange: (event) => {
						const raw = event.target.value;
						if (raw.trim() === "" || raw === "-") return;
						const next = Number(raw);
						if (Number.isFinite(next)) set(next);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "size-11 rounded-lg bg-surface-2 text-lg text-fg",
					onClick: () => set(value + 1),
					"aria-label": `Tambah ${label}`,
					children: "+"
				})
			]
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SaveEditor, {});
}
//#endregion
export { Home as component };
