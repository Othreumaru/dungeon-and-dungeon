import type {
  JoinRequest,
  ServerUpgradedRequest,
  State,
  SyncAction,
  UnitSpawnAction,
} from "../../api.ts";
import EventEmitter from "eventemitter3";

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
  data: ServerUpgradedRequest<JoinRequest>,
  state: State,
  eventEmitter: EventEmitter
) => {
  const userId = data.payload.session.userId;
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
        type: "stationary",
        model: "mage",
        position: randomPosition,
        lookAt: { x: randomPosition.x, y: randomPosition.y - 1 },
        color: colors[Math.floor(Math.random() * colors.length)],
      },
    },
  };
  eventEmitter.emit(`message:${userId}`, syncAction);
  eventEmitter.emit("broadcast", spawnAction);
};
