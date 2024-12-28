import { distance2D } from "../../../libs/math/vector/distance.ts";
import { getUnitPosition } from "../../selectors.ts";
import type { UnitTickContext } from "../unit-types.ts";

export const stationaryAiToAttackingMeele = (
  ctx: UnitTickContext
): UnitTickContext => {
  if (ctx.unit.state.type !== "stationary") {
    return ctx;
  }
  if (ctx.unit.controller.type !== "ai") {
    return ctx;
  }
  const attackAction = ctx.unit.actions.find(
    (action) => action.name === "attack"
  );
  if (!attackAction || attackAction.state.type !== "ready") {
    return ctx;
  }

  const playersByDistance = ctx.state.units
    .filter((unit) => unit.controller.type === "player")
    .map(
      (playerUnit) =>
        [
          playerUnit,
          distance2D(
            getUnitPosition(playerUnit, ctx.state.tick),
            getUnitPosition(ctx.unit, ctx.state.tick)
          ),
        ] as const
    )
    .sort((a, b) => a[1] - b[1]);

  if (playersByDistance.length === 0) {
    return ctx;
  }

  const targetPlayerUnit = playersByDistance.filter((p) => {
    return p[1] <= 1;
  })[0];

  if (!targetPlayerUnit) {
    return ctx;
  }

  return {
    ...ctx,
    unit: {
      ...ctx.unit,
      state: {
        type: "attacking-melee",
        position: ctx.unit.state.position,
        lookAt: {
          type: "target:unit",
          unitId: targetPlayerUnit[0].id,
        },
        task: {
          start: ctx.state.tick,
          duration: attackAction.cooldown,
        },
        targetUnitId: targetPlayerUnit[0].id,
      },
      actions: ctx.unit.actions.map((unitAction) => {
        if (unitAction.name === "attack") {
          return {
            ...unitAction,
            state: {
              type: "cooldown",
              task: {
                start: ctx.state.tick,
                duration: attackAction.cooldown,
              },
            },
          };
        } else {
          return unitAction;
        }
      }),
    },
  };
};
