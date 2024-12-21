import type { Actions } from "../../protocol/actions.ts";
import type { State } from "../../protocol/state.ts";
import { frameTickReducer } from "./frame-tick-reducer.ts";

export const initialState: State = {
  units: [],
};

export const rootReducer = (
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
          unit.id === action.payload.unitId &&
          unit.state.type === "stationary" &&
          unit.actions
            .filter((action) => action.name === "move")
            .every((action) => action.state.type === "ready")
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
      return frameTickReducer(state, action);
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
