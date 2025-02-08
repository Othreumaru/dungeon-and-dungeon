import { z } from "zod";
import { RootState, Unit } from "./state.ts";

const MoveAction = z.object({
  type: z.literal("action:move"),
  payload: z.object({
    unitId: z.string(),
    startFrame: z.number(),
    endFrame: z.number(),
    path: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
      })
    ),
  }),
});

const UnitSpawnAction = z.object({
  type: z.literal("action:unit-spawn"),
  payload: z.object({
    unit: Unit,
  }),
});

const UnitDespawnAction = z.object({
  type: z.literal("action:unit-despawn"),
  payload: z.object({
    unitId: z.string(),
  }),
});

export const Actions = z.union([
  MoveAction,
  UnitSpawnAction,
  UnitDespawnAction,
]);

const SyncAction = z.object({
  type: z.literal("action:sync"),
  payload: z.object({
    state: RootState,
  }),
});

const FrameTickAction = z.object({
  type: z.literal("action:frame-tick"),
  payload: z.object({
    prevStateHash: z.string(),
    actions: z.array(Actions),
  }),
});

export const RootActions = z.union([SyncAction, FrameTickAction]);

type MoveAction = z.infer<typeof MoveAction>;
type UnitSpawnAction = z.infer<typeof UnitSpawnAction>;
type UnitDespawnAction = z.infer<typeof UnitDespawnAction>;

export type Actions = z.infer<typeof Actions>;
export type RootActions = z.infer<typeof RootActions>;

export const createMoveAction = (
  unitId: string,
  startFrame: number,
  endFrame: number,
  path: { x: number; y: number }[]
): MoveAction => ({
  type: "action:move",
  payload: {
    unitId,
    startFrame,
    endFrame,
    path,
  },
});

export type FrameTickAction = z.infer<typeof FrameTickAction>;

export const createFrameTickAction = (
  prevStateHash: string,
  actions: z.infer<typeof Actions>[]
): FrameTickAction => ({
  type: "action:frame-tick",
  payload: {
    prevStateHash,
    actions,
  },
});

export const createUnitSpawnAction = (unit: Unit): UnitSpawnAction => ({
  type: "action:unit-spawn",
  payload: {
    unit,
  },
});

export const createUnitDespawnAction = (unitId: string): UnitDespawnAction => ({
  type: "action:unit-despawn",
  payload: {
    unitId,
  },
});
