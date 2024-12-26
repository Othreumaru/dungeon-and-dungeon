import { z } from "zod";

export const DefendAndAttack = z.object({
  type: z.literal("defend-and-attack"),
  defendPosition: z.object({
    x: z.number(),
    y: z.number(),
  }),
  attackRange: z.number(),
});

export const PatrolState = z.object({
  type: z.literal("patrol"),
  startFrame: z.number(),
  endFrame: z.number(),
});

export const AttackState = z.object({
  type: z.literal("attack"),
  target: z.string(),
  startFrame: z.number(),
  endFrame: z.number(),
});

export const PatrolAndAttackState = z.union([PatrolState, AttackState]);

export const PatrolAndAttack = z.object({
  type: z.literal("patrol-and-attack"),
  attackRange: z.number(),
  state: PatrolAndAttackState,
});

export const AiUnitControllerAlgorithm = z.union([
  PatrolAndAttack,
  DefendAndAttack,
]);

export const AiUnitController = z.object({
  type: z.literal("ai"),
  algorithm: AiUnitControllerAlgorithm,
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
  startFrame: z.number(),
  endFrame: z.number(),
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
  startFrame: z.number(),
  endFrame: z.number(),
  targetUnitId: z.string(),
});

export const UnitState = z.union([
  StationaryUnit,
  MovingUnit,
  AttackingMeleeUnit,
]);

export const CooldownUnitActionState = z.object({
  type: z.literal("cooldown"),
  startFrame: z.number(),
  endFrame: z.number(),
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
  cooldownSec: z.number(),
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
  units: z.array(Unit),
});

export type State = z.infer<typeof State>;
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
    cooldownSec: 4,
    state: {
      type: "ready",
    },
  },
  {
    name: "attack",
    cooldownSec: 2,
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
