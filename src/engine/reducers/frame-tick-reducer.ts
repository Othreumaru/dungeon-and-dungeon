import type { Actions } from "../../protocol/actions.ts";
import type { State } from "../../protocol/state.ts";
import { getUnchangedArray, getUnchangedObject } from "./compare-and-return.ts";
import { attackingMeleeToStationary } from "./unit-mapper/attacking-meele-to-stationary.ts";
import { movingToStationary } from "./unit-mapper/moving-to-stationary.ts";
import { stationaryAiToAttackingMeele } from "./unit-mapper/stationary-ai-to-attacking-meele.ts";
import { stationaryAiToMoving } from "./unit-mapper/stationary-ai-to-moving.ts";
import { unitActionCooldownToReady } from "./unit-mapper/unit-action-cooldown-to-ready.ts";

export const frameTickReducer = (
  state: State,
  action: Extract<Actions, { type: "action:frame-tick" }>,
  unitId: string
): State => {
  return getUnchangedObject(state, {
    ...state,
    units: getUnchangedArray(
      state.units,
      state.units.map((unit) => {
        if (unit.id !== unitId) {
          return unit;
        }
        return [unit]
          .map((unit) => unitActionCooldownToReady(unit, action.payload.frame))
          .map((unit) => movingToStationary(unit, action.payload.frame))
          .map((unit) =>
            attackingMeleeToStationary(state, unit, action.payload.frame)
          )
          .map((unit) =>
            stationaryAiToAttackingMeele(state, unit, action.payload.frame)
          )
          .map((unit) =>
            stationaryAiToMoving(state, unit, action.payload.frame)
          )[0];
      })
    ),
  });
};
