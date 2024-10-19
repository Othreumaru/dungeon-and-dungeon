import * as React from "react";
import { Vector3 } from "three";
import { Canvas, Props as CanvasProps } from "@react-three/fiber";
import {
  Environment,
  Grid,
  OrbitControls,
  Sky,
  TransformControls,
} from "@react-three/drei";

type Props = React.PropsWithChildren<
  CanvasProps & {
    cameraFov?: number;
    cameraPosition?: Vector3 | [number, number, number];
    controls?: boolean;
    lights?: boolean;
  }
>;

export const DemoScene = ({
  children,
  cameraFov = 75,
  cameraPosition = new Vector3(-5, 5, 5),
  controls = true,
  lights = true,
  ...restProps
}: Props) => (
  <div id="canvas-container" style={{ width: "100vw", height: "100vh" }}>
    <Canvas
      shadows
      camera={{ position: cameraPosition, fov: cameraFov }}
      {...restProps}
    >
      {children && (
        <TransformControls enabled={false} mode="translate">
          <group>{children}</group>
        </TransformControls>
      )}

      {lights && (
        <>
          <ambientLight intensity={0.8} />
          <pointLight intensity={1} position={[0, 6, 0]} />
          <spotLight
            intensity={1}
            position={[0, 6, 0]}
            angle={0.3}
            penumbra={1}
            castShadow
          />
        </>
      )}
      {controls && <OrbitControls makeDefault />}
      <color attach="background" args={["#000000"]} />
      <Grid
        position={[0, 0.01, 0]}
        fadeDistance={10}
        args={[10, 10]}
        infiniteGrid={true}
        cellColor={"#6f6f6f"}
        sectionColor={"#9d4b4b"}
      />
      <mesh position={[0, 0, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="city" />
    </Canvas>
  </div>
);
