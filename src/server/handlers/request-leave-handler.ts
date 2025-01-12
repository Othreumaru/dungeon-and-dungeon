import { createUnitDespawnAction } from "../../protocol/actions.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { createActionsResponse } from "../../protocol/responses.ts";

export const requestLeaveHandler = (
  playerContext: PlayerContext,
  engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const unitDespawnAction = createUnitDespawnAction(playerContext.userId);
  const { tick, index } = engineApi.scheduleAction(unitDespawnAction);
  serverApi.broadcast(createActionsResponse(tick, index, unitDespawnAction));
};
