import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useServerContext } from "../../hooks/use-server-context";
import { MoveRequest } from "../../../api";
import { useUserId } from "../../hooks/use-user-id";

export const Board = ({
  count = 100,
  temp = new THREE.Object3D(),
  //   tempVector = new THREE.Vector3(),
  //   tempMatrix = new THREE.Matrix4(),
}: {
  count?: number;
  temp?: THREE.Object3D;
  tempVector?: THREE.Vector3;
  tempMatrix?: THREE.Matrix4;
}) => {
  const userId = useUserId();
  const eventEmitter = useServerContext();

  const boxRef = useRef<THREE.Mesh>(null);
  const mousePointerRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const instancedMeshRef = useRef<THREE.InstancedMesh<
    THREE.BoxGeometry,
    THREE.MeshStandardMaterial
  > | null>(null);

  useEffect(() => {
    // Set positions
    if (!instancedMeshRef.current) return;

    for (let i = 0; i < count; i++) {
      const row = Math.floor(Math.sqrt(count));
      const col = Math.ceil(count / row);
      temp.position.set((i % col) + 0.5, Math.floor(i / col) + 0.5, 0);
      temp.scale.set(0.9, 0.9, 0.1);
      temp.updateMatrix();

      instancedMeshRef.current.setMatrixAt(i, temp.matrix);
    }
    // Update the instance
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [count, temp]);

  return (
    <group>
      <instancedMesh
        receiveShadow
        ref={instancedMeshRef}
        args={[undefined, undefined, count]}
      >
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </instancedMesh>
      <mesh ref={boxRef}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <mesh
        onPointerMove={(event) => {
          mousePointerRef.current.x = event.point.x;
          mousePointerRef.current.y = event.point.y;
          boxRef.current?.position.set(
            mousePointerRef.current.x,
            mousePointerRef.current.y,
            0.1
          );
        }}
        onPointerUp={(event) => {
          eventEmitter.emit("request", {
            type: "request:move",
            payload: {
              unitId: userId,
              x: Math.floor(event.intersections[0].point.x),
              y: Math.floor(event.intersections[0].point.y),
            },
          } satisfies MoveRequest);
        }}
        position={[5, 5, 0.1]}
      >
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial
          color="lightblue"
          transparent={true}
          opacity={0.0001}
        />
      </mesh>
    </group>
  );
};
