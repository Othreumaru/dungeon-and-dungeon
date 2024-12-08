import { State, Unit } from "./protocol/state.ts";

export type SyncAction = {
  type: "action:sync";
  payload: {
    userId: string;
    state: State;
  };
};

export type MoveAction = {
  type: "action:move";
  payload: {
    unitId: string;
    startFrame: number;
    endFrame: number;
    path: { x: number; y: number }[];
  };
};

export type ChatAction = {
  type: "action:chat";
  payload: {
    userId: string;
    message: string;
  };
};

export type FrameTickAction = {
  type: "action:frame-tick";
  payload: {
    frame: number;
  };
};

export type UnitSpawnAction = {
  type: "action:unit-spawn";
  payload: {
    unit: Unit;
  };
};

export type UnitDespawnAction = {
  type: "action:unit-despawn";
  payload: {
    unitId: string;
  };
};
export type Actions =
  | SyncAction
  | MoveAction
  | ChatAction
  | FrameTickAction
  | UnitSpawnAction
  | UnitDespawnAction;
