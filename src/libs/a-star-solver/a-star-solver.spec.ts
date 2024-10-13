import { describe, it } from "node:test";
import { aStarSolver } from "./a-star-solver.ts";
import { deepStrictEqual } from "node:assert";

describe("aStarSolver", () => {
  it("should return the correct path 1", () => {
    const inputGrid = [
      [true, true, true, true],
      [true, false, false, true],
      [true, true, true, true],
    ];
    const startPoint = { x: 0, y: 0 };
    const endPoint = { x: 3, y: 2 };

    const result = aStarSolver(inputGrid, startPoint, endPoint);

    deepStrictEqual(result, [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
    ]);
  });

  it("should return the correct path 2", () => {
    const inputGrid = [
      [true, true, true, true],
      [true, false, false, false],
      [true, true, true, true],
    ];
    const startPoint = { x: 0, y: 0 };
    const endPoint = { x: 3, y: 2 };

    const result = aStarSolver(inputGrid, startPoint, endPoint);

    deepStrictEqual(result, [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ]);
  });
});
