import EventEmitter from "eventemitter3";
import type { MoveAction, State, UnitSpawnAction } from "../../api.ts";
import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";

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
          if (
            unit.controller.algorithm.state.type === "patrol" &&
            unit.state.type === "stationary" &&
            unit.controller.algorithm.state.endFrame < Date.now()
          ) {
            const randomPosition = {
              x: Math.floor(Math.random() * 9),
              y: Math.floor(Math.random() * 9),
            };
            const inputGrid: boolean[][] = [...Array(11)].map(() =>
              [...Array(11)].map(() => true)
            );
            console.log(unit.state.position, randomPosition);
            const path = aStarSolver(
              inputGrid,
              { x: unit.state.position.x, y: unit.state.position.y },
              randomPosition
            );
            const action: MoveAction = {
              type: "action:move",
              payload: {
                unitId: unit.id,
                startFrame: Date.now(),
                endFrame: Date.now() + 200 * path.length,
                path,
              },
            };
            eventEmitter.emit("broadcast", action);
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
