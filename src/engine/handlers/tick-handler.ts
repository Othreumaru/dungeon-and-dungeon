import EventEmitter from "eventemitter3";
import type { State, UnitSpawnAction } from "../../api.ts";

export const tickHandler = (state: State, eventEmitter: EventEmitter) => {
  // console.log(eventEmitter);
  const countOfAIUnits = state.units.filter(
    (unit) => unit.controller.type === "ai"
  ).length;
  if (countOfAIUnits === 0) {
    const spawnAction: UnitSpawnAction = {
      type: "action:unit-spawn",
      payload: {
        unit: {
          id: "1",
          color: "red",
          state: {
            type: "moving",
            path: [
              {
                x: 10,
                y: 0,
              },
              {
                x: 10,
                y: 1,
              },
              {
                x: 10,
                y: 2,
              },
            ],
            startFrame: Date.now(),
            endFrame: Date.now() + 2000,
          },
          model: "skeleton-minion",
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
        },
      },
    };
    eventEmitter.emit("broadcast", spawnAction);
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
