import { useMemo, useRef, useState, type ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Coins, Download, ScrollText, Shield, Swords, Users } from "lucide-react";
import {
  ATTRS,
  OCCUPATION,
  PROFS,
  RELATION_SLOT,
  SKILLS,
  clampInt,
  readF32,
  readI32,
  readI64,
  readSkills,
  readU32,
  writeF32,
  writeI32,
  writeI64,
  writeSkill,
  writeU32,
} from "@/lib/warband/binary";
import { factionCss, parseSave, type ParsedSave, type TroopRef } from "@/lib/warband/parse";
import { buildSampleSave } from "@/lib/warband/sample";
import { Guide } from "@/components/guide";

type Loaded = { save: ParsedSave; name: string };

const nf = new Intl.NumberFormat("id-ID");

export function SaveEditor() {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rev, setRev] = useState(0);
  const [query, setQuery] = useState("");
  const [lordFilter, setLordFilter] = useState<"all" | "lord" | "companion" | "lady">("all");
  const [relationSlot, setRelationSlot] = useState(RELATION_SLOT);
  const [playerFaction, setPlayerFaction] = useState(0);
  const [bothWays, setBothWays] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  function touch(message?: string) {
    setRev((n) => n + 1);
    if (message) setNotice(message);
  }

  async function openFile(file: File) {
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const save = parseSave(buf);
      const playerFac = save.factions.findIndex((f) => /player/i.test(f.name));
      setPlayerFaction(playerFac >= 0 ? playerFac : 0);
      setLoaded({ save, name: file.name });
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
    setLoaded({ save, name: "contoh-calradia.sav" });
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl min-w-0 flex-col gap-5 overflow-x-hidden px-4 py-6 pb-28">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-accent uppercase">Mount & Blade · Warband</p>
          <h1 className="font-display text-3xl text-fg">Calradia Editor</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Sunting denar, atribut, skill, pasukan, dan relasi pada file save. Berjalan di browser HP — file tidak dikirim ke mana pun.
          </p>
        </div>
        <Shield className="mt-1 size-8 shrink-0 text-accent" aria-hidden="true" />
      </header>

      <label
        className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-surface px-4 py-6 text-center"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) void openFile(file);
        }}
      >
        <ScrollText className="size-6 text-accent" aria-hidden="true" />
        <span className="text-sm text-fg">Pilih sg00.sav atau jatuhkan di sini</span>
        <span className="text-xs text-muted">Save PC dan port mobile (termasuk launcher M&BTool) memakai format yang sama.</span>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".sav,application/octet-stream"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void openFile(file);
            event.target.value = "";
          }}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-lg bg-surface-2 px-4 text-sm text-fg" onClick={openSample}>
          Coba save contoh
        </button>
        {loaded && (
          <button type="button" className="min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg" onClick={download}>
            <Download className="mr-2 inline size-4" aria-hidden="true" />
            Unduh save
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-danger bg-surface px-3 py-2 text-sm text-fg" role="alert">
          {error}
        </p>
      )}
      {notice && <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted">{notice}</p>}

      {loaded ? (
        <EditorBody
          loaded={loaded}
          rev={rev}
          query={query}
          lordFilter={lordFilter}
          relationSlot={relationSlot}
          playerFaction={playerFaction}
          bothWays={bothWays}
          onQuery={setQuery}
          onLordFilter={setLordFilter}
          onRelationSlot={setRelationSlot}
          onPlayerFaction={setPlayerFaction}
          onBothWays={setBothWays}
          onTouch={touch}
          onDownload={download}
        />
      ) : (
        <Guide />
      )}
    </main>
  );
}

function EditorBody({
  loaded,
  rev,
  query,
  lordFilter,
  relationSlot,
  playerFaction,
  bothWays,
  onQuery,
  onLordFilter,
  onRelationSlot,
  onPlayerFaction,
  onBothWays,
  onTouch,
  onDownload,
}: {
  loaded: Loaded;
  rev: number;
  query: string;
  lordFilter: "all" | "lord" | "companion" | "lady";
  relationSlot: number;
  playerFaction: number;
  bothWays: boolean;
  onQuery: (v: string) => void;
  onLordFilter: (v: "all" | "lord" | "companion" | "lady") => void;
  onRelationSlot: (v: number) => void;
  onPlayerFaction: (v: number) => void;
  onBothWays: (v: boolean) => void;
  onTouch: (message?: string) => void;
  onDownload: () => void;
}) {
  void rev;
  const { save } = loaded;
  const buf = save.buffer;
  const gold = readU32(buf, save.player.goldOff);
  const skills = readSkills(buf, save.player.skillOff);
  const partySize = save.mainParty.stacks.reduce((sum, stack) => {
    const count = readI32(buf, stack.countOff);
    return stack.flags & 1 ? sum : sum + Math.max(0, count);
  }, 0);

  const heroes = useMemo(() => {
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
  }, [save, query, lordFilter]);

  const fac = save.factions[playerFaction];

  return (
    <>
      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat icon={<Coins className="size-4" />} label="Denar" value={nf.format(gold)} />
        <Stat icon={<Swords className="size-4" />} label="Level" value={String(readI32(buf, save.player.levelOff))} />
        <Stat icon={<Users className="size-4" />} label="Pasukan" value={nf.format(partySize)} />
        <Stat icon={<Shield className="size-4" />} label="Tahun" value={String(save.year || "—")} />
      </section>

      <p className="text-sm text-muted">
        {save.playerName || "Pemain"} · {save.saveName || loaded.name} · Warband {save.version}
        {save.player.index !== 0 ? " · troop pemain bukan indeks 0, periksa sebelum bermain" : ""}
      </p>

      <Tabs.Root defaultValue="hero" className="flex flex-col gap-4">
        <Tabs.List className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Bagian save">
          {[
            ["hero", "Karakter"],
            ["skills", "Skill"],
            ["arms", "Senjata"],
            ["party", "Pasukan"],
            ["faction", "Faksi"],
            ["lords", "Lord"],
            ["guide", "Panduan"],
          ].map(([value, label]) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className="min-h-11 shrink-0 rounded-lg bg-surface px-3 text-sm text-muted data-[state=active]:bg-primary data-[state=active]:text-primary-fg"
            >
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="hero" className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Ghost onClick={() => { writeU32(buf, save.player.goldOff, 1_000_000); onTouch("Denar diubah menjadi 1.000.000."); }}>
              1.000.000 denar
            </Ghost>
            <Ghost onClick={() => {
              ATTRS.forEach((_, i) => writeI32(buf, save.player.attrOff + i * 4, 30));
              writeI32(buf, save.player.attrPointsOff, 30);
              onTouch("Atribut dijadikan 30.");
            }}>
              Atribut 30
            </Ghost>
          </div>
          <Field label="Denar" value={gold} min={0} max={2_000_000_000} onChange={(v) => { writeU32(buf, save.player.goldOff, v); onTouch(); }} />
          <Field
            label="Level"
            value={readI32(buf, save.player.levelOff)}
            min={1}
            max={80}
            onChange={(v) => {
              writeI32(buf, save.player.levelOff, v);
              writeI32(buf, save.headerLevelOff, v);
              onTouch();
            }}
          />
          <div className="grid grid-cols-2 gap-3">
            {ATTRS.map((attr, index) => (
              <Field
                key={attr.key}
                label={attr.name}
                value={readI32(buf, save.player.attrOff + index * 4)}
                min={1}
                max={80}
                onChange={(v) => { writeI32(buf, save.player.attrOff + index * 4, v); onTouch(); }}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Poin atribut" value={readI32(buf, save.player.attrPointsOff)} min={0} max={500} onChange={(v) => { writeI32(buf, save.player.attrPointsOff, v); onTouch(); }} />
            <Field label="Poin skill" value={readI32(buf, save.player.skillPointsOff)} min={0} max={500} onChange={(v) => { writeI32(buf, save.player.skillPointsOff, v); onTouch(); }} />
            <Field label="Poin proficiency" value={readI32(buf, save.player.profPointsOff)} min={0} max={50_000} onChange={(v) => { writeI32(buf, save.player.profPointsOff, v); onTouch(); }} />
          </div>
          {save.player.xpOff >= 0 && (
            <Field label="Experience" value={readI32(buf, save.player.xpOff)} min={0} max={2_000_000_000} onChange={(v) => { writeI32(buf, save.player.xpOff, v); onTouch(); }} />
          )}
        </Tabs.Content>

        <Tabs.Content value="skills" className="flex flex-col gap-3">
          <Ghost onClick={() => {
            for (const skill of SKILLS) writeSkill(buf, save.player.skillOff, skill.id, 10);
            onTouch("Skill yang terdaftar dijadikan 10.");
          }}>
            Semua skill utama = 10
          </Ghost>
          {["Kepemimpinan", "Kecerdasan", "Agility", "Strength"].map((group) => (
            <section key={group} className="rounded-xl border border-border bg-surface p-3">
              <h2 className="mb-2 text-sm text-accent">{group}</h2>
              <div className="flex flex-col gap-2">
                {SKILLS.filter((skill) => skill.group === group).map((skill) => (
                  <Field
                    key={skill.id}
                    label={skill.name}
                    value={skills[skill.id] ?? 0}
                    min={0}
                    max={15}
                    onChange={(v) => { writeSkill(buf, save.player.skillOff, skill.id, v); onTouch(); }}
                  />
                ))}
              </div>
            </section>
          ))}
          <p className="text-xs text-muted">Nilai di atas 10 bisa disimpan (maks. 15) tetapi layar karakter Warband biasanya berhenti di 10.</p>
        </Tabs.Content>

        <Tabs.Content value="arms" className="flex flex-col gap-3">
          <Ghost onClick={() => {
            PROFS.forEach((_, i) => writeF32(buf, save.player.profOff + i * 4, 400));
            onTouch("Proficiency dijadikan 400.");
          }}>
            Semua senjata 400
          </Ghost>
          {PROFS.map((name, index) => (
            <Field
              key={name}
              label={name}
              value={Math.round(readF32(buf, save.player.profOff + index * 4))}
              min={0}
              max={1000}
              onChange={(v) => { writeF32(buf, save.player.profOff + index * 4, v); onTouch(); }}
            />
          ))}
        </Tabs.Content>

        <Tabs.Content value="party" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            {save.mainParty.name || save.mainParty.id || "Party utama"} · {save.mainParty.stacks.length} stack. Jumlah yang sudah ada bisa diubah. Menambah jenis pasukan baru tidak dilakukan, supaya sisa file tidak bergeser.
          </p>
          {save.mainParty.stacks.map((stack, index) => {
            const count = readI32(buf, stack.countOff);
            const wounded = readI32(buf, stack.woundedOff);
            const troop = save.troops[stack.troopId];
            const prisoner = (stack.flags & 1) !== 0;
            return (
              <article key={index} className="rounded-xl border border-border bg-surface p-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h2 className="text-sm text-fg">{troopLabel(troop, stack.troopId, save.playerName, save.player.index)}</h2>
                  {prisoner && <span className="text-xs text-accent">Tawanan</span>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Jumlah"
                    value={count}
                    min={0}
                    max={10_000}
                    onChange={(v) => {
                      writeI32(buf, stack.countOff, v);
                      if (readI32(buf, stack.woundedOff) > v) writeI32(buf, stack.woundedOff, v);
                      onTouch();
                    }}
                  />
                  <Field
                    label="Terluka"
                    value={wounded}
                    min={0}
                    max={Math.max(0, count)}
                    onChange={(v) => { writeI32(buf, stack.woundedOff, Math.min(v, readI32(buf, stack.countOff))); onTouch(); }}
                  />
                </div>
              </article>
            );
          })}
        </Tabs.Content>

        <Tabs.Content value="faction" className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm text-muted">
            Faksi yang mewakilimu
            <select
              className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-fg"
              value={playerFaction}
              onChange={(event) => onPlayerFaction(Number(event.target.value))}
            >
              {save.factions.map((faction, index) => (
                <option key={index} value={index}>
                  {faction.name || `Faksi ${index}`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm text-fg">
            <input type="checkbox" checked={bothWays} onChange={(event) => onBothWays(event.target.checked)} />
            Tulis relasi dua arah
          </label>
          {fac &&
            save.factions.map((other, index) => {
              if (index === playerFaction) return null;
              const value = Math.round(readF32(buf, fac.relationOff + index * 4));
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: factionCss(other.color) }} />
                  <div className="min-w-0 flex-1">
                    <Field
                      label={other.name || `Faksi ${index}`}
                      value={value}
                      min={-100}
                      max={100}
                      onChange={(v) => {
                        writeF32(buf, fac.relationOff + index * 4, v);
                        if (bothWays) writeF32(buf, other.relationOff + playerFaction * 4, v);
                        onTouch();
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </Tabs.Content>

        <Tabs.Content value="lords" className="flex flex-col gap-3">
          <p className="text-sm text-muted">
            Relasi lord memakai slot {relationSlot} (Native: troop_player_relation). Nama yang tidak diubah pemain sering tidak tersimpan di save — yang tampil adalah indeks, faksi, dan catatan pertama.
          </p>
          <div className="flex flex-wrap gap-2">
            <Field label="Nomor slot" value={relationSlot} min={0} max={200} onChange={onRelationSlot} />
            <Ghost onClick={() => {
              let changed = 0;
              for (const troop of heroes) {
                if (troop.numSlots <= relationSlot) continue;
                writeI64(buf, troop.slotsOff + relationSlot * 8, 100);
                changed++;
              }
              onTouch(`${changed} hero di daftar ini dijadikan relasi 100.`);
            }}>
              Semua yang tersaring = 100
            </Ghost>
          </div>
          <input
            className="min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg"
            placeholder="Cari nama atau faksi"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
          <div className="flex w-full min-w-0 gap-2 overflow-x-auto">
            {(
              [
                ["all", "Semua hero"],
                ["lord", "Lord"],
                ["companion", "Kompanion"],
                ["lady", "Bangsawan"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`min-h-11 shrink-0 rounded-lg px-3 text-sm ${lordFilter === id ? "bg-primary text-primary-fg" : "bg-surface text-muted"}`}
                onClick={() => onLordFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">{heroes.length} hero</p>
          {heroes.map((troop) => {
            const faction = save.factions[troop.factionId]?.name;
            const can = troop.numSlots > relationSlot;
            const relation = can ? readI64(buf, troop.slotsOff + relationSlot * 8) : 0;
            const role = troop.occupation != null ? OCCUPATION[troop.occupation] : undefined;
            return (
              <article key={troop.index} className="rounded-xl border border-border bg-surface p-3">
                <h2 className="text-sm text-fg">
                  {troop.label}
                  <span className="text-muted"> · #{troop.index}</span>
                </h2>
                <p className="text-xs text-muted">
                  {[role, faction, `lv ${troop.level}`].filter(Boolean).join(" · ")}
                </p>
                {can ? (
                  <Field
                    label="Relasi"
                    value={relation}
                    min={-100}
                    max={100}
                    onChange={(v) => { writeI64(buf, troop.slotsOff + relationSlot * 8, v); onTouch(); }}
                  />
                ) : (
                  <p className="mt-2 text-xs text-danger">Slot {relationSlot} tidak ada pada hero ini.</p>
                )}
              </article>
            );
          })}
        </Tabs.Content>

        <Tabs.Content value="guide">
          <Guide />
          <details className="mt-4 rounded-xl border border-border bg-surface p-3 text-sm text-muted">
            <summary className="min-h-11 cursor-pointer text-fg">Detail pembacaan</summary>
            <p className="mt-2">
              Versi game {save.version}, modul {save.moduleVersion}. Pad party 1.143: {save.pad ? "ya" : "tidak"}. Inventori troop biasa: {save.regularExtended ? "ikut tersimpan" : "tidak dimuat"}. {save.troops.length} troop, {save.factions.length} faksi, {save.partiesFound} party. Sisa byte di akhir file: {save.trailing}.
            </p>
          </details>
        </Tabs.Content>
      </Tabs.Root>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span className="truncate text-sm text-muted">{loaded.name}</span>
          <button type="button" className="min-h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg" onClick={onDownload}>
            Unduh save
          </button>
        </div>
      </div>
    </>
  );
}

function troopLabel(troop: TroopRef | undefined, id: number, playerName: string, playerIndex: number) {
  if (id === playerIndex) return playerName || "Pemain";
  if (!troop) return `Troop #${id}`;
  return troop.label || `Troop #${id}`;
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <div className="flex items-center gap-1 text-xs text-muted">
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <p className="truncate text-lg text-fg">{value}</p>
    </div>
  );
}

function Ghost({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg" onClick={onClick}>
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const set = (next: number) => onChange(clampInt(next, min, max));
  return (
    <label className="flex min-w-0 flex-col gap-1 py-1">
      <span className="text-sm text-muted">{label}</span>
      <span className="flex w-full items-center gap-1">
        <button type="button" className="size-11 shrink-0 rounded-lg bg-surface-2 text-lg text-fg" onClick={() => set(value - 1)} aria-label={`Kurangi ${label}`}>
          −
        </button>
        <input
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg text-center text-sm text-fg"
          inputMode="numeric"
          type="number"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw.trim() === "" || raw === "-") return;
            const next = Number(raw);
            if (Number.isFinite(next)) set(next);
          }}
        />
        <button type="button" className="size-11 shrink-0 rounded-lg bg-surface-2 text-lg text-fg" onClick={() => set(value + 1)} aria-label={`Tambah ${label}`}>
          +
        </button>
      </span>
    </label>
  );
}
