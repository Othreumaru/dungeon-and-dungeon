import type { Vector2D, Vector3D } from "./types";

export const vectorMultiplyScalar2D = (
  vector: Vector2D,
  scalar: number
): Vector2D => {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
  };
};

export const vectorMultiplyScalar3D = (
  vector: Vector3D,
  scalar: number
): Vector3D => {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  };
};

export const vectorMultiplyVector2D = (
  vector1: Vector2D,
  vector2: Vector2D
): Vector2D => {
  return {
    x: vector1.x * vector2.x,
    y: vector1.y * vector2.y,
  };
};

export const vectorMultiplyVector3D = (
  vector1: Vector3D,
  vector2: Vector3D
): Vector3D => {
  return {
    x: vector1.x * vector2.x,
    y: vector1.y * vector2.y,
    z: vector1.z * vector2.z,
  };
};
