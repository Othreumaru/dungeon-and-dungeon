import { aStarSolver } from "../../../libs/a-star-solver/a-star-solver.ts";
import { distance2D } from "../../../libs/math/vector/distance.ts";
import { getPositionsAround, getUnitPosition } from "../../selectors.ts";
import type { UnitTickContext } from "../unit-types.ts";

export const stationaryAiToMoving = (ctx: UnitTickContext): UnitTickContext => {
  if (ctx.unit.state.type !== "stationary") {
    return ctx;
  }
  if (ctx.unit.controller.type !== "ai") {
    return ctx;
  }
  const moveAction = ctx.unit.actions.find((action) => action.name === "move");
  if (!moveAction || moveAction.state.type !== "ready") {
    return ctx;
  }

  const playersByDistance = ctx.state.units
    .filter((unit) => unit.controller.type === "player")
    .map(
      (playerUnit) =>
        [
          playerUnit,
          distance2D(
            getUnitPosition(playerUnit, ctx.state.tick),
            getUnitPosition(ctx.unit, ctx.state.tick)
          ),
        ] as const
    )
    .sort((a, b) => a[1] - b[1])
    .map(([playerUnit]) => playerUnit);

  if (playersByDistance.length === 0) {
    return ctx;
  }

  const targetPlayerUnit = playersByDistance[0];

  const targetPosition = getUnitPosition(targetPlayerUnit, ctx.state.tick);

  if (!targetPosition) {
    return ctx;
  }

  const inputGrid: boolean[][] = [...Array(12)].map(() =>
    [...Array(12)].map(() => true)
  );

  ctx.state.units.forEach((unit) => {
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

  const unitPosition = ctx.unit.state.position;

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
    return ctx;
  }

  return {
    ...ctx,
    unit: {
      ...ctx.unit,
      state: {
        type: "moving",
        task: {
          start: ctx.state.tick,
          duration: 10 * paths[0].length,
        },
        path: paths[0],
        lookAt: ctx.unit.state.lookAt,
      },
      actions: ctx.unit.actions.map((unitAction) => {
        return unitAction.name === "move"
          ? {
              ...unitAction,
              state: {
                type: "cooldown",
                task: {
                  start: ctx.state.tick,
                  duration: unitAction.cooldown,
                },
              },
            }
          : unitAction;
      }),
    },
  };
};
