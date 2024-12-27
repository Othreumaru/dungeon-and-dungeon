import { aStarSolver } from "../../../libs/a-star-solver/a-star-solver.ts";
import { distance2D } from "../../../libs/math/vector/distance.ts";
import type { State, Unit } from "../../../protocol/state.ts";
import { getPositionsAround, getUnitPosition } from "../../selectors.ts";

export const stationaryAiToMoving = (
  state: State,
  unit: Unit,
  frame: number
): Unit => {
  if (unit.state.type !== "stationary") {
    return unit;
  }
  if (unit.controller.type !== "ai") {
    return unit;
  }
  const moveAction = unit.actions.find((action) => action.name === "move");
  if (!moveAction || moveAction.state.type !== "ready") {
    return unit;
  }

  const playersByDistance = state.units
    .filter((unit) => unit.controller.type === "player")
    .map(
      (playerUnit) =>
        [
          playerUnit,
          distance2D(
            getUnitPosition(playerUnit, frame)?.position,
            getUnitPosition(unit, frame)?.position
          ),
        ] as const
    )
    .sort((a, b) => a[1] - b[1])
    .map(([playerUnit]) => playerUnit);

  if (playersByDistance.length === 0) {
    return unit;
  }

  const targetPlayerUnit = playersByDistance[0];

  const targetPosition = getUnitPosition(targetPlayerUnit, frame)?.position;

  if (!targetPosition) {
    return unit;
  }

  const inputGrid: boolean[][] = [...Array(12)].map(() =>
    [...Array(12)].map(() => true)
  );

  state.units.forEach((unit) => {
    const position =
      unit.state.type === "stationary"
        ? unit.state.position
        : unit.state.type === "moving"
          ? unit.state.path[unit.state.path.length - 1]
          : unit.state.position;
    if (position) {
      inputGrid[position.x][position.y] = false;
    }
  });

  const unitPosition = unit.state.position;

  const paths = getPositionsAround(targetPosition, 1)
    .filter((position) => {
      return inputGrid[position.x][position.y];
    })
    .map((targetPosition) => {
      return aStarSolver(inputGrid, unitPosition, targetPosition);
    })
    .filter((path) => path.length > 0)
    .sort((a, b) => {
      if (!a || !b) {
        return 0;
      }
      return a.length - b.length;
    });

  if (paths.length === 0 || paths[0].length < 2) {
    return unit;
  }

  return {
    ...unit,
    state: {
      type: "moving",
      startFrame: Date.now(),
      endFrame: Date.now() + 2000,
      path: paths[0],
      lookAt: unit.state.lookAt,
    },
    actions: unit.actions.map((unitAction) => {
      return unitAction.name === "move"
        ? {
            name: "move",
            cooldownSec: 2,
            state: {
              type: "cooldown",
              startFrame: Date.now(),
              endFrame: Date.now() + 2000,
            },
          }
        : unitAction;
    }),
  };
};
