import { createChatAction } from "../../protocol/actions.ts";
import type { EngineApi } from "../../engine/engine.ts";
import type { ChatRequest } from "../../protocol/requests.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";

export const requestChatHandler = (
  request: ChatRequest,
  playerContext: PlayerContext,
  _engineApi: EngineApi,
  serverApi: ServerApi
) => {
  serverApi.broadcast(
    createChatAction(playerContext.userId, request.payload.message)
  );
};
