import EventEmitter from "eventemitter3";
import type { Actions } from "../api.ts";
import { initialState, reducer } from "./reducer.ts";
import type { State } from "../protocol/state.ts";

export type EngineApi = {
  applyAction: (action: Actions, emit: boolean) => void;
  getState: () => State;
  onDispatch: (callback: (action: Actions) => void) => void;
  offDispatch: (callback: (action: Actions) => void) => void;
};

export const initEngine = () => {
  const eventEmitter: EventEmitter = new EventEmitter();
  let state: State = initialState;

  const api: EngineApi = {
    applyAction: (action, emit = true) => {
      state = reducer(state, action);
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
  };
  return api;
};
