import type { ChatAction } from "../../api.ts";
import type { EngineApi } from "../../engine/engine.ts";
import type { ChatRequest } from "../../protocol/requests.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";

export const requestChatHandler = (
  request: ChatRequest,
  playerContext: PlayerContext,
  _engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const chatAction: ChatAction = {
    type: "action:chat",
    payload: {
      userId: playerContext.userId,
      message: request.payload.message,
    },
  };
  serverApi.broadcast(chatAction);
};
