import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readF32, readI32, readSkills, readU32, writeI32, writeSkill, writeU32 } from "./binary.ts";
import { RELATION_SLOT, parseSave } from "./parse.ts";
import { buildSampleSave } from "./sample.ts";

describe("warband save", () => {
  it("round-trips a 1.174 sample with the post-1.143 party field", () => {
    const raw = buildSampleSave({ version: 1174, pad: true });
    const save = parseSave(raw);
    assert.equal(save.playerName, "Alaric");
    assert.equal(save.version, 1174);
    assert.equal(save.pad, true);
    assert.equal(save.regularExtended, false);
    assert.equal(readU32(save.buffer, save.player.goldOff), 123_456);
    assert.equal(readI32(save.buffer, save.player.attrOff), 18);
    assert.equal(readI32(save.buffer, save.player.attrOff + 4), 14);
    assert.equal(save.player.level, 15);
    assert.equal(save.troops[1]?.label, "Count Klargus");
    assert.equal(readI64Slot(save, 1), 40);
    assert.equal(save.mainParty.stacks[1]?.troopId, 5);
    assert.equal(readI32(save.buffer, save.mainParty.stacks[1]!.countOff), 40);
    assert.equal(readI32(save.buffer, save.mainParty.stacks[1]!.woundedOff), 6);
    assert.equal(readF32(save.buffer, save.factions[0]!.relationOff + 4), 25);
    assert.equal(readSkills(save.buffer, save.player.skillOff)[35], 8);
    assert.equal(readSkills(save.buffer, save.player.skillOff)[1], 6);
    assert.equal(save.trailing, 0);
    assert.equal(save.troops.length, 12);

    writeU32(save.buffer, save.player.goldOff, 777_777);
    writeSkill(save.buffer, save.player.skillOff, 35, 10);
    writeI32(save.buffer, save.mainParty.stacks[1]!.countOff, 120);
    const again = parseSave(save.buffer);
    assert.equal(readU32(again.buffer, again.player.goldOff), 777_777);
    assert.equal(readSkills(again.buffer, again.player.skillOff)[35], 10);
    assert.equal(readI32(again.buffer, again.mainParty.stacks[1]!.countOff), 120);
  });

  it("reads a pre-1.136 save that has no difficulty block and no party pad", () => {
    const save = parseSave(buildSampleSave({ version: 1130, pad: false }));
    assert.equal(save.version, 1130);
    assert.equal(save.pad, false);
    assert.equal(readU32(save.buffer, save.player.goldOff), 123_456);
    assert.equal(save.factions[2]?.name, "Kingdom of Vaegirs");
    assert.equal(save.hour, 14);
    assert.equal(save.year, 1257);
  });
});

function readI64Slot(save: ReturnType<typeof parseSave>, troopIndex: number): number {
  const troop = save.troops[troopIndex];
  assert.ok(troop);
  return Number(
    new DataView(save.buffer.buffer, save.buffer.byteOffset, save.buffer.byteLength).getBigInt64(
      troop.slotsOff + RELATION_SLOT * 8,
      true,
    ),
  );
}
