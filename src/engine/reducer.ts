import type { Actions } from "../api.ts";
import type { State } from "../api.ts";

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
          unit.id === action.payload.unitId && unit.type === "stationary"
            ? {
                id: unit.id,
                color: unit.color,
                type: "moving",
                startFrame: action.payload.startFrame,
                endFrame: action.payload.endFrame,
                path: [
                  {
                    x: unit.position.x,
                    y: unit.position.y,
                  },
                  ...action.payload.path,
                ],
              }
            : unit
        ),
      };
    case "action:chat":
      return state;
    case "action:frame-tick": {
      const doneMoving = state.units.some(
        (unit) => unit.type === "moving" && unit.endFrame < action.payload.frame
      );
      return doneMoving
        ? {
            ...state,
            units: state.units.map((unit) =>
              unit.type === "moving" && unit.endFrame < action.payload.frame
                ? {
                    id: unit.id,
                    color: unit.color,
                    type: "stationary",
                    position: {
                      x: unit.path[unit.path.length - 1].x,
                      y: unit.path[unit.path.length - 1].y,
                    },
                    lookAt: {
                      x: unit.path[unit.path.length - 1].x + 1,
                      y: unit.path[unit.path.length - 1].y,
                    },
                  }
                : unit
            ),
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
