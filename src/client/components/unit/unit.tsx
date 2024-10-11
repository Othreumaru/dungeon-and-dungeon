import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Unit as UnitType } from "../../../api";
import { getUnitPosition } from "../../../engine/selectors";

export const Unit = ({ unit }: { unit: UnitType }) => {
  const meshRef = useRef<Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const maybePosition = getUnitPosition(unit, Date.now());
    if (!maybePosition) return;
    const { x, y } = maybePosition;
    meshRef.current.position.x = x;
    meshRef.current.position.y = y;
  });

  return (
    <group ref={meshRef}>
      <mesh position={[0.5, 0.5, 0.25]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={unit.color} />
      </mesh>
    </group>
  );
};
