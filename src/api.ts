type PatrolState = {
  type: "patrol";
  startFrame: number;
  endFrame: number;
};

type AttackState = {
  type: "attack";
  target: string;
  startFrame: number;
  endFrame: number;
};

type PatrolAndAttackState = PatrolState | AttackState;

type PatrolAndAttack = {
  type: "patrol-and-attack";
  attackRange: number;
  state: PatrolAndAttackState;
};

type DefendAndAttack = {
  type: "defend-and-attack";
  defendPosition: { x: number; y: number };
  attackRange: number;
};

type AIControllerAlgorithm = PatrolAndAttack | DefendAndAttack;

type PlayerController = {
  type: "player";
};

type AIController = {
  type: "ai";
  algorithm: AIControllerAlgorithm;
};

type Controller = PlayerController | AIController;

type UnitActionReadyState = {
  type: "ready";
};

type UnitActionCooldownState = {
  type: "cooldown";
  startFrame: number;
  endFrame: number;
};

type UnitActionState = UnitActionReadyState | UnitActionCooldownState;

export type UnitAction = {
  name: string;
  cooldownSec: number;
  state: UnitActionState;
};

type BaseUnit = {
  id: string;
  color: string;
  model: "skeleton-minion" | "mage";
  controller: Controller;
  actions: UnitAction[];
  state: StationaryUnit | MovingUnit;
};

export type StationaryUnit = {
  type: "stationary";
  position: {
    x: number;
    y: number;
  };
  lookAt: {
    x: number;
    y: number;
  };
};

export type MovingUnit = {
  type: "moving";
  startFrame: number;
  endFrame: number;
  path: { x: number; y: number }[];
};

export type Unit = BaseUnit;

export type State = {
  units: Unit[];
};

export type MoveRequest = {
  type: "request:move";
  payload: {
    x: number;
    y: number;
  };
};

export type JoinRequest = {
  type: "request:join";
};

export type LeaveRequest = {
  type: "request:leave";
};

export type ChatRequest = {
  type: "request:chat";
  payload: {
    message: string;
  };
};

export type Requests = MoveRequest | ChatRequest;

export type ServerUpgradedRequest<T> = T & {
  payload: {
    session: {
      userId: string;
      name: string;
      email: string;
      image: string;
    };
  };
};

export type ServerUpgradedRequests =
  | ServerUpgradedRequest<JoinRequest>
  | ServerUpgradedRequest<MoveRequest>
  | ServerUpgradedRequest<LeaveRequest>
  | ServerUpgradedRequest<ChatRequest>;

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
