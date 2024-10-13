import EventEmitter from "eventemitter3";
import type {
  Actions,
  MoveAction,
  Requests,
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

  eventEmitter.on("message", (data: Requests) => {
    console.log("Received message", data);
    switch (data.type) {
      case "request:move": {
        const unit = state.units.find(
          (unit) => unit.id === data.payload.unitId
        );
        if (!unit) {
          console.warn(`Unit "${data.payload.unitId}" not found`);
          return;
        }
        if (unit.type === "moving") {
          console.warn(`Unit "${data.payload.unitId}" is already moving`);
          return;
        }
        const inputGrid: boolean[][] = [...Array(10)].map(() =>
          [...Array(10)].map(() => true)
        );
        const path = aStarSolver(
          inputGrid,
          { x: unit.x, y: unit.y },
          { x: data.payload.x, y: data.payload.y }
        );
        const action: MoveAction = {
          type: "action:move",
          payload: {
            path: path.map((point, index) => ({
              x: point.x,
              y: point.y,
              frame: Date.now() + index * 100,
            })),
            unitId: data.payload.unitId,
            frame: Date.now(),
          },
        };
        eventEmitter.emit("broadcast", action);
        break;
      }
      case "request:join": {
        const syncAction: SyncAction = {
          type: "action:sync",
          payload: {
            state,
          },
        };
        const spawnAction: UnitSpawnAction = {
          type: "action:unit-spawn",
          payload: {
            unit: {
              id: data.payload.userId,
              type: "stationary",
              x: Math.floor(Math.random() * 9),
              y: Math.floor(Math.random() * 9),
              color: colors[Math.floor(Math.random() * colors.length)],
            },
          },
        };
        eventEmitter.emit(`message:${data.payload.userId}`, syncAction);
        eventEmitter.emit("broadcast", spawnAction);
        break;
      }
      case "request:leave": {
        const action: UnitDespawnAction = {
          type: "action:unit-despawn",
          payload: {
            unitId: data.payload.userId,
          },
        };
        eventEmitter.emit("broadcast", action);
        break;
      }
    }
  });
};
