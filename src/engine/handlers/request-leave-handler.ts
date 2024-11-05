import EventEmitter from "eventemitter3";
import type {
  LeaveRequest,
  ServerUpgradedRequest,
  State,
  UnitDespawnAction,
} from "../../api.ts";

export const requestLeaveHandler = (
  data: ServerUpgradedRequest<LeaveRequest>,
  _state: State,
  eventEmitter: EventEmitter
) => {
  const userId = data.payload.session.userId;
  const action: UnitDespawnAction = {
    type: "action:unit-despawn",
    payload: {
      unitId: userId,
    },
  };
  eventEmitter.emit("broadcast", action);
};
