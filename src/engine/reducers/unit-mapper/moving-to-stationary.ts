import type { Unit } from "../../../protocol/state.ts";
import { isUnitDoneMoving } from "../../selectors.ts";

export const movingToStationary = (unit: Unit, frame: number): Unit => {
  if (!isUnitDoneMoving(unit, frame)) {
    return unit;
  }
  const path = unit.state.path;
  const lastPath = path[path.length - 1];
  return {
    ...unit,
    actions: unit.actions.map((unitAction) => {
      if (unitAction.name === "move") {
        return {
          ...unitAction,
          state: {
            type: "cooldown",
            startFrame: Date.now(),
            endFrame: Date.now() + unitAction.cooldownSec * 1000,
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
  };
};
