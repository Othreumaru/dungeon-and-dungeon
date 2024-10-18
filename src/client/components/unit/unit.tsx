import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, Vector3 } from "three";
import { Unit as UnitType } from "../../../api";
import { getUnitPosition } from "../../../engine/selectors";
import { Mage } from "../mage/mage";
import { Line } from "@react-three/drei";

export const Unit = ({ unit }: { unit: UnitType }) => {
  const meshRef = useRef<Group>(null);
  const lookAtRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const maybePosition = getUnitPosition(unit, Date.now());
    if (!maybePosition) return;
    meshRef.current.position.x = maybePosition.position.x + 1;
    meshRef.current.position.z = maybePosition.position.y + 1;
    meshRef.current.position.y = -0.5;
    meshRef.current.lookAt(
      maybePosition.lookAt.x,
      -0.5,
      maybePosition.lookAt.y
    );
    if (!lookAtRef.current) return;
    lookAtRef.current.position.x = maybePosition.lookAt.x + 0.5;
    lookAtRef.current.position.y = 0.5;
    lookAtRef.current.position.z = maybePosition.lookAt.y + 0.5;
  });

  const points = unit.type === "moving" ? unit.path : [];
  console.log(points);

  return (
    <group>
      <group ref={meshRef} position={[0, 0, 0]}>
        <Mage
          rotation={[0, -Math.PI / 2, 0]}
          position={[0.5, 0.5, 0.5]}
          scale={[0.5, 0.5, 0.5]}
        />
      </group>
      <mesh position={[0.5, 0, 0.25]} ref={lookAtRef}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={"red"} />
      </mesh>
      <Line
        points={points.map((point) => new Vector3(point.x, 0.5, point.y))}
        linewidth={1}
        color="white"
      />
    </group>
  );
};
