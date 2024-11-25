import type { Unit } from "../api.ts";
import { normalize2D } from "../libs/math/vector/normalize.ts";

export const getUnitPosition = (
  unit: Unit,
  frame: number
):
  | {
      position: { x: number; y: number };
      lookAt: {
        x: number;
        y: number;
      };
    }
  | undefined => {
  if (unit.state.type === "stationary") {
    return {
      position: unit.state.position,
      lookAt: unit.state.lookAt,
    };
  }
  const path = unit.state.path;
  if (path.length === 0) {
    return undefined;
  }
  if (unit.state.endFrame > frame) {
    return {
      position: path[0],
      lookAt:
        path.length >= 2
          ? path[0]
          : {
              x: path[0].x + 1,
              y: path[0].y,
            },
    };
  }
  if (unit.state.endFrame < frame) {
    const lookAtVector = normalize2D({
      x: path[path.length - 1].x - path[path.length - 2].x,
      y: path[path.length - 1].y - path[path.length - 2].y,
    });
    const lastFrame = {
      position: path[path.length - 1],
      lookAt: {
        x: path[path.length - 1].x + lookAtVector.x,
        y: path[path.length - 1].y + lookAtVector.y,
      },
    };
    return lastFrame;
  }
  for (let i = 0; i < path.length - 1; i++) {
    const pathDuration = (unit.state.endFrame - unit.state.startFrame) / path.length;
    const iFrame = unit.state.startFrame + i * pathDuration;
    const nextFrame = unit.state.startFrame + (i + 1) * pathDuration;
    if (iFrame <= frame && nextFrame >= frame) {
      const progress = (frame - iFrame) / (nextFrame - iFrame);
      const lookAtVector = normalize2D({
        x: path[i].x - path[i + 1].x,
        y: path[i].y - path[i + 1].y,
      });
      const currentX = path[i].x + (path[i + 1].x - path[i].x) * progress;
      const currentY = path[i].y + (path[i + 1].y - path[i].y) * progress;
      return {
        position: {
          x: currentX,
          y: currentY,
        },
        lookAt: {
          x: currentX + lookAtVector.x,
          y: currentY + lookAtVector.y,
        },
      };
    }
  }
};
