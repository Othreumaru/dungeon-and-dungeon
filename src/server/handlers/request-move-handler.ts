import { createMoveAction } from "../../protocol/actions.ts";
import type { EngineApi } from "../../engine/engine.ts";
import { aStarSolver } from "../../libs/a-star-solver/a-star-solver.ts";
import type { MoveRequest } from "../../protocol/requests.ts";
import type { PlayerContext, ServerApi } from "../server-api.ts";
import { createActionsResponse } from "../../protocol/responses.ts";

export const requestMoveHandler = (
  data: MoveRequest,
  playerContext: PlayerContext,
  engineApi: EngineApi,
  serverApi: ServerApi
) => {
  const unitId = playerContext.userId;
  const rootState = engineApi.getState();
  const unit = rootState.state.units.find((unit) => unit.id === unitId);
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
  const action = createMoveAction(
    unitId,
    Date.now(),
    Date.now() + path.length * 200,
    path.map((point) => ({
      x: point.x,
      y: point.y,
    }))
  );
  const { tick, index } = engineApi.scheduleAction(action);
  serverApi.broadcast(createActionsResponse(tick, index, action));
};
