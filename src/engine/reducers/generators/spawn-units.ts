import { createUnit, type RootState } from "../../../protocol/state.ts";
import hash from "object-hash";
import seedrandom from "seedrandom";

export const spawnUnits = (rootState: RootState) => {
  const countOfAIUnits = rootState.state.units.reduce(
    (sum, unit) => sum + (unit.controller.type === "ai" ? 1 : 0),
    0
  );

  const unitsToSpawn = Math.max(1 - countOfAIUnits, 0);

  if (unitsToSpawn === 0) {
    return [];
  }

  const rng = seedrandom(rootState.hash);

  const extraUnits = Array.from({
    length: Math.max(1 - countOfAIUnits, 1),
  }).map((_, index) =>
    createUnit({
      id: hash(
        {
          index,
          hash: rootState.hash,
        },
        { algorithm: "md5" }
      ),
      name: "Skeleton",
      state: {
        type: "stationary",
        position: {
          x: Math.floor(rng() * 9),
          y: Math.floor(rng() * 9),
        },
        lookAt: {
          type: "target:position",
          position: {
            x: 1,
            y: 0,
          },
        },
      },
      controller: {
        type: "ai",
      },
    })
  );

  return extraUnits;
};
