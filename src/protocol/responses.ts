import { z } from "zod";
import { RootState } from "./state.ts";
import { Actions } from "./actions.ts";

export const ChatResponse = z.object({
  type: z.literal("response:chat"),
  payload: z.object({
    userId: z.string(),
    message: z.string(),
  }),
});

export const SyncResponse = z.object({
  type: z.literal("response:sync"),
  payload: z.object({
    userId: z.string(),
    state: RootState,
    serverCurrentTime: z.number(),
    serverStartTime: z.number(),
  }),
});

export const ActionResponse = z.object({
  type: z.literal("response:action"),
  payload: z.object({
    tick: z.number(),
    index: z.number(),
    action: Actions,
  }),
});

export type ChatResponse = z.infer<typeof ChatResponse>;
export type SyncResponse = z.infer<typeof SyncResponse>;
export type ActionsResponse = z.infer<typeof ActionResponse>;

export type Responses = SyncResponse | ActionsResponse | ChatResponse;

export const createSyncResponse = (
  userId: string,
  state: RootState,
  serverCurrentTime: number,
  serverStartTime: number
): SyncResponse => ({
  type: "response:sync",
  payload: {
    userId,
    state,
    serverCurrentTime,
    serverStartTime,
  },
});

export const createActionsResponse = (
  tick: number,
  index: number,
  action: Actions
): ActionsResponse => ({
  type: "response:action",
  payload: {
    tick,
    index,
    action,
  },
});

export const createChatResponse = (
  userId: string,
  message: string
): ChatResponse => ({
  type: "response:chat",
  payload: {
    userId,
    message,
  },
});
