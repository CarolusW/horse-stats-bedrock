import { world, system } from "@minecraft/server";

const EQUINE_TYPES = new Set([
  "minecraft:horse",
  "minecraft:donkey",
  "minecraft:mule",
  "minecraft:skeleton_horse",
  "minecraft:zombie_horse"
]);

const SPEED_BLOCKS_PER_UNIT = 43.17;
const RAYCAST_DISTANCE = 8;

function jumpHeight(strength) {
  const x = strength;
  return -0.6872 * x * x * x + 6.0244 * x * x + 0.5825 * x;
}

function findEquine(player) {
  const riding = player.getComponent("minecraft:riding");
  if (riding && riding.entity && EQUINE_TYPES.has(riding.entity.typeId)) {
    return riding.entity;
  }
  const hits = player.getEntitiesFromViewDirection({ maxDistance: RAYCAST_DISTANCE });
  for (const hit of hits) {
    if (EQUINE_TYPES.has(hit.entity.typeId)) {
      return hit.entity;
    }
  }
  return undefined;
}

function statLine(entity) {
  const name = entity.nameTag && entity.nameTag.length > 0
    ? entity.nameTag
    : entity.typeId.replace("minecraft:", "").replace(/_/g, " ");

  const health = entity.getComponent("minecraft:health");
  const movement = entity.getComponent("minecraft:movement");
  const jump = entity.getComponent("minecraft:horse.jump_strength");

  const lines = [`§6==[ ${name} ]==`];

  if (health) {
    lines.push(`§7Health: §f${health.currentValue}/${health.effectiveMax} §7(${(health.effectiveMax / 2).toFixed(1)} hearts)`);
  }
  if (movement) {
    const mps = movement.currentValue * SPEED_BLOCKS_PER_UNIT;
    lines.push(`§7Speed: §f${mps.toFixed(2)} blocks/sec §7(raw ${movement.currentValue.toFixed(4)})`);
  }
  if (jump) {
    lines.push(`§7Jump: §f${jumpHeight(jump.currentValue).toFixed(2)} blocks §7(raw ${jump.currentValue.toFixed(3)})`);
  } else {
    lines.push(`§7Jump: §ffixed (this variant has no jump_strength attribute)`);
  }
  return lines.join("\n§r");
}

function showStats(player) {
  const equine = findEquine(player);
  if (!equine) {
    player.sendMessage("§cNo horse, donkey or mule found. Look at one (or ride one) and try again.");
    return;
  }
  player.sendMessage(statLine(equine));
}

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "hs:stats") return;
  const player = event.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  showStats(player);
});

world.afterEvents.itemUse.subscribe((event) => {
  if (event.itemStack.typeId !== "minecraft:stick") return;
  showStats(event.source);
});
