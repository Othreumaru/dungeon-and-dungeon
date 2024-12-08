import type { ChatAction } from "../../api";
import type { EngineApi } from "../../engine/engine";
import type { ChatRequest } from "../../protocol";
import type { PlayerContext, ServerApi } from "../server-api";

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
