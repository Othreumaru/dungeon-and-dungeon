import type { UnitDespawnAction } from "../../protocol/actions.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import type { EngineApi } from "../../engine/engine.ts";

export const requestLeaveHandler = (
  playerContext: PlayerContext,
  _engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const userId = playerContext.userId;
  const action: UnitDespawnAction = {
    type: "action:unit-despawn",
    payload: {
      unitId: userId,
    },
  };
  serverApi.broadcast(action);
};
