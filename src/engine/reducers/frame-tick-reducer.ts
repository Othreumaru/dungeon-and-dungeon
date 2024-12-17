import type { Actions } from "../../protocol/actions.ts";
import type { State, Unit } from "../../protocol/state.ts";
import {
  isUnitActionCooldownReady,
  isUnitAnyActionCooldownReady,
  isUnitDoneMoving,
} from "../selectors.ts";
import { getUnchangedArray, getUnchangedObject } from "./compare-and-return.ts";

export const frameTickReducer = (
  state: State,
  action: Extract<Actions, { type: "action:frame-tick" }>
): State => {
  return getUnchangedObject(state, {
    ...state,
    units: getUnchangedArray(
      state.units,
      state.units
        .map((unit) => movingToStationary(unit, action.payload.frame))
        .map((unit) => cooldownReady(unit, action.payload.frame))
    ),
  });
};

const movingToStationary = (unit: Unit, frame: number): Unit => {
  if (!isUnitDoneMoving(unit, frame)) {
    return unit;
  }
  const path = unit.state.path;
  const lastPath = path[path.length - 1];
  return {
    ...unit,
    state: {
      type: "stationary",
      position: {
        x: lastPath.x,
        y: lastPath.y,
      },
      lookAt: {
        x: lastPath.x + 1,
        y: lastPath.y,
      },
    },
  };
};

const cooldownReady = (unit: Unit, frame: number): Unit => {
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
