import { createUnitSpawnAction } from "../../protocol/actions.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { createUnit } from "../../protocol/state.ts";
import { createActionsResponse } from "../../protocol/responses.ts";

const colors = [
  "blue",
  "red",
  "green",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "black",
  "white",
  "gray",
  "cyan",
  "magenta",
  "lime",
  "olive",
  "maroon",
  "navy",
  "teal",
  "silver",
  "gold",
  "coral",
  "indigo",
];

export const requestJoinHandler = (
  playerContext: PlayerContext,
  engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const userId = playerContext.userId;
  const randomPosition = {
    x: Math.floor(Math.random() * 9),
    y: Math.floor(Math.random() * 9),
  };
  const spawnAction = createUnitSpawnAction(
    createUnit({
      id: userId,
      name: playerContext.session.name,
      state: {
        type: "stationary",
        position: randomPosition,
        lookAt: {
          type: "target:position",
          position: {
            x: randomPosition.x,
            y: randomPosition.y - 1,
          },
        },
      },
      model: "mage",
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  );
  serverApi.sync(userId);
  const { tick, index } = engineApi.scheduleAction(spawnAction);
  serverApi.broadcast(createActionsResponse(tick, index, spawnAction));
};
