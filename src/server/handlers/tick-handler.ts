import { createUnitSpawnAction } from "../../protocol/actions.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { v4 as uuidv4 } from "uuid";
import type { ServerApi } from "../server-api.ts";
import { createUnit } from "../../protocol/state.ts";

export const tickHandler = (engineApi: EngineApi, serverApi: ServerApi) => {
  const state = engineApi.getState();
  const countOfAIUnits = state.units.filter(
    (unit) => unit.controller.type === "ai"
  ).length;
  if (countOfAIUnits <= 2) {
    const spawnAction = createUnitSpawnAction(
      createUnit({
        id: uuidv4(),
        state: {
          type: "stationary",
          position: {
            x: Math.floor(Math.random() * 9),
            y: Math.floor(Math.random() * 9),
          },
          lookAt: {
            x: 1,
            y: 0,
          },
        },
        controller: {
          type: "ai",
          algorithm: {
            type: "patrol-and-attack",
            attackRange: 10,
            state: {
              type: "patrol",
              startFrame: Date.now(),
              endFrame: Date.now() + 2000,
            },
          },
        },
      })
    );

    serverApi.broadcast(spawnAction);
    return;
  }
  state.units.forEach((unit) => {
    if (unit.controller.type === "ai") {
      switch (unit.controller.algorithm.type) {
        case "patrol-and-attack": {
          // Implement patrol-and-attack logic
          break;
        }
        case "defend-and-attack": {
          // Implement defend-and-attack logic
          break;
        }
      }
    }
  });
};