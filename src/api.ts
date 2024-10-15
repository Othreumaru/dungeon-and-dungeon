type BaseUnit = {
  id: string;
  color: string;
};

export type Unit =
  | (BaseUnit & {
      type: "stationary";
      position: {
        x: number;
        y: number;
      };
      lookAt: {
        x: number;
        y: number;
      };
    })
  | (BaseUnit & {
      type: "moving";
      path: { frame: number; x: number; y: number }[];
    });

export type State = {
  units: Unit[];
};

export type MoveRequest = {
  type: "request:move";
  payload: {
    unitId: string;
    x: number;
    y: number;
  };
};

export type JoinRequest = {
  type: "request:join";
  payload: {
    userId: string;
  };
};

export type LeaveRequest = {
  type: "request:leave";
  payload: {
    userId: string;
  };
};

export type ChatRequest = {
  type: "request:chat";
  payload: {
    message: string;
  };
};

export type Requests = MoveRequest | JoinRequest | LeaveRequest | ChatRequest;

export type SyncAction = {
  type: "action:sync";
  payload: {
    state: State;
  };
};

export type MoveAction = {
  type: "action:move";
  payload: {
    unitId: string;
    frame: number;
    path: { frame: number; x: number; y: number }[];
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
