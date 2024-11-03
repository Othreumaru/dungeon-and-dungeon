import EventEmitter from "eventemitter3";
import type {
  Actions,
  MoveAction,
  ServerUpgradedRequests,
  State,
  SyncAction,
  UnitDespawnAction,
  UnitSpawnAction,
} from "../api.ts";
import { initialState, reducer } from "./reducer.ts";
import { aStarSolver } from "../libs/a-star-solver/a-star-solver.ts";

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

export const initEngine = (eventEmitter: EventEmitter) => {
  let state: State = initialState;

  setInterval(() => {
    state = reducer(state, {
      type: "action:frame-tick",
      payload: { frame: Date.now() },
    });
  }, 100);

  eventEmitter.on("broadcast", (action: Actions) => {
    state = reducer(state, action);
  });

  eventEmitter.on("message", (data: ServerUpgradedRequests) => {
    console.log("Received message", data);
    switch (data.type) {
      case "request:move": {
        const unitId = data.payload.session.userId;
        const unit = state.units.find((unit) => unit.id === unitId);
        if (!unit) {
          console.warn(`Unit "${unitId}" not found`);
          return;
        }
        if (unit.type === "moving") {
          console.warn(`Unit "${unitId}" is already moving`);
          return;
        }
        const inputGrid: boolean[][] = [...Array(10)].map(() =>
          [...Array(10)].map(() => true)
        );
        const path = aStarSolver(
          inputGrid,
          { x: unit.position.x, y: unit.position.y },
          { x: data.payload.x, y: data.payload.y }
        );
        const action: MoveAction = {
          type: "action:move",
          payload: {
            path: path.map((point) => ({
              x: point.x,
              y: point.y,
            })),
            unitId: unitId,
            startFrame: Date.now(),
            endFrame: Date.now() + path.length * 200,
          },
        };
        eventEmitter.emit("broadcast", action);
        break;
      }
      case "request:join": {
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
              position: randomPosition,
              lookAt: { x: randomPosition.x, y: randomPosition.y - 1 },
              color: colors[Math.floor(Math.random() * colors.length)],
            },
          },
        };
        eventEmitter.emit(`message:${userId}`, syncAction);
        eventEmitter.emit("broadcast", spawnAction);
        break;
      }
      case "request:leave": {
        const userId = data.payload.session.userId;
        const action: UnitDespawnAction = {
          type: "action:unit-despawn",
          payload: {
            unitId: userId,
          },
        };
        eventEmitter.emit("broadcast", action);
        break;
      }
    }
  });
};
