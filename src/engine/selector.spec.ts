import { describe, it } from "node:test";
import { getUnitPosition } from "./selectors.ts";
import { deepStrictEqual } from "node:assert";
import { createUnit } from "../protocol/state.ts";

describe("getUnitPosition", () => {
  it("should return stationary unit", () => {
    const unit = createUnit({
      id: "1",
      name: "unit1",
      state: {
        type: "stationary",
        position: {
          x: 10,
          y: 20,
        },
        lookAt: {
          type: "target:position",
          position: {
            x: 11,
            y: 20,
          },
        },
      },
    });

    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.type, "target:position");
    deepStrictEqual(result?.lookAt.position.x, 11);
    deepStrictEqual(result?.lookAt.position.y, 20);
  });

  it("should return undefined if path is empty", () => {
    const unit = createUnit({
      id: "1",
      name: "unit1",
      state: {
        type: "moving",
        path: [],
        startFrame: 100,
        endFrame: 200,
        lookAt: {
          type: "target:unit",
          unitId: "2",
        },
      },
    });
    const result = getUnitPosition(unit, 0);
    deepStrictEqual(result, undefined);
  });

  it("should return first path point if frame is before first frame", () => {
    const unit = createUnit({
      id: "1",
      name: "unit1",
      state: {
        type: "moving",
        path: [
          {
            x: 10,
            y: 20,
          },
        ],
        lookAt: {
          type: "target:unit",
          unitId: "2",
        },
        startFrame: 100,
        endFrame: 200,
      },
    });
    const result = getUnitPosition(unit, 50);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.type, "target:position");
    deepStrictEqual(result?.lookAt.position.x, 11);
    deepStrictEqual(result?.lookAt.position.y, 20);
  });

  it("should return last path point if frame is after last frame", () => {
    const state = createUnit({
      id: "1",
      name: "unit1",
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
        lookAt: {
          type: "target:unit",
          unitId: "2",
        },
        startFrame: 100,
        endFrame: 200,
      },
    });
    const result = getUnitPosition(state, 250);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 21);
    deepStrictEqual(result?.lookAt.type, "target:position");
    deepStrictEqual(result?.lookAt.position.x, 10);
    deepStrictEqual(result?.lookAt.position.y, 22);
  });

  it("should interpolate position", () => {
    const state = createUnit({
      id: "1",
      name: "unit1",
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
        lookAt: {
          type: "target:unit",
          unitId: "2",
        },
        startFrame: 100,
        endFrame: 200,
      },
    });
    const result = getUnitPosition(state, 150);
    deepStrictEqual(result?.position.x, 10);
    deepStrictEqual(result?.position.y, 20);
    deepStrictEqual(result?.lookAt.type, "target:position");
    deepStrictEqual(result?.lookAt.position.x, 10);
    deepStrictEqual(result?.lookAt.position.y, 20);
  });
});
