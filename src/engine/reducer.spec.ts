import { describe, it } from "node:test";
import { reducer, initialState } from "./reducer.ts";
import type { FrameTickAction, MoveAction, Actions } from "../api.ts";
import { deepStrictEqual } from "node:assert";
import type { State } from "../api.ts";

describe("reducer", () => {
  it("should return the initial state", () => {
    deepStrictEqual(reducer(undefined, {} as Actions), initialState);
  });

  it("should handle move", () => {
    const initialState: State = {
      units: [
        {
          id: "1",
          type: "stationary",
          x: 0,
          y: 0,
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          x: 0,
          y: 0,
          color: "red",
        },
      ],
    };

    const moveAction: MoveAction = {
      type: "action:move",
      payload: {
        unitId: "1",
        frame: 100,
        path: [
          {
            x: 10,
            y: 20,
            frame: 200,
          },
        ],
      },
    };

    const result = [moveAction].reduce(reducer, initialState);

    deepStrictEqual(result, {
      units: [
        {
          id: "1",
          type: "moving",
          path: [
            {
              x: 0,
              y: 0,
              frame: 100,
            },
            {
              x: 10,
              y: 20,
              frame: 200,
            },
          ],
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          x: 0,
          y: 0,
          color: "red",
        },
      ],
    });

    const frameAction: FrameTickAction = {
      type: "action:frame-tick",
      payload: {
        frame: 201,
      },
    };

    const result2 = [frameAction].reduce(reducer, result);

    deepStrictEqual(result2, {
      ...result,
      units: [
        {
          id: "1",
          type: "stationary",
          x: 10,
          y: 20,
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          x: 0,
          y: 0,
          color: "red",
        },
      ],
    });
  });
});
