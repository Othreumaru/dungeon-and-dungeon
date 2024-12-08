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

export const StationaryUnit = z.object({
  type: z.literal("stationary"),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  lookAt: z.object({
    x: z.number(),
    y: z.number(),
  }),
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
});

export const UnitState = z.union([StationaryUnit, MovingUnit]);

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
export type UnitAction = z.infer<typeof UnitAction>;
export type UnitController = z.infer<typeof UnitController>;
export type UnitState = z.infer<typeof UnitState>;

const defaultUnitColor = "red";
const defaultUnitModel = "skeleton-minion";
const defaultUnitController: UnitController = {
  type: "player",
};
const defaultUnitActions: UnitAction[] = [
  {
    name: "move",
    cooldownSec: 8,
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
    x: 0,
    y: 1,
  },
};

export const createUnit = ({
  id,
  color = defaultUnitColor,
  model = defaultUnitModel,
  controller = defaultUnitController,
  actions = defaultUnitActions,
  state = defaultUnitState,
}: {
  id: string;
  color?: string;
  model?: string;
  controller?: UnitController;
  actions?: UnitAction[];
  state?: UnitState;
}): Unit => ({
  id,
  color,
  model,
  controller,
  actions,
  state,
});
