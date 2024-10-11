import { Canvas } from "@react-three/fiber";
import { Board } from "../board/board";
import { useContext } from "react";
import { Unit } from "../unit/unit";
import { EngineContext } from "../../engine-context";

export const GameViewport = () => {
  const state = useContext(EngineContext);

  return (
    <Canvas
      shadows={true}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      camera={{ position: [0, -10, 10], rotation: [Math.PI / 4, 0, 0] }}
    >
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
        castShadow={true}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      {state.units.map((unit) => (
        <Unit key={unit.id} unit={unit} />
      ))}
      <Board />
    </Canvas>
  );
};
