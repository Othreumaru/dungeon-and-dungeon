import type { EngineApi } from "../../engine/engine.ts";
import type { ChatRequest } from "../../protocol/requests.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import { createChatResponse } from "../../protocol/responses.ts";

export const requestChatHandler = (
  request: ChatRequest,
  playerContext: PlayerContext,
  _engineApi: EngineApi,
  serverApi: ServerApi
) => {
  serverApi.broadcast(
    createChatResponse(playerContext.userId, request.payload.message)
  );
};
