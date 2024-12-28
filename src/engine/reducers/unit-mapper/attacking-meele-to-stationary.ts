import { distance2D } from "../../../libs/math/vector/distance.ts";
import { getUnitPosition, isTaskDone } from "../../selectors.ts";
import type { UnitTickContext } from "../unit-types.ts";

export const attackingMeleeToStationary = (
  ctx: UnitTickContext
): UnitTickContext => {
  if (ctx.unit.state.type !== "attacking-melee") {
    return ctx;
  }

  const targetUnitId = ctx.unit.state.targetUnitId;
  const targetUnit = ctx.state.units.find((unit) => unit.id === targetUnitId);

  if (!targetUnit) {
    return {
      ...ctx,
      unit: {
        ...ctx.unit,
        state: {
          type: "stationary",
          position: ctx.unit.state.position,
          lookAt: ctx.unit.state.lookAt,
        },
      },
    };
  }
  const distanceToTarget = distance2D(
    ctx.unit.state.position,
    getUnitPosition(targetUnit, ctx.state.tick)
  );

  if (distanceToTarget > 1) {
    return {
      ...ctx,
      unit: {
        ...ctx.unit,
        state: {
          type: "stationary",
          position: ctx.unit.state.position,
          lookAt: {
            type: "target:unit",
            unitId: targetUnitId,
          },
        },
      },
    };
  }

  if (!isTaskDone(ctx.unit.state.task, ctx.state.tick)) {
    return ctx;
  }

  return {
    ...ctx,
    unit: {
      ...ctx.unit,
      state: {
        type: "stationary",
        position: ctx.unit.state.position,
        lookAt: {
          type: "target:unit",
          unitId: targetUnitId,
        },
      },
    },
  };
};
