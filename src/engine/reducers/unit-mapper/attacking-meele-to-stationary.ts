import { distance2D } from "../../../libs/math/vector/distance.ts";
import type { State, Unit } from "../../../protocol/state.ts";
import { getUnitPosition } from "../../selectors.ts";

export const attackingMeleeToStationary = (
  state: State,
  unit: Unit,
  frame: number
): Unit => {
  if (unit.state.type !== "attacking-melee") {
    return unit;
  }

  const targetUnitId = unit.state.targetUnitId;
  const targetUnit = state.units.find((unit) => unit.id === targetUnitId);

  if (!targetUnit) {
    return {
      ...unit,
      state: {
        type: "stationary",
        position: unit.state.position,
        lookAt: unit.state.lookAt,
      },
    };
  }
  const distanceToTarget = distance2D(
    unit.state.position,
    getUnitPosition(targetUnit, frame)?.position
  );

  if (distanceToTarget > 1) {
    return {
      ...unit,
      state: {
        type: "stationary",
        position: unit.state.position,
        lookAt: {
          type: "target:unit",
          unitId: targetUnitId,
        },
      },
    };
  }

  if (unit.state.endFrame > frame) {
    return unit;
  }

  return {
    ...unit,
    state: {
      type: "stationary",
      position: unit.state.position,
      lookAt: {
        type: "target:unit",
        unitId: targetUnitId,
      },
    },
  };
};
