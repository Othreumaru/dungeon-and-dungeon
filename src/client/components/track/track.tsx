import { DoubleSide } from "three";

export type Props = {
  numOfTracks?: number;
} & JSX.IntrinsicElements["group"];

export const MetalPart = ({ ...rest }: JSX.IntrinsicElements["mesh"]) => {
  return (
    <mesh {...rest}>
      <boxGeometry args={[1, 0.1, 0.1]} />
      <meshStandardMaterial
        color="#b7b7b7"
        roughness={0.2}
        metalness={1}
        side={DoubleSide}
      />
    </mesh>
  );
};

export const Track = ({ numOfTracks = 4, ...rest }: Props) => {
  const woodColor = "#8B4513";
  return (
    <group {...rest}>
      <MetalPart position={[0, 0.1, 0.5]} />
      <MetalPart position={[0, 0.1, -0.5]} />

      {Array.from({ length: numOfTracks }).map((_, i) => (
        <mesh key={i} position={[(1 / numOfTracks) * i - 0.5, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 1]} />
          <meshStandardMaterial
            color={woodColor}
            roughness={0.8}
            metalness={0.1}
            side={DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};
