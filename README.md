# Horse Stats (Bedrock behavior pack)

Shows the hidden stats (speed, jump height, health) of horses, donkeys, mules,
skeleton horses and zombie horses on a Bedrock Dedicated Server (tested against
BDS 1.26.62.1).

## How to use in-game

- **Right-click / use while holding a stick** while looking at a horse (or while riding one) — prints its stats in chat.
- **`/scriptevent hs:stats`** — same thing, no stick needed.

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
2. Register the pack in `valid_known_packs.json` (server root, next to
   `server.properties`). This file tells joining clients which packs exist —
   without an entry here, the server loads the pack but clients fail the join
   handshake (generic "Terracotta" error). Keep the existing vanilla entries and
   add yours, comma-separated:

   ```json
   {
     "id": "8f3c1a52-9b4d-4e77-a6c1-2d5f8a90b3c4",
     "version": [1, 0, 0],
     "path": "behavior_packs/HorseStats"
   }
   ```

   Adjust `path` to the actual folder name you used.
3. Enable the pack for your world. Either:
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
4. Restart the server. No experiments need to be enabled — the pack only uses
   the stable Script API.

## Notes

- Speed conversion uses the wiki factor 43.17 (internal units -> blocks/second);
  horse speed ranges 4.86 (min) to 14.57 (max) blocks/sec.
- Jump height is computed from the `minecraft:horse.jump_strength` attribute
  (0.4 = 1.15 blocks, 0.7 = 3.12, 1.0 = 5.92) and shown alongside the raw value.
- Skeleton/zombie horses have fixed movement values and may not report a
  jump_strength attribute; the pack says so instead of guessing.
