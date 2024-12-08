import { describe, it } from "node:test";
import { reducer, initialState } from "./reducer.ts";
import type { FrameTickAction, MoveAction, Actions } from "../api.ts";
import { deepStrictEqual } from "node:assert";
import type { State } from "../protocol/state.ts";

describe("reducer", () => {
  it("should return the initial state", () => {
    deepStrictEqual(reducer(undefined, {} as Actions), initialState);
  });

  it("should handle move", () => {
    const initialState: State = {
      units: [
        {
          id: "1",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              x: 1,
              y: 0,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              x: 1,
              y: 0,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "red",
          controller: { type: "player" },
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
          state: {
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
          },
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              x: 1,
              y: 0,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "red",
          controller: { type: "player" },
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
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              x: 1,
              y: 0,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "red",
          controller: { type: "player" },
        },
      ],
    });
  });
});
