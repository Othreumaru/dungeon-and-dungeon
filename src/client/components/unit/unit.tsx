import { useMemo, useRef } from "react";
import { CubicBezierCurve3, Euler, Group, Object3D, Vector3 } from "three";
import { Unit as UnitType } from "../../../api";
import { Mage } from "../mage/mage";
import { Box, MotionPathControls } from "@react-three/drei";
import { clamp } from "../../../libs/math/clamp";
// import { getUnitPosition } from "../../../engine/selectors";
// import { useFrame } from "@react-three/fiber";

const MAGE_SCALE: Vector3 = new Vector3(0.5, 0.5, 0.5);
const MAGE_POSITION: Vector3 = new Vector3(0, -0.1, 0);
const MAGE_ROTATION: Euler = new Euler(0, 0, 0);

const clamp0To100 = clamp(0, 100);

export const Unit = ({ unit, now }: { unit: UnitType; now: number }) => {
  const unitRef = useRef<Group>(null);
  const targetRef = useRef<Group>(null);

  const curves = useMemo(() => {
    if (unit.type === "moving") {
      const curves = unit.path.slice(0, -1).map((point, index) => {
        const currentPoint = new Vector3(point.x, 0, point.y);
        const nextPoint = new Vector3(
          unit.path[index + 1]?.x ?? point.x,
          0,
          unit.path[index + 1]?.y ?? point.y
        );

        return new CubicBezierCurve3(
          currentPoint,
          currentPoint,
          nextPoint,
          nextPoint
        );
      });
      return curves;
    } else {
      return [];
    }
  }, [unit]);

  const pointAhead = useMemo<[number, number, number]>(() => {
    if (curves.length) {
      const timeAhead = now + 5;
      const t = clamp0To100(timeAhead) / 100;

      const nowIndex = Math.floor(t * curves.length);
      if (nowIndex < 0) {
        const p = curves[0].getPoint(0);
        return [p.x, p.y, p.z];
      }
      if (nowIndex >= curves.length) {
        // extrapolate
        const p1 = curves[curves.length - 1].getPoint(0.5);
        const p2 = curves[curves.length - 1].getPoint(1);

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dz = p2.z - p1.z;

        const p = curves[curves.length - 1]
          .getPoint(1)
          .add(new Vector3(dx, dy, dz));
        return [p.x, p.y, p.z];
      }

      const frac = 1 / curves.length;
      const x1 = frac * nowIndex;
      const x2 = frac * (nowIndex + 1);

      const ratio = (t - x1) / (x2 - x1);

      const p = curves[nowIndex].getPoint(ratio);
      return [p.x, p.y, p.z];
    }
    return [0, 0, 0];
  }, [curves, now]);

  return (
    <group>
      <group ref={unitRef}>
        <Mage
          position={MAGE_POSITION}
          scale={MAGE_SCALE}
          rotation={MAGE_ROTATION}
        />
      </group>
      {curves.length && (
        <MotionPathControls
          debug={true}
          smooth={false}
          damping={0}
          focus={pointAhead}
          offset={clamp0To100(now) / 100}
          object={unitRef as React.MutableRefObject<Object3D>}
          curves={curves}
        />
      )}

      <Box args={[0.2, 0.2, 0.2]} position={[0, 0, 0]} material-color={"red"} />

      <object3D position={[0.5, 0, 0.5]} ref={targetRef} />
    </group>
  );
};
