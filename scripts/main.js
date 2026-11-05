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

const bestMeasuredJumps = new Map();
const trackers = new Map();

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const riding = player.getComponent("minecraft:riding");
    const mount = riding && riding.entity;
    if (!mount || !mount.isValid || !EQUINE_TYPES.has(mount.typeId)) continue;
    const y = mount.location.y;
    if (mount.isOnGround) {
      const tracker = trackers.get(mount.id);
      if (tracker) {
        const height = tracker.maxY - tracker.baseY;
        if (height > 0.75) {
          const prev = bestMeasuredJumps.get(mount.id) || 0;
          if (height > prev) bestMeasuredJumps.set(mount.id, height);
        }
        tracker.baseY = y;
        tracker.maxY = y;
      } else {
        trackers.set(mount.id, { baseY: y, maxY: y });
      }
    } else {
      const tracker = trackers.get(mount.id);
      if (tracker && y > tracker.maxY) tracker.maxY = y;
    }
  }
}, 1);

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
    const measured = bestMeasuredJumps.get(entity.id);
    if (measured) {
      lines.push(`§7Jump: §f${measured.toFixed(2)} blocks §7(measured - hold jump to full charge for max)`);
    } else {
      lines.push(`§7Jump: §funknown §7- ride it and jump once, then check again`);
    }
  }
  return lines.join("\n§r");
}

function compactStats(entity) {
  const health = entity.getComponent("minecraft:health");
  const movement = entity.getComponent("minecraft:movement");
  const jump = entity.getComponent("minecraft:horse.jump_strength");

  const parts = [];
  if (health) {
    parts.push(`§c${health.currentValue}/${health.effectiveMax}❤`);
  }
  if (movement) {
    parts.push(`§b${(movement.currentValue * SPEED_BLOCKS_PER_UNIT).toFixed(1)} b/s`);
  }
  if (jump) {
    parts.push(`§a${jumpHeight(jump.currentValue).toFixed(1)} jump`);
  } else {
    const measured = bestMeasuredJumps.get(entity.id);
    parts.push(measured
      ? `§a${measured.toFixed(1)} jump`
      : `§8jump: ride+jump to measure`);
  }
  return parts.join(`§7 | `);
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    const equine = findEquine(player);
    if (!equine || !equine.isValid) continue;
    player.onScreenDisplay.setActionBar(compactStats(equine));
  }
}, 5);

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
