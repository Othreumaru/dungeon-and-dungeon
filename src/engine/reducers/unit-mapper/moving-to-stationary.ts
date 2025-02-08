import { isUnitDoneMoving } from "../../selectors.ts";
import type { UnitTickContext } from "../unit-types.ts";

export const movingToStationary = (ctx: UnitTickContext): UnitTickContext => {
  if (!isUnitDoneMoving(ctx.unit, ctx.rootState.tick)) {
    return ctx;
  }
  const path = ctx.unit.state.path;
  const lastPath = path[path.length - 1];
  return {
    ...ctx,
    unit: {
      ...ctx.unit,
      actions: ctx.unit.actions.map((unitAction) => {
        if (unitAction.name === "move") {
          return {
            ...unitAction,
            state: {
              type: "cooldown",
              task: {
                start: ctx.rootState.tick,
                duration: unitAction.cooldown,
              },
            },
          };
        }
        return unitAction;
      }),
      state: {
        type: "stationary",
        position: {
          x: lastPath.x,
          y: lastPath.y,
        },
        lookAt: {
          type: "target:position",
          position: {
            x: lastPath.x + 1,
            y: lastPath.y,
          },
        },
      },
    },
  };
};
