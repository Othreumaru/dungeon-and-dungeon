import { distance2D } from "../../../libs/math/vector/distance.ts";
import type { State, Unit } from "../../../protocol/state.ts";
import { getUnitPosition } from "../../selectors.ts";

export const stationaryAiToAttackingMeele = (
  state: State,
  unit: Unit,
  frame: number
): Unit => {
  if (unit.state.type !== "stationary") {
    return unit;
  }
  if (unit.controller.type !== "ai") {
    return unit;
  }
  const attackAction = unit.actions.find((action) => action.name === "attack");
  if (!attackAction || attackAction.state.type !== "ready") {
    return unit;
  }

  const playersByDistance = state.units
    .filter((unit) => unit.controller.type === "player")
    .map(
      (playerUnit) =>
        [
          playerUnit,
          distance2D(
            getUnitPosition(playerUnit, frame)?.position,
            getUnitPosition(unit, frame)?.position
          ),
        ] as const
    )
    .sort((a, b) => a[1] - b[1]);

  if (playersByDistance.length === 0) {
    return unit;
  }

  const targetPlayerUnit = playersByDistance.filter((p) => {
    return p[1] <= 1;
  })[0];

  if (!targetPlayerUnit) {
    return unit;
  }

  return {
    ...unit,
    state: {
      type: "attacking-melee",
      position: unit.state.position,
      lookAt: {
        type: "target:unit",
        unitId: targetPlayerUnit[0].id,
      },
      startFrame: Date.now(),
      endFrame: Date.now() + 2000,
      targetUnitId: targetPlayerUnit[0].id,
    },
    actions: unit.actions.map((unitAction) => {
      if (unitAction.name === "attack") {
        return {
          ...unitAction,
          state: {
            type: "cooldown",
            startFrame: Date.now(),
            endFrame: Date.now() + 2000,
          },
        };
      } else {
        return unitAction;
      }
    }),
  };
};
