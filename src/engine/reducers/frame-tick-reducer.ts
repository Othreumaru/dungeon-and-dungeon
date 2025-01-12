import { type RootState } from "../../protocol/state.ts";
import { getUnchangedArray, getUnchangedObject } from "./compare-and-return.ts";
import { attackingMeleeToStationary } from "./unit-mapper/attacking-meele-to-stationary.ts";
import { movingToStationary } from "./unit-mapper/moving-to-stationary.ts";
import { stationaryAiToAttackingMeele } from "./unit-mapper/stationary-ai-to-attacking-meele.ts";
import { stationaryAiToMoving } from "./unit-mapper/stationary-ai-to-moving.ts";
import { unitActionCooldownToReady } from "./unit-mapper/unit-action-cooldown-to-ready.ts";

export const frameTickReducer = (
  rootState: RootState,
  unitId: string
): RootState => {
  return {
    ...rootState,
    state: getUnchangedObject(rootState.state, {
      ...rootState.state,
      units: getUnchangedArray(
        rootState.state.units,
        rootState.state.units.map((unit) => {
          if (unit.id !== unitId) {
            return unit;
          }
          return [{ rootState: rootState, unit }]
            .map(unitActionCooldownToReady)
            .map(movingToStationary)
            .map(attackingMeleeToStationary)
            .map(stationaryAiToAttackingMeele)
            .map(stationaryAiToMoving)[0].unit;
        })
      ),
    }),
  };
};
