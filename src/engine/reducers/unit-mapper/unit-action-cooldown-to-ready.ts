import type { Unit } from "../../../protocol/state.ts";
import {
  isUnitActionCooldownReady,
  isUnitAnyActionCooldownReady,
} from "../../selectors.ts";

export const unitActionCooldownToReady = (unit: Unit, frame: number): Unit => {
  if (!isUnitAnyActionCooldownReady(unit, frame)) {
    return unit;
  }
  return {
    ...unit,
    actions: unit.actions.map((unitAction) => {
      if (isUnitActionCooldownReady(unitAction, frame)) {
        return {
          ...unitAction,
          state: {
            type: "ready",
          },
        };
      }
      return unitAction;
    }),
  };
};
