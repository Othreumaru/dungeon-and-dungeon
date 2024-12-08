import { z } from "zod";
import { State, Unit } from "./state";

export const SyncAction = z.object({
  type: z.literal("action:sync"),
  payload: z.object({
    userId: z.string(),
    state: State,
  }),
});

export const MoveAction = z.object({
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

export const ChatAction = z.object({
  type: z.literal("action:chat"),
  payload: z.object({
    userId: z.string(),
    message: z.string(),
  }),
});

export const FrameTickAction = z.object({
  type: z.literal("action:frame-tick"),
  payload: z.object({
    frame: z.number(),
  }),
});

export const UnitSpawnAction = z.object({
  type: z.literal("action:unit-spawn"),
  payload: z.object({
    unit: Unit,
  }),
});

export const UnitDespawnAction = z.object({
  type: z.literal("action:unit-despawn"),
  payload: z.object({
    unitId: z.string(),
  }),
});

export const Actions = z.union([
  SyncAction,
  MoveAction,
  ChatAction,
  FrameTickAction,
  UnitSpawnAction,
  UnitDespawnAction,
]);

export type Actions = z.infer<typeof Actions>;
export type SyncAction = z.infer<typeof SyncAction>;
export type MoveAction = z.infer<typeof MoveAction>;
export type ChatAction = z.infer<typeof ChatAction>;
export type FrameTickAction = z.infer<typeof FrameTickAction>;
export type UnitSpawnAction = z.infer<typeof UnitSpawnAction>;
export type UnitDespawnAction = z.infer<typeof UnitDespawnAction>;
