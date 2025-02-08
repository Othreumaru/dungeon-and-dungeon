import { z } from "zod";

export const Task = z.object({
  start: z.number(),
  duration: z.number(),
});

export const AiUnitController = z.object({
  type: z.literal("ai"),
});

export const PlayerUnitController = z.object({
  type: z.literal("player"),
});

export const UnitController = z.union([PlayerUnitController, AiUnitController]);

const LookAtPositionTarget = z.object({
  type: z.literal("target:position"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const LookAtUnitTarget = z.object({
  type: z.literal("target:unit"),
  unitId: z.string(),
});

const LookAtTarget = z.union([LookAtPositionTarget, LookAtUnitTarget]);

export const StationaryUnit = z.object({
  type: z.literal("stationary"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  lookAt: LookAtTarget,
});

export const MovingUnit = z.object({
  type: z.literal("moving"),
  task: Task,
  path: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
    })
  ),
  lookAt: LookAtTarget,
});

export const AttackingMeleeUnit = z.object({
  type: z.literal("attacking-melee"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  lookAt: LookAtTarget,
  task: Task,
  targetUnitId: z.string(),
});

export const UnitState = z.union([
  StationaryUnit,
  MovingUnit,
  AttackingMeleeUnit,
]);

export const CooldownUnitActionState = z.object({
  type: z.literal("cooldown"),
  task: Task,
});

export const ReadyUnitActionState = z.object({
  type: z.literal("ready"),
});

export const UnitActionState = z.union([
  CooldownUnitActionState,
  ReadyUnitActionState,
]);

export const UnitAction = z.object({
  name: z.string(),
  cooldown: z.number(),
  state: UnitActionState,
});

export const Unit = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  model: z.string(),
  controller: UnitController,
  actions: z.array(UnitAction),
  state: UnitState,
});

export const State = z.object({
  tickDurationMs: z.number(),
  units: z.array(Unit),
});

export const RootState = z.object({
  tick: z.number(),
  hash: z.string(),
  state: State,
});

export type Task = z.infer<typeof Task>;
export type State = z.infer<typeof State>;
export type RootState = z.infer<typeof RootState>;
export type Unit = z.infer<typeof Unit>;
export type MovingUnit = z.infer<typeof MovingUnit>;
export type StationaryUnit = z.infer<typeof StationaryUnit>;
export type AttackingMeleeUnit = z.infer<typeof AttackingMeleeUnit>;
export type UnitAction = z.infer<typeof UnitAction>;
export type UnitController = z.infer<typeof UnitController>;
export type UnitState = z.infer<typeof UnitState>;
export type LookAtTarget = z.infer<typeof LookAtTarget>;

const defaultUnitColor = "red";
const defaultUnitModel = "skeleton-minion";
const defaultUnitController: UnitController = {
  type: "player",
};
const defaultUnitActions: UnitAction[] = [
  {
    name: "move",
    cooldown: 40,
    state: {
      type: "ready",
    },
  },
  {
    name: "attack",
    cooldown: 20,
    state: {
      type: "ready",
    },
  },
];
const defaultUnitState: StationaryUnit = {
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
};

export const createUnit = ({
  id,
  name,
  color = defaultUnitColor,
  model = defaultUnitModel,
  controller = defaultUnitController,
  actions = defaultUnitActions,
  state = defaultUnitState,
}: {
  id: string;
  name: string;
  color?: string;
  model?: string;
  controller?: UnitController;
  actions?: UnitAction[];
  state?: UnitState;
}): Unit => ({
  id,
  name,
  color,
  model,
  controller,
  actions,
  state,
});
