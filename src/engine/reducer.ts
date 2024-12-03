import type { Actions, Unit } from "../api.ts";
import type { State } from "../api.ts";
import {
  isAnyUnitDoneMoving,
  isUnitActionCooldownReady,
  isUnitAnyActionCooldownReady,
  isUnitDoneMoving,
} from "./selectors.ts";

export const initialState: State = {
  units: [],
};

export const reducer = (
  state: State = initialState,
  action: Actions
): State => {
  switch (action.type) {
    case "action:sync":
      return action.payload.state;
    case "action:move":
      return {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.unitId && unit.state.type === "stationary"
            ? {
                id: unit.id,
                color: unit.color,
                model: unit.model,
                controller: unit.controller,
                actions: unit.actions.map((action) => {
                  if (action.name === "move") {
                    return {
                      ...action,
                      state: {
                        type: "cooldown",
                        startFrame: Date.now(),
                        endFrame: Date.now() + action.cooldownSec * 1000,
                      },
                    };
                  }
                  return action;
                }),
                state: {
                  type: "moving",
                  startFrame: action.payload.startFrame,
                  endFrame: action.payload.endFrame,
                  path: [
                    {
                      x: unit.state.position.x,
                      y: unit.state.position.y,
                    },
                    ...action.payload.path,
                  ],
                },
              }
            : unit
        ),
      };
    case "action:chat":
      return state;
    case "action:frame-tick": {
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
                            x:
                              unit.state.path[unit.state.path.length - 1].x + 1,
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
                        isUnitActionCooldownReady(
                          unitAction,
                          action.payload.frame
                        )
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
    }
    case "action:unit-spawn":
      return {
        ...state,
        units: [...state.units, action.payload.unit],
      };
    case "action:unit-despawn":
      return {
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload.unitId),
      };
    default:
      return state;
  }
};
