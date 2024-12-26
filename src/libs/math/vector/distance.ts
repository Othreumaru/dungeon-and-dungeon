import type { Vector2D } from "./types";

export const distance2D = (
  a: Vector2D | undefined,
  b: Vector2D | undefined
): number => {
  if (!a || !b) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
};
