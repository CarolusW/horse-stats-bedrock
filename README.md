# Horse Stats (Bedrock behavior pack)

Shows the hidden stats (speed, jump height, health) of horses, donkeys, mules,
skeleton horses and zombie horses on a Bedrock Dedicated Server (tested against
BDS 1.26.62.1).

## How to use in-game

- **Right-click / use while holding a stick** while looking at a horse (or while riding one) — prints its stats in chat.
- **`/scriptevent hs:stats`** — same thing, no stick needed.
- **HUD:** whenever you look at (or ride) a horse, donkey or mule within 8 blocks,
  a compact live stat line is shown on the actionbar above the hotbar, e.g.
  `28/28❤ | 12.1 b/s | 4.0 jump`.

Output example:

```
==[ horse ]==
Health: 28/28 (14.0 hearts)
Speed: 12.10 blocks/sec (raw 0.2803)
Jump: 4.05 blocks (raw 0.812)
```

## Installation on BDS

1. Copy the `HorseStats` folder into your server's `behavior_packs/` directory,
   so you have `behavior_packs/HorseStats/manifest.json`.
2. Enable the pack for your world. Either:
   - Run the server once, then in the world folder open `world_behavior_packs.json`
     and add:

     ```json
     [
       {
         "pack_id": "8f3c1a52-9b4d-4e77-a6c1-2d5f8a90b3c4",
         "version": [1, 0, 0]
       }
     ]
     ```

   - Or from an operator client: Settings > Behavior Packs while the world is loaded.
3. Restart the server. No experiments need to be enabled — the pack only uses
   the stable Script API.

## Troubleshooting

- If clients can't join after enabling the pack, enable content logging in
  `server.properties` (`content-log-file-enabled=true` and
  `content-log-console-output-enabled=true`), restart, and check the server
  console/log during a join attempt — every pack error is written there.
- Some very old guides mention `valid_known_packs.json`; that file no longer
  exists in modern BDS and is not needed.

## Notes

- Speed conversion uses the wiki factor 43.17 (internal units -> blocks/second);
  horse speed ranges 4.86 (min) to 14.57 (max) blocks/sec.
- Jump: the Bedrock Script API does not expose the horse's raw
  `minecraft:horse.jump_strength` attribute, so the pack measures the real
  jump height instead: ride the horse, jump once (hold the jump button for a
  full charge to see the maximum), and the pack records the peak height in
  blocks. The measurement lasts for the current server session.
- Skeleton/zombie horses have fixed movement values; the pack says so
  instead of guessing.
