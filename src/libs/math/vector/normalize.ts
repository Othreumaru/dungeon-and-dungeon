import type { Vector2D, Vector3D } from "./types";

export const normalize2D = (vector: Vector2D): Vector2D => {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
};

export const normalize3D = (vector: Vector3D): Vector3D => {
  const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
};
