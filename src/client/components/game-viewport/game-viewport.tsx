import { Board } from "../board/board";
import { useContext } from "react";
import { Unit } from "../unit/unit";
import { EngineContext } from "../../engine-context";
import { useFrame } from "@react-three/fiber";
import { context } from "./update-game-viewport";

export const GameViewport = () => {
  const { rootState, serverStartTime } = useContext(EngineContext);

  // console.log("rendering game viewport");

  useFrame(context.updateGameViewport);

  return (
    <>
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
        {rootState.state.units.map((unit) => (
          <Unit
            key={unit.id}
            unit={unit}
            tickDurationMs={rootState.state.tickDurationMs}
            serverStartTime={serverStartTime}
          />
        ))}
      </group>
      <Board />
    </>
  );
};
