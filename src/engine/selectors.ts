import type { MovingUnit, Task, Unit, UnitAction } from "../protocol/state.ts";
import type { Vector2D } from "../libs/math/vector/types.ts";

export const getUnitPosition = (
  unit: Unit,
  tick: number
): { x: number; y: number } | undefined => {
  if (unit.state.type === "stationary") {
    return unit.state.position;
  }

  if (unit.state.type === "attacking-melee") {
    return unit.state.position;
  }

  const path = unit.state.path;
  if (path.length === 0) {
    return undefined;
  }
  const task = unit.state.task;
  const taskEnd = task.start + task.duration;
  if (taskEnd > tick) {
    return path[0];
  }
  const lastFrame = path[path.length - 1];
  return lastFrame;
};

export const getPositionsAround = (
  position: { x: number; y: number },
  distance: number
): Vector2D[] => {
  const positions = [];
  for (let x = position.x - distance; x <= position.x + distance; x++) {
    if (x < 0) {
      continue;
    }
    for (let y = position.y - distance; y <= position.y + distance; y++) {
      if (y < 0) {
        continue;
      }
      if (Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2) > distance) {
        continue;
      }
      positions.push({ x, y });
    }
  }
  return positions;
};

export const isTaskDone = (task: Task, tick: number) =>
  task.start + task.duration < tick;

export const isUnitDoneMoving = (
  unit: Unit,
  tick: number
): unit is Unit & {
  state: MovingUnit;
} => unit.state.type === "moving" && isTaskDone(unit.state.task, tick);

export const isAnyUnitDoneMoving = (units: Unit[], frame: number) =>
  units.some((unit) => isUnitDoneMoving(unit, frame));

export const isUnitActionCooldownReady = (
  unitAction: UnitAction,
  tick: number
) =>
  unitAction.state.type === "cooldown" &&
  isTaskDone(unitAction.state.task, tick);

export const isUnitAnyActionCooldownReady = (unit: Unit, tick: number) =>
  unit.actions.some((unitAction) =>
    isUnitActionCooldownReady(unitAction, tick)
  );
