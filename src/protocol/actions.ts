import { z } from "zod";
import { State, Unit } from "./state.ts";

export const SyncAction = z.object({
  type: z.literal("action:sync"),
  payload: z.object({
    userId: z.string(),
    state: State,
  }),
});

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

const ChatAction = z.object({
  type: z.literal("action:chat"),
  payload: z.object({
    userId: z.string(),
    message: z.string(),
  }),
});

const FrameTickAction = z.object({
  type: z.literal("action:frame-tick"),
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

const Actions = z.union([
  SyncAction,
  MoveAction,
  ChatAction,
  FrameTickAction,
  UnitSpawnAction,
  UnitDespawnAction,
]);

type SyncAction = z.infer<typeof SyncAction>;
type MoveAction = z.infer<typeof MoveAction>;
type ChatAction = z.infer<typeof ChatAction>;
type FrameTickAction = z.infer<typeof FrameTickAction>;
type UnitSpawnAction = z.infer<typeof UnitSpawnAction>;
type UnitDespawnAction = z.infer<typeof UnitDespawnAction>;

export type Actions = z.infer<typeof Actions>;

export const createSyncAction = (userId: string, state: State): SyncAction => ({
  type: "action:sync",
  payload: {
    userId,
    state,
  },
});

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

export const createFrameTickAction = (): FrameTickAction => ({
  type: "action:frame-tick",
});

export const createUnitSpawnAction = (unit: Unit): UnitSpawnAction => ({
  type: "action:unit-spawn",
  payload: {
    unit,
  },
});

export const createChatAction = (
  userId: string,
  message: string
): ChatAction => ({
  type: "action:chat",
  payload: {
    userId,
    message,
  },
});

export const createUnitDespawnAction = (unitId: string): UnitDespawnAction => ({
  type: "action:unit-despawn",
  payload: {
    unitId,
  },
});
