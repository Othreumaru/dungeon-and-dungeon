import { describe, it } from "node:test";
import { distance2D } from "./distance.ts";
import { equal } from "node:assert";

describe("distance2D", () => {
  it("should return 0 for the same point", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 0 };

    equal(distance2D(a, b), 0, "distance should be 0");
  });

  it("should return 1 for (0, 0) and (1, 0)", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 0 };

    equal(distance2D(a, b), 1, "distance should be 1");
  });

  it("should return 1 for (0, 0) and (0, 1)", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 1 };

    equal(distance2D(a, b), 1, "distance should be 1");
  });

  it("should return 1 for (0, 0) and (1, 1)", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 1, y: 1 };

    equal(distance2D(a, b), Math.sqrt(2), "distance should be sqrt(2)");
  });

  it("should return 1 for (0, 0) and (-1, 0)", () => {
    const a = { x: 0, y: 0 };
    const b = { x: -1, y: 0 };

    equal(distance2D(a, b), 1, "distance should be 1");
  });
});
