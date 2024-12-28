import EventEmitter from "eventemitter3";
import type { Actions } from "../protocol/actions.ts";
import { initialState, rootReducer } from "./reducers/root-reducer.ts";
import type { State } from "../protocol/state.ts";
import { createFrameTickAction } from "../protocol/actions.ts";

export type EngineApi = {
  applyAction: (action: Actions, emit: boolean) => void;
  getState: () => State;
  onDispatch: (callback: (action: Actions) => void) => void;
  offDispatch: (callback: (action: Actions) => void) => void;
  onTick: (callback: () => void) => void;
  offTick: (callback: () => void) => void;
};

export const initEngine = () => {
  const eventEmitter: EventEmitter = new EventEmitter();
  let state: State = initialState;
  const serverStartTime = getServerStartTime();
  console.log("Server wngine will start at: ", serverStartTime.toISOString());

  const api: EngineApi = {
    applyAction: (action, emit = true) => {
      state = rootReducer(state, action);
      if (emit) {
        eventEmitter.emit("dispatch", action);
      }
    },
    getState: () => state,
    onDispatch: (callback) => {
      eventEmitter.on("dispatch", callback);
    },
    offDispatch: (callback) => {
      eventEmitter.off("dispatch", callback);
    },
    onTick: (callback) => {
      eventEmitter.on("tick", callback);
    },
    offTick: (callback) => {
      eventEmitter.off("tick", callback);
    },
  };

  setInterval(() => {
    const ticksSinceStart = Math.floor(
      (Date.now() - serverStartTime.getTime()) / 100
    );
    console.log("Server engine tick: ", ticksSinceStart);
    for (let i = 0; i < ticksSinceStart; i++) {
      eventEmitter.emit("tick");
      api.applyAction(createFrameTickAction(), false);
    }
    eventEmitter.emit("tick");
  }, 100);

  return api;
};

const getServerStartTime = () => {
  const now = new Date();
  now.setMilliseconds(0);
  now.setSeconds(now.getSeconds() + 1);
  return now;
};
