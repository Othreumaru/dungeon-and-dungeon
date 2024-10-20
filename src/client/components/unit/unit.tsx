import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MovingUnit, StationaryUnit, Unit as UnitType } from "../../../api";
import { Mage } from "../mage/mage";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  MotionPathControls,
  useMotion,
} from "../motion-path-controls/motion-path-controls";
import { PositionalAudio } from "@react-three/drei";

const MAGE_SCALE: THREE.Vector3 = new THREE.Vector3(0.5, 0.5, 0.5);
const MAGE_POSITION: THREE.Vector3 = new THREE.Vector3(0, -0.1, 0);
const MAGE_ROTATION: THREE.Euler = new THREE.Euler(0, 0, 0);

const MAX_MOTION_VALUE = 0.99999999;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const focusDamping = 0.1;
const maxSpeed = Infinity;
const eps = 0.00001;

export const Loop = ({
  startFrame,
  endFrame,
}: {
  startFrame: number;
  endFrame: number;
}) => {
  const motion = useMotion();
  useFrame((_, delta) => {
    const now = Date.now();
    if (now < startFrame) {
      motion.current = 0;
    } else if (now > endFrame) {
      motion.current = MAX_MOTION_VALUE;
      return;
    } else {
      // Set the current position along the curve, you can increment indiscriminately for a loop
      motion.current = clamp(
        (now - startFrame) / (endFrame - startFrame),
        0,
        1
      );
      // Look ahead on the curve
      const vec = motion.next.clone().sub(motion.point).normalize();
      const lookAtVec = motion.point
        .clone()
        .add(new THREE.Vector3(0.5, 0, 0.5))
        .add(vec);

      easing.dampLookAt(
        motion.object.current,
        lookAtVec,
        focusDamping,
        delta,
        maxSpeed,
        undefined,
        eps
      );
    }
  });
  return null;
};

const StationaryComponent = ({
  unit,
  unitRef,
}: {
  unit: StationaryUnit;
  unitRef: React.MutableRefObject<THREE.Object3D>;
}) => {
  useFrame((_, delta) => {
    unitRef.current.position.set(unit.position.x, 0, unit.position.y);
    easing.dampLookAt(
      unitRef.current,
      new THREE.Vector3(unit.lookAt.x, 0, unit.lookAt.y),
      focusDamping,
      delta,
      maxSpeed,
      undefined,
      eps
    );
    // unitRef.current.lookAt(new Vector3(unit.lookAt.x, 0, unit.lookAt.y));
  });
  return null;
};

const MovingComponent = ({
  unit,
  unitRef,
  audioRef,
}: {
  unit: MovingUnit;
  unitRef: React.MutableRefObject<THREE.Object3D>;
  audioRef: React.MutableRefObject<THREE.PositionalAudio>;
}) => {
  useEffect(() => {
    const currentAudioRef = audioRef.current;
    currentAudioRef.play();
    return () => {
      currentAudioRef.stop();
    };
  });

  const curves = useMemo(() => {
    const curves = unit.path.slice(0, -1).map((point, index) => {
      const currentPoint = new THREE.Vector3(point.x, 0, point.y);
      const nextPoint = new THREE.Vector3(
        unit.path[index + 1]?.x ?? point.x,
        0,
        unit.path[index + 1]?.y ?? point.y
      );

      return new THREE.CubicBezierCurve3(
        currentPoint,
        currentPoint,
        nextPoint,
        nextPoint
      );
    });
    return curves;
  }, [unit]);

  useEffect(() => {
    const currentUnitRef = unitRef.current;
    return () => {
      if (!currentUnitRef) {
        return;
      }
      currentUnitRef.position.set(
        unit.path[unit.path.length - 1].x,
        0,
        unit.path[unit.path.length - 1].y
      );
    };
  }, [unit, unitRef]);

  return (
    <MotionPathControls
      debug={true}
      smooth={false}
      damping={0}
      object={unitRef as React.MutableRefObject<THREE.Object3D>}
      curves={curves}
      position={[0, 0.2, 0]}
    >
      <Loop startFrame={unit.startFrame} endFrame={unit.endFrame} />
    </MotionPathControls>
  );
};

export const Unit = ({ unit }: { unit: UnitType; now?: number }) => {
  const unitRef = useRef<THREE.Group>(null);
  const audioRef = useRef<THREE.PositionalAudio>(null);

  useEffect(() => {
    audioRef.current?.setVolume(0.1);
  }, []);

  console.log("unit render");

  return (
    <group>
      <group ref={unitRef}>
        <Mage
          position={MAGE_POSITION}
          scale={MAGE_SCALE}
          rotation={MAGE_ROTATION}
        />
        <PositionalAudio
          ref={audioRef}
          url="./Steps_tiles-010.ogg"
          distance={1}
          loop={true}
        />
      </group>
      {unit.type === "moving" && (
        <MovingComponent
          unitRef={unitRef as React.MutableRefObject<THREE.Object3D>}
          audioRef={audioRef as React.MutableRefObject<THREE.PositionalAudio>}
          unit={unit}
        />
      )}
      {unit.type === "stationary" && (
        <StationaryComponent
          unitRef={unitRef as React.MutableRefObject<THREE.Object3D>}
          unit={unit}
        />
      )}
    </group>
  );
};
