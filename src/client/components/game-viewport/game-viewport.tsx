import { Canvas } from "@react-three/fiber";
import { Board } from "../board/board";
import { useContext } from "react";
import { Unit } from "../unit/unit";
import { EngineContext } from "../../engine-context";

export const GameViewport = () => {
  const state = useContext(EngineContext);

  // console.log("rendering game viewport");

  return (
    <Canvas
      shadows={true}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        background: "lightgray",
      }}
      camera={{ position: [5, 6, 12], rotation: [1.7 * Math.PI, 0, 0] }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, -10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
        castShadow={true}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <group position={[0.5, 0, 0.5]}>
        {state.units.map((unit) => (
          <Unit key={unit.id} unit={unit} />
        ))}
      </group>
      <Board />
    </Canvas>
  );
};
