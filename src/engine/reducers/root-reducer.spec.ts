import { describe, it } from "node:test";
import { rootReducer, initialState } from "./root-reducer.ts";
import {
  //createFrameTickAction,
  type RootActions,
  //createMoveAction,
} from "../../protocol/actions.ts";
import { deepStrictEqual } from "node:assert";
//import type { State } from "../../protocol/state.ts";

describe("reducer", () => {
  it("should return the initial state", () => {
    deepStrictEqual(rootReducer(undefined, {} as RootActions), initialState);
  });

  /*it("should handle move", () => {
    const initialState: State = {
      tick: 0,
      tickDurationMs: 100,
      hash: "",
      units: [
        {
          id: "1",
          name: "unit1",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              type: "target:position",
              position: {
                x: 1,
                y: 0,
              },
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          name: "unit1",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              type: "target:position",
              position: {
                x: 1,
                y: 0,
              },
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "red",
          controller: { type: "player" },
        },
      ],
    };

    const moveAction = createFrameTickAction("", [
      createMoveAction("1", 100, 200, [
        {
          x: 10,
          y: 20,
        },
      ]),
    ]);

    const result = [moveAction].reduce(rootReducer, initialState);

    deepStrictEqual<State>(result, {
      tick: 0,
      tickDurationMs: 100,
      hash: "",
      units: [
        {
          id: "1",
          name: "unit1",
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
            lookAt: {
              type: "target:position",
              position: {
                x: 10,
                y: 20,
              },
            },
            task: {
              start: 0,
              duration: 10,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          name: "unit1",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              type: "target:position",
              position: {
                x: 1,
                y: 0,
              },
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "red",
          controller: { type: "player" },
        },
      ],
    });

    const frameAction = createFrameTickAction("", []);

    const result2 = [frameAction].reduce(rootReducer, result);

    deepStrictEqual<State>(result2, {
      tick: 1,
      tickDurationMs: 100,
      hash: "",
      units: [
        {
          id: "1",
          name: "unit1",
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
            lookAt: {
              type: "target:position",
              position: {
                x: 10,
                y: 20,
              },
            },
            task: {
              start: 0,
              duration: 10,
            },
          },
          model: "skeleton-minion",
          actions: [],
          color: "blue",
          controller: { type: "player" },
        },
        {
          id: "2",
          name: "unit1",
          state: {
            type: "stationary",
            position: {
              x: 0,
              y: 0,
            },
            lookAt: {
              type: "target:position",
              position: {
                x: 1,
                y: 0,
              },
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
  */
});
