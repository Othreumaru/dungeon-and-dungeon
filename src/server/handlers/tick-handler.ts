import {
  createMoveAction,
  createUnitSpawnAction,
} from "../../protocol/actions.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";
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
          if (
            unit.controller.algorithm.state.type === "patrol" &&
            unit.state.type === "stationary" &&
            unit.controller.algorithm.state.endFrame < Date.now() &&
            unit.actions.some((action) => {
              return action.name === "move" && action.state.type === "ready";
            })
          ) {
            const randomPosition = {
              x: Math.floor(Math.random() * 9),
              y: Math.floor(Math.random() * 9),
            };
            const inputGrid: boolean[][] = [...Array(11)].map(() =>
              [...Array(11)].map(() => true)
            );

            const path = aStarSolver(
              inputGrid,
              { x: unit.state.position.x, y: unit.state.position.y },
              randomPosition
            );
            const action = createMoveAction(
              unit.id,
              Date.now(),
              Date.now() + 200 * path.length,
              path
            );
            serverApi.broadcast(action);
          }
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
