import type { SyncAction, UnitSpawnAction } from "../../api.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import type { EngineApi } from "../../engine/engine.ts";

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
  const state = engineApi.getState();
  const userId = playerContext.userId;
  const syncAction: SyncAction = {
    type: "action:sync",
    payload: {
      userId,
      state,
    },
  };
  const randomPosition = {
    x: Math.floor(Math.random() * 9),
    y: Math.floor(Math.random() * 9),
  };
  const spawnAction: UnitSpawnAction = {
    type: "action:unit-spawn",
    payload: {
      unit: {
        id: userId,
        state: {
          type: "stationary",
          position: randomPosition,
          lookAt: { x: randomPosition.x, y: randomPosition.y - 1 },
        },
        controller: { type: "player" },
        model: "mage",
        actions: [
          {
            name: "move",
            cooldownSec: 8,
            state: {
              type: "ready",
            },
          },
        ],
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    },
  };
  serverApi.send(userId, syncAction);
  serverApi.broadcast(spawnAction);
};
