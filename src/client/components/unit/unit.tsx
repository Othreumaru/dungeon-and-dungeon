import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { MovingUnit, Unit as UnitType } from "../../../protocol/state";
import { Mage } from "../mage/mage";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import {
  MotionPathControls,
  useMotion,
} from "../motion-path-controls/motion-path-controls";
import { PositionalAudio } from "@react-three/drei";
import { clamp } from "../../../libs/math/clamp";
import { SkeletonMinion } from "../skeleton-minion/skeleton-minion";
import { Text } from "@react-three/drei";

const MAGE_SCALE: THREE.Vector3 = new THREE.Vector3(0.5, 0.5, 0.5);
const MAGE_POSITION: THREE.Vector3 = new THREE.Vector3(0, -0.1, 0);
const MAGE_ROTATION: THREE.Euler = new THREE.Euler(0, 0, 0);

const MAX_MOTION_VALUE = 0.99999999;

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

const MovingComponent = ({
  unit,
  unitRef,
}: {
  unit: MovingUnit;
  unitRef: React.MutableRefObject<THREE.Object3D>;
}) => {
  // console.log("moving component render");

  const curves = useMemo(() => {
    console.log("curves memo", unit.path);
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
  }, [unit.path]);

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

const CameraText = ({ text }: { text: string }) => {
  const textRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!textRef.current) {
      return;
    }
    textRef.current.lookAt(state.camera.position);
  });

  return (
    <Text
      ref={textRef}
      scale={[0.2, 0.2, 0.2]}
      position={[0, 1.3, 0]}
      color="white"
    >
      {text}
    </Text>
  );
};

const UnitComponent = ({ unit }: { unit: UnitType; now?: number }) => {
  const unitRef = useRef<THREE.Group>(null);
  const audioRef = useRef<THREE.PositionalAudio>(null);
  const unitApiRef = useRef<{
    playAnimation: (animation: string) => void;
    stopAnimation: (animation: string) => void;
  }>(null);

  useEffect(() => {
    if (unitRef.current) {
      unitRef.current.userData.unitId = unit.id;
    }
    audioRef.current?.setVolume(0);
  }, [unit.id]);

  useEffect(() => {
    if (audioRef.current?.isPlaying) {
      audioRef.current?.stop();
    }
    if (unit.state.type === "attacking-melee") {
      unitApiRef.current?.playAnimation("Unarmed_Melee_Attack_Punch_A");
    }
    if (unit.state.type === "stationary") {
      unitApiRef.current?.playAnimation("Idle");
    }
    if (unit.state.type === "moving") {
      audioRef.current?.play();
      unitApiRef.current?.playAnimation("Running_A");
    }
  }, [unit.state.type]);

  useFrame((_, delta) => {
    if (!unitRef.current) {
      return;
    }
    if (unit.state.type !== "stationary") {
      return;
    }
    unitRef.current.position.set(
      unit.state.position.x,
      0,
      unit.state.position.y
    );
    if (unit.state.lookAt.type === "target:position") {
      easing.dampLookAt(
        unitRef.current,
        new THREE.Vector3(
          unit.state.lookAt.position.x,
          0,
          unit.state.lookAt.position.y
        ),
        focusDamping,
        delta,
        maxSpeed,
        undefined,
        eps
      );
    } else if (unit.state.lookAt.type === "target:unit") {
      const targetUnitId = unit.state.lookAt.unitId;
      const targetUnitRef = unitRef.current.parent?.parent?.children.find(
        (child) => child.children[0].userData.unitId === targetUnitId
      );
      if (!targetUnitRef || !targetUnitRef.children[0]?.position) {
        return;
      }
      easing.dampLookAt(
        unitRef.current,
        targetUnitRef.children[0].position,
        focusDamping,
        delta,
        maxSpeed,
        undefined,
        eps
      );
    }
    // unitRef.current.lookAt(new Vector3(unit.lookAt.x, 0, unit.lookAt.y));
  });

  console.log(`unit render (name: ${unit.name} id: ${unit.id})`);

  return (
    <group>
      <group ref={unitRef}>
        <CameraText text={unit.name} />
        {unit.model === "skeleton-minion" && (
          <SkeletonMinion
            ref={unitApiRef}
            position={MAGE_POSITION}
            scale={MAGE_SCALE}
            rotation={MAGE_ROTATION}
          />
        )}
        {unit.model === "mage" && (
          <Mage
            ref={unitApiRef}
            position={MAGE_POSITION}
            scale={MAGE_SCALE}
            rotation={MAGE_ROTATION}
          />
        )}
        <PositionalAudio
          ref={audioRef}
          url="./Steps_tiles-010.ogg"
          distance={1}
          loop={true}
        />
      </group>
      {unit.state.type === "moving" && (
        <MovingComponent
          unitRef={unitRef as React.MutableRefObject<THREE.Object3D>}
          unit={unit.state}
        />
      )}
    </group>
  );
};

export const Unit = React.memo(UnitComponent);
