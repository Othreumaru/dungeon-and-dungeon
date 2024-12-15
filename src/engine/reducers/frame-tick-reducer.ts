import type { Actions } from "../../protocol/actions.ts";
import type { State, Unit } from "../../protocol/state.ts";
import {
  isAnyUnitDoneMoving,
  isUnitActionCooldownReady,
  isUnitAnyActionCooldownReady,
  isUnitDoneMoving,
} from "../selectors.ts";

export const frameTickReducer = (
  state: State,
  action: Extract<Actions, { type: "action:frame-tick" }>
): State => {
  const doneMoving = isAnyUnitDoneMoving(state.units, action.payload.frame);
  const actionCooldownReady = state.units.some((unit) =>
    isUnitAnyActionCooldownReady(unit, action.payload.frame)
  );
  return doneMoving || actionCooldownReady
    ? {
        ...state,
        units: state.units
          .map(
            (unit): Unit =>
              isUnitDoneMoving(unit, action.payload.frame)
                ? {
                    ...unit,
                    state: {
                      type: "stationary",
                      position: {
                        x: unit.state.path[unit.state.path.length - 1].x,
                        y: unit.state.path[unit.state.path.length - 1].y,
                      },
                      lookAt: {
                        x: unit.state.path[unit.state.path.length - 1].x + 1,
                        y: unit.state.path[unit.state.path.length - 1].y,
                      },
                    },
                  }
                : unit
          )
          .map((unit) => {
            if (isUnitAnyActionCooldownReady(unit, action.payload.frame)) {
              return {
                ...unit,
                actions: unit.actions.map((unitAction) => {
                  if (
                    isUnitActionCooldownReady(unitAction, action.payload.frame)
                  ) {
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
            }
            return unit;
          }),
      }
    : state;
};
