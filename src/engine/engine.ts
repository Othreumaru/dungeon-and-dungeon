import EventEmitter from "eventemitter3";
import type { Actions, FrameTickAction } from "../protocol/actions.ts";
import { initialState, rootReducer } from "./reducers/root-reducer.ts";
import type { RootState, State } from "../protocol/state.ts";
import { createFrameTickAction } from "../protocol/actions.ts";
import hash from "object-hash";

export type EngineApi = {
  scheduleAction: (action: Actions) => {
    tick: number;
    index: number;
  };
  getState: () => RootState;
  getServerStartTime: () => Date;
  onTick: (
    callback: (arg: {
      timestamp: Date;
      state: State;
      action: FrameTickAction;
    }) => void
  ) => void;
  offTick: (callback: () => void) => void;
};

export const createTick = (
  serverStartTime: Date,
  eventEmitter?: EventEmitter
) => {
  let totalTimeProcessed = 0;
  return (rootState: RootState, actionQueue: Actions[]) => {
    const now = new Date();
    const prevTickTime = serverStartTime.getTime() + totalTimeProcessed;
    let timeToProcess = now.getTime() - prevTickTime;
    while (timeToProcess > rootState.state.tickDurationMs) {
      timeToProcess -= rootState.state.tickDurationMs;
      totalTimeProcessed += rootState.state.tickDurationMs;
      const stateHash = hash(rootState, { algorithm: "md5" });
      const frameTickAction = createFrameTickAction(stateHash, actionQueue);
      rootState = rootReducer(rootState, frameTickAction);
      eventEmitter?.emit("tick", {
        timestamp: now,
        action: frameTickAction,
        state: rootState,
      });
    }
    return { timeToProcess, state: rootState };
  };
};

export const initEngine = () => {
  const eventEmitter: EventEmitter = new EventEmitter();
  let actionQueue: Actions[] = [];
  let rootState: RootState = {
    ...initialState,
    hash: hash(initialState, { algorithm: "md5" }),
  };
  const serverStartTime = getServerStartTime();
  const tick = createTick(getServerStartTime(), eventEmitter);

  console.log("Server engine will start at: ", serverStartTime.toISOString());

  const api: EngineApi = {
    scheduleAction: (action) => {
      actionQueue.push(action);
      return {
        tick: rootState.tick + 1,
        index: actionQueue.length - 1,
      };
    },
    getState: () => rootState,
    onTick: (callback) => {
      eventEmitter.on("tick", callback);
    },
    offTick: (callback) => {
      eventEmitter.off("tick", callback);
    },
    getServerStartTime: () => serverStartTime,
  };

  const tickInvoke = () => {
    const { timeToProcess, state: newState } = tick(rootState, actionQueue);
    actionQueue = [];
    rootState = newState;
    const nextTickTime = rootState.state.tickDurationMs - timeToProcess;
    setTimeout(tickInvoke, nextTickTime);
  };

  setTimeout(tickInvoke, serverStartTime.getTime() - Date.now());
  return api;
};

const getServerStartTime = () => {
  const now = new Date();
  now.setMilliseconds(0);
  now.setSeconds(now.getSeconds() + 1);
  return now;
};
