import type { RootActions } from "../../protocol/actions.ts";
import type { RootState } from "../../protocol/state.ts";
import { getUnchangedArray, getUnchangedObject } from "./compare-and-return.ts";
import { frameTickReducer } from "./frame-tick-reducer.ts";
import { spawnUnits } from "./generators/spawn-units.ts";

export const initialState: RootState = {
  tick: 0,
  hash: "",
  state: {
    tickDurationMs: 100,
    units: [],
  },
};

export const rootReducer = (
  rootState: RootState = initialState,
  action: RootActions
): RootState => {
  switch (action.type) {
    case "action:sync":
      return action.payload.state;
    /* case "action:move":
      return {
        ...state,
        units: state.units.map((unit) =>
          unit.id === action.payload.unitId && unit.state.type === "stationary"
            ? {
                id: unit.id,
                name: unit.name,
                color: unit.color,
                model: unit.model,
                controller: unit.controller,
                actions: unit.actions.map((action) => {
                  if (action.name === "move") {
                    return {
                      ...action,
                      state: {
                        type: "cooldown",
                        task: {
                          start: state.tick,
                          duration: action.cooldown,
                        },
                      },
                    };
                  }
                  return action;
                }),
                state: {
                  type: "moving",
                  task: {
                    start: state.tick,
                    duration: 10 * action.payload.path.length,
                  },
                  path: [
                    {
                      x: unit.state.position.x,
                      y: unit.state.position.y,
                    },
                    ...action.payload.path,
                  ],
                  lookAt: {
                    type: "target:position",
                    position:
                      action.payload.path[action.payload.path.length - 1],
                  },
                },
              }
            : unit
        ),
      };
      */
    /*case "action:chat":
      return state;
      */
    case "action:frame-tick": {
      const unitIds = rootState.state.units.map((unit) => unit.id);
      const newState = unitIds.reduce(frameTickReducer, {
        ...rootState,
        tick: rootState.tick + 1,
        hash: action.payload.prevStateHash,
        state: getUnchangedObject(rootState.state, {
          ...rootState.state,
          units: getUnchangedArray(
            rootState.state.units,
            rootState.state.units.concat(spawnUnits(rootState))
          ),
        }),
      });

      return newState;
    }
    /*case "action:unit-spawn":
      return {
        ...state,
        units: [...state.units, action.payload.unit],
      };
      */
    /*case "action:unit-despawn":
      return {
        ...state,
        units: state.units.filter((unit) => unit.id !== action.payload.unitId),
      };*/
    default:
      return rootState;
  }
};
