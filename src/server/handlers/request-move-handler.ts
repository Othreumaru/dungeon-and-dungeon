import type { MoveAction } from "../../api.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";
import type { MoveRequest } from "../../protocol/requests.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";

export const requestMoveHandler = (
  data: MoveRequest,
  playerContext: PlayerContext,
  engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const unitId = playerContext.userId;
  const state = engineApi.getState();
  const unit = state.units.find((unit) => unit.id === unitId);
  if (!unit) {
    console.warn(`Unit "${unitId}" not found`);
    return;
  }
  if (unit.state.type === "moving") {
    console.warn(`Unit "${unitId}" is already moving`);
    return;
  }
  const inputGrid: boolean[][] = [...Array(10)].map(() =>
    [...Array(10)].map(() => true)
  );
  const path = aStarSolver(
    inputGrid,
    { x: unit.state.position.x, y: unit.state.position.y },
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
  serverApi.broadcast(action);
};
