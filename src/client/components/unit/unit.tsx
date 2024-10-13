import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { Unit as UnitType } from "../../../api";
import { getUnitPosition } from "../../../engine/selectors";
import { Mage } from "../mage/mage";

export const Unit = ({ unit }: { unit: UnitType }) => {
  const meshRef = useRef<Group>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const maybePosition = getUnitPosition(unit, Date.now());
    if (!maybePosition) return;
    const { x, y } = maybePosition;
    meshRef.current.position.x = x;
    meshRef.current.position.z = y;
  });

  return (
    <group ref={meshRef}>
      <Mage position={[0.5, 0, 0.25]} scale={[0.5, 0.5, 0.5]} />
    </group>
  );
};
