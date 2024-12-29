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

    const position = getUnitPosition(unit, 0);
    deepStrictEqual(position?.x, 10);
    deepStrictEqual(position?.y, 20);
  });

  it("should return undefined if path is empty", () => {
    const unit = createUnit({
      id: "1",
      name: "unit1",
      state: {
        type: "moving",
        path: [],
        task: {
          start: 0,
          duration: 500,
        },
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
        task: {
          start: 100,
          duration: 500,
        },
      },
    });
    const position = getUnitPosition(unit, 50);
    deepStrictEqual(position?.x, 10);
    deepStrictEqual(position?.y, 20);
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
        task: {
          start: 100,
          duration: 500,
        },
      },
    });
    const position = getUnitPosition(state, 250);
    deepStrictEqual(position?.x, 10);
    deepStrictEqual(position?.y, 20);
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
        task: {
          start: 100,
          duration: 500,
        },
      },
    });
    const position = getUnitPosition(state, 150);
    deepStrictEqual(position?.x, 10);
    deepStrictEqual(position?.y, 20);
  });
});
