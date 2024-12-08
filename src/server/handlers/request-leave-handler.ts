import { createUnitDespawnAction } from "../../protocol/actions.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import type { EngineApi } from "../../engine/engine.ts";

export const requestLeaveHandler = (
  playerContext: PlayerContext,
  _engineApi: EngineApi,
  serverApi: ServerApi
) => {
  serverApi.broadcast(createUnitDespawnAction(playerContext.userId));
};
