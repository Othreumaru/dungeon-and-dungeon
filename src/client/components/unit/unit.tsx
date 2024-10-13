import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import { Unit as UnitType } from "../../../api";
import { getUnitPosition } from "../../../engine/selectors";
import { Mage } from "../mage/mage";

export const Unit = ({ unit }: { unit: UnitType }) => {
  const meshRef = useRef<Group>(null);
  const lookAtRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const maybePosition = getUnitPosition(unit, Date.now());
    if (!maybePosition) return;
    meshRef.current.position.x = maybePosition.position.x;
    meshRef.current.position.z = maybePosition.position.y;
    meshRef.current.lookAt(
      maybePosition.lookAt.x,
      meshRef.current.position.y,
      maybePosition.lookAt.y
    );
    if (!lookAtRef.current) return;
    lookAtRef.current.position.x = maybePosition.lookAt.x;
    lookAtRef.current.position.y = meshRef.current.position.y;
    lookAtRef.current.position.z = maybePosition.lookAt.y;
  });

  return (
    <group ref={meshRef}>
      <Mage position={[0.5, 0, 0.25]} scale={[0.5, 0.5, 0.5]} />
      <mesh position={[0.5, 0, 0.25]} ref={lookAtRef}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
    </group>
  );
};
