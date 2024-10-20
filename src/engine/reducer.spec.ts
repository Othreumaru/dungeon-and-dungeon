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
          position: {
            x: 0,
            y: 0,
          },
          lookAt: {
            x: 1,
            y: 0,
          },
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          position: {
            x: 0,
            y: 0,
          },
          lookAt: {
            x: 1,
            y: 0,
          },
          color: "red",
        },
      ],
    };

    const moveAction: MoveAction = {
      type: "action:move",
      payload: {
        unitId: "1",
        path: [
          {
            x: 10,
            y: 20,
          },
        ],
        startFrame: 100,
        endFrame: 200,
      },
    };

    const result = [moveAction].reduce(reducer, initialState);

    deepStrictEqual<State>(result, {
      units: [
        {
          id: "1",
          type: "moving",
          path: [
            {
              x: 0,
              y: 0,
            },
            {
              x: 10,
              y: 20,
            },
          ],
          startFrame: 100,
          endFrame: 200,
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          position: {
            x: 0,
            y: 0,
          },
          lookAt: {
            x: 1,
            y: 0,
          },
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

    deepStrictEqual<State>(result2, {
      ...result,
      units: [
        {
          id: "1",
          type: "stationary",
          position: {
            x: 10,
            y: 20,
          },
          lookAt: {
            x: 11,
            y: 20,
          },
          color: "blue",
        },
        {
          id: "2",
          type: "stationary",
          position: {
            x: 0,
            y: 0,
          },
          lookAt: {
            x: 1,
            y: 0,
          },
          color: "red",
        },
      ],
    });
  });
});
