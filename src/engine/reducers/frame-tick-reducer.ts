import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";
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
        .map((unit) => stationaryToMoving(unit))
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

const stationaryToMoving = (unit: Unit): Unit => {
  if (unit.state.type !== "stationary") {
    return unit;
  }
  if (unit.controller.type !== "ai") {
    return unit;
  }
  const moveAction = unit.actions.find((action) => action.name === "move");
  if (!moveAction || moveAction.state.type !== "ready") {
    return unit;
  }
  const randomPosition = {
    x: Math.floor(Math.random() * 9),
    y: Math.floor(Math.random() * 9),
  };
  const inputGrid: boolean[][] = [...Array(11)].map(() =>
    [...Array(11)].map(() => true)
  );

  const path = aStarSolver(
    inputGrid,
    { x: unit.state.position.x, y: unit.state.position.y },
    randomPosition
  );

  if (path.length === 0) {
    return unit;
  }

  return {
    ...unit,
    state: {
      type: "moving",
      startFrame: Date.now(),
      endFrame: Date.now() + 2000,
      path,
    },
    actions: [
      ...unit.actions,
      {
        name: "move",
        cooldownSec: 2,
        state: {
          type: "cooldown",
          startFrame: Date.now(),
          endFrame: Date.now() + 2000,
        },
      },
    ],
  };
};
