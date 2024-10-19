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
  if (unit.type === "stationary") {
    return {
      position: unit.position,
      lookAt: unit.lookAt,
    };
  }
  const path = unit.path;
  if (path.length === 0) {
    return undefined;
  }
  if (path[0].frame > frame) {
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
  if (path[path.length - 1].frame < frame) {
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
    if (path[i].frame <= frame && path[i + 1].frame >= frame) {
      const progress =
        (frame - path[i].frame) / (path[i + 1].frame - path[i].frame);
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
