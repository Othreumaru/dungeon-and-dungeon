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
        const distance = Math.sqrt(
          Math.pow(data.payload.x - unit.x, 2) +
            Math.pow(data.payload.y - unit.y, 2)
        );
        const action: MoveAction = {
          type: "action:move",
          payload: {
            path: [
              {
                x: unit.x,
                y: unit.y,
                frame: Date.now(),
              },
              {
                x: data.payload.x,
                y: data.payload.y,
                frame: Date.now() + distance * 100,
              },
            ],
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
              x: Math.floor(Math.random() * 9) - 5,
              y: Math.floor(Math.random() * 9) - 5,
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
