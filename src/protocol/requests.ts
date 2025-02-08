import EventEmitter from "eventemitter3";
import { z } from "zod";

export const MoveRequest = z.object({
  type: z.literal("request:move"),
  payload: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const ChatRequest = z.object({
  type: z.literal("request:chat"),
  payload: z.object({
    message: z.string(),
  }),
});

export const SyncRequest = z.object({
  type: z.literal("request:sync"),
  payload: z.object({
    tick: z.number(),
  }),
});

export const ClientRequests = z.union([MoveRequest, ChatRequest, SyncRequest]);

export type MoveRequest = z.infer<typeof MoveRequest>;
export type ChatRequest = z.infer<typeof ChatRequest>;
export type Requests = z.infer<typeof ClientRequests>;

export const emitChatRequest = (eventEmitter: EventEmitter, message: string) =>
  eventEmitter.emit("request", {
    type: "request:chat",
    payload: { message },
  } satisfies ChatRequest);

export const emitMoveRequest = (
  eventEmitter: EventEmitter,
  x: number,
  y: number
) =>
  eventEmitter.emit("request", {
    type: "request:move",
    payload: { x, y },
  } satisfies MoveRequest);
