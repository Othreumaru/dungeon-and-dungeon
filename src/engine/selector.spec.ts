import { describe, it } from "node:test";
import { getUnitPosition } from "./selectors.ts";
import { deepStrictEqual } from "node:assert";
import type { Unit } from "../protocol/state.ts";

describe("getUnitPosition", () => {
  it("should return stationary unit", () => {
    const unit: Unit = {
      id: "1",
      state: {
        type: "stationary",
        position: {
          x: 10,
          y: 20,
        },
        lookAt: {
          x: 11,
          y: 20,
        },
      },
      color: "blue",
      actions: [],
      model: "skeleton-minion",
      controller: { type: "player" },
    };

    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.x, 11);
    deepStrictEqual(result?.lookAt.y, 20);
  });

  it("should return undefined if path is empty", () => {
    const unit: Unit = {
      id: "1",
      state: {
        type: "moving",
        path: [],
        startFrame: 100,
        endFrame: 200,
      },
      color: "blue",
      actions: [],
      model: "skeleton-minion",
      controller: { type: "player" },
    };
    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result, undefined);
  });

  it("should return first path point if frame is before first frame", () => {
    const unit: Unit = {
      id: "1",
      state: {
        type: "moving",
        path: [
          {
            x: 10,
            y: 20,
          },
        ],
        startFrame: 100,
        endFrame: 200,
      },
      actions: [],
      color: "blue",
      model: "skeleton-minion",
      controller: { type: "player" },
    };
    const result = getUnitPosition(unit, 50);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.x, 11);
    deepStrictEqual(result?.lookAt.y, 20);
  });

  it("should return last path point if frame is after last frame", () => {
    const state: Unit = {
      id: "1",
      state: {
        type: "moving",
        path: [
          {
            x: 10,
            y: 20,
          },
          {
            x: 10,
            y: 21,
          },
        ],
        startFrame: 100,
        endFrame: 200,
      },
      actions: [],
      color: "blue",
      model: "skeleton-minion",
      controller: { type: "player" },
    };
    const result = getUnitPosition(state, 250);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 21);
    deepStrictEqual(result?.lookAt.x, 10);
    deepStrictEqual(result?.lookAt.y, 22);
  });

  it("should interpolate position", () => {
    const state: Unit = {
      id: "1",
      state: {
        type: "moving",
        path: [
          {
            x: 10,
            y: 20,
          },
          {
            x: 20,
            y: 30,
          },
        ],
        startFrame: 100,
        endFrame: 200,
      },
      actions: [],
      color: "blue",
      model: "skeleton-minion",
      controller: { type: "player" },
    };
    const result = getUnitPosition(state, 150);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.x, 10);
    deepStrictEqual(result?.lookAt.y, 20);
  });
});
