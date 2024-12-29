import EventEmitter from "eventemitter3";
import type { Actions } from "../protocol/actions.ts";
import { initialState, rootReducer } from "./reducers/root-reducer.ts";
import type { State } from "../protocol/state.ts";
import { createFrameTickAction } from "../protocol/actions.ts";

export type EngineApi = {
  applyAction: (action: Actions, emit: boolean) => void;
  getState: () => State;
  getServerStartTime: () => Date;
  onDispatch: (callback: (action: Actions) => void) => void;
  offDispatch: (callback: (action: Actions) => void) => void;
  onTick: (callback: () => void) => void;
  offTick: (callback: () => void) => void;
};

export const initEngine = () => {
  const eventEmitter: EventEmitter = new EventEmitter();
  let state: State = initialState;
  const serverStartTime = getServerStartTime();
  let totalTimeProcessed = 0;
  console.log("Server engine will start at: ", serverStartTime.toISOString());

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
    getServerStartTime: () => serverStartTime,
  };

  const tick = () => {
    const now = new Date();
    const prevTickTime = serverStartTime.getTime() + totalTimeProcessed;
    let timeToProcess = prevTickTime - now.getTime();
    console.log(now, ": Server engine tick processing time: ", timeToProcess);
    while (timeToProcess > state.tickDurationMs) {
      timeToProcess -= state.tickDurationMs;
      totalTimeProcessed += state.tickDurationMs;
      eventEmitter.emit("tick");
      api.applyAction(createFrameTickAction(), false);
    }
    const nextTickTime = state.tickDurationMs - timeToProcess;
    console.log(now, ": Server engine next tick in: ", nextTickTime);
    setTimeout(tick, nextTickTime);
  };

  setTimeout(tick, serverStartTime.getTime() - Date.now());

  return api;
};

const getServerStartTime = () => {
  const now = new Date();
  now.setMilliseconds(0);
  now.setSeconds(now.getSeconds() + 1);
  return now;
};
