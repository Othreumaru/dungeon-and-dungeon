import {
  isUnitActionCooldownReady,
  isUnitAnyActionCooldownReady,
} from "../../selectors.ts";
import type { UnitTickContext } from "../unit-types.ts";

export const unitActionCooldownToReady = (
  ctx: UnitTickContext
): UnitTickContext => {
  if (!isUnitAnyActionCooldownReady(ctx.unit, ctx.rootState.tick)) {
    return ctx;
  }
  return {
    ...ctx,
    unit: {
      ...ctx.unit,
      actions: ctx.unit.actions.map((unitAction) => {
        if (isUnitActionCooldownReady(unitAction, ctx.rootState.tick)) {
          return {
            ...unitAction,
            state: {
              type: "ready",
            },
          };
        }
        return unitAction;
      }),
    },
  };
};
