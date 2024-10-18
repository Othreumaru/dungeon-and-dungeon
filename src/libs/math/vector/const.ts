import type { Vector2D, Vector3D } from "./types";

export const ZERO_VECTOR_2D: Vector2D = { x: 0, y: 0 };
export const ZERO_VECTOR_3D: Vector3D = { x: 0, y: 0, z: 0 };
export const UNIT_VECTOR_2D: Vector2D = { x: 1, y: 1 };
export const UNIT_VECTOR_3D: Vector3D = { x: 1, y: 1, z: 1 };
export const UP_VECTOR_2D: Vector2D = { x: 0, y: 1 };
export const UP_VECTOR_3D: Vector3D = { x: 0, y: 1, z: 0 };
export const DOWN_VECTOR_2D: Vector2D = { x: 0, y: -1 };
export const DOWN_VECTOR_3D: Vector3D = { x: 0, y: -1, z: 0 };
export const LEFT_VECTOR_2D: Vector2D = { x: -1, y: 0 };
export const LEFT_VECTOR_3D: Vector3D = { x: -1, y: 0, z: 0 };
export const RIGHT_VECTOR_2D: Vector2D = { x: 1, y: 0 };
export const RIGHT_VECTOR_3D: Vector3D = { x: 1, y: 0, z: 0 };
export const FORWARD_VECTOR_3D: Vector3D = { x: 0, y: 0, z: 1 };
export const BACKWARD_VECTOR_3D: Vector3D = { x: 0, y: 0, z: -1 };
export const NEGATIVE_UNIT_VECTOR_2D: Vector2D = { x: -1, y: -1 };
export const NEGATIVE_UNIT_VECTOR_3D: Vector3D = { x: -1, y: -1, z: -1 };
