import EventEmitter from "eventemitter3";
import type {
  MoveAction,
  MoveRequest,
  ServerUpgradedRequest,
  State,
} from "../../api.ts";
import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";

export const requestMoveHandler = (
  data: ServerUpgradedRequest<MoveRequest>,
  state: State,
  eventEmitter: EventEmitter
) => {
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
};
