import type { Unit } from "../api.ts";

export const getUnitPosition = (
  unit: Unit,
  frame: number
): { x: number; y: number } | undefined => {
  if (unit.type === "stationary") {
    return unit;
  }
  const path = unit.path;
  if (path.length === 0) {
    return undefined;
  }
  if (path[0].frame > frame) {
    return path[0];
  }
  if (path[path.length - 1].frame < frame) {
    return path[path.length - 1];
  }
  for (let i = 0; i < path.length - 1; i++) {
    if (path[i].frame <= frame && path[i + 1].frame >= frame) {
      const progress =
        (frame - path[i].frame) / (path[i + 1].frame - path[i].frame);
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * progress,
        y: path[i].y + (path[i + 1].y - path[i].y) * progress,
      };
    }
  }
};
