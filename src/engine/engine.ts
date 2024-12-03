import EventEmitter from "eventemitter3";
import type { Actions, ServerUpgradedRequests, State } from "../api.ts";
import { initialState, reducer } from "./reducer.ts";
import { requestJoinHandler } from "./handlers/request-join-handler.ts";
import { requestLeaveHandler } from "./handlers/request-leave-handler.ts";
import { requestMoveHandler } from "./handlers/request-move-handler.ts";
import { tickHandler } from "./handlers/tick-handler.ts";

export const initEngine = (eventEmitter: EventEmitter) => {
  let state: State = initialState;

  setInterval(() => {
    state = reducer(state, {
      type: "action:frame-tick",
      payload: { frame: Date.now() },
    });
    tickHandler(state, eventEmitter);
  }, 100);

  eventEmitter.on("broadcast", (action: Actions) => {
    state = reducer(state, action);
  });

  eventEmitter.on("message", (data: ServerUpgradedRequests) => {
    console.log("Received message", data);
    switch (data.type) {
      case "request:move": {
        requestMoveHandler(data, state, eventEmitter);
        break;
      }
      case "request:join": {
        requestJoinHandler(data, state, eventEmitter);
        break;
      }
      case "request:leave": {
        requestLeaveHandler(data, state, eventEmitter);
        break;
      }
    }
  });
};
