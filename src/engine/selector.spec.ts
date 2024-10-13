import { describe, it } from "node:test";
import { getUnitPosition } from "./selectors.ts";
import { deepStrictEqual } from "node:assert";
import type { Unit } from "../api.ts";

describe("getUnitPosition", () => {
  it("should return stationary unit", () => {
    const unit: Unit = {
      id: "1",
      type: "stationary",
      x: 10,
      y: 20,
      color: "blue",
    };

    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result?.x, 10);
    deepStrictEqual(result?.y, 20);
  });

  it("should return undefined if path is empty", () => {
    const unit: Unit = {
      id: "1",
      type: "moving",
      path: [],
      color: "blue",
    };
    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result, undefined);
  });

  it("should return first path point if frame is before first frame", () => {
    const unit: Unit = {
      id: "1",
      type: "moving",
      path: [
        {
          x: 10,
          y: 20,
          frame: 100,
        },
      ],
      color: "blue",
    };
    const result = getUnitPosition(unit, 50);
    deepStrictEqual(result?.x, 10);
    deepStrictEqual(result?.y, 20);
  });

  it("should return last path point if frame is after last frame", () => {
    const state: Unit = {
      id: "1",
      type: "moving",
      path: [
        {
          x: 10,
          y: 20,
          frame: 100,
        },
        {
          x: 20,
          y: 30,
          frame: 200,
        },
      ],
      color: "blue",
    };
    const result = getUnitPosition(state, 250);
    deepStrictEqual(result?.x, 20);
    deepStrictEqual(result?.y, 30);
  });

  it("should interpolate position", () => {
    const state: Unit = {
      id: "1",
      type: "moving",
      path: [
        {
          x: 10,
          y: 20,
          frame: 100,
        },
        {
          x: 20,
          y: 30,
          frame: 200,
        },
      ],
      color: "blue",
    };
    const result = getUnitPosition(state, 150);
    deepStrictEqual(result?.x, 15);
    deepStrictEqual(result?.y, 25);
  });
});
