import * as THREE from "three";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { GLTF } from "three-stdlib";

import { useAnimations, useGLTF } from "@react-three/drei";

type GLTFResult = GLTF & {
  nodes: {
    Spellbook: THREE.Mesh;
    Spellbook_open: THREE.Mesh;
    handslotl: THREE.Bone;
    handl: THREE.Bone;
    wristl: THREE.Bone;
    lowerarml: THREE.Bone;
    upperarml: THREE.Bone;
    "1H_Wand": THREE.Mesh;
    "2H_Staff": THREE.Mesh;
    handslotr: THREE.Bone;
    handr: THREE.Bone;
    wristr: THREE.Bone;
    lowerarmr: THREE.Bone;
    upperarmr: THREE.Bone;
    Mage_Hat: THREE.Mesh;
    head: THREE.Bone;
    Mage_Cape: THREE.Mesh;
    chest: THREE.Bone;
    spine: THREE.Bone;
    toesl: THREE.Bone;
    footl: THREE.Bone;
    lowerlegl: THREE.Bone;
    upperlegl: THREE.Bone;
    toesr: THREE.Bone;
    footr: THREE.Bone;
    lowerlegr: THREE.Bone;
    upperlegr: THREE.Bone;
    hips: THREE.Bone;
    kneeIKl: THREE.Bone;
    heelIKl: THREE.Bone;
    "IK-footl": THREE.Bone;
    "control-foot-rolll": THREE.Bone;
    "IK-toel": THREE.Bone;
    "control-heel-rolll": THREE.Bone;
    "control-toe-rolll": THREE.Bone;
    kneeIKr: THREE.Bone;
    heelIKr: THREE.Bone;
    "IK-footr": THREE.Bone;
    "control-foot-rollr": THREE.Bone;
    "IK-toer": THREE.Bone;
    "control-heel-rollr": THREE.Bone;
    "control-toe-rollr": THREE.Bone;
    elbowIKl: THREE.Bone;
    handIKl: THREE.Bone;
    elbowIKr: THREE.Bone;
    handIKr: THREE.Bone;
    root: THREE.Bone;
    Mage_ArmLeft: THREE.SkinnedMesh;
    Mage_ArmRight: THREE.SkinnedMesh;
    Mage_Body: THREE.SkinnedMesh;
    Mage_Head: THREE.SkinnedMesh;
    Mage_LegLeft: THREE.SkinnedMesh;
    Mage_LegRight: THREE.SkinnedMesh;
    Rig: THREE.Group;
  };
  materials: {
    mage_texture: THREE.Material;
  };
};

export type ActionName =
  | "1H_Melee_Attack_Chop"
  | "1H_Melee_Attack_Slice_Diagonal"
  | "1H_Melee_Attack_Slice_Horizontal"
  | "1H_Melee_Attack_Stab"
  | "1H_Ranged_Aiming"
  | "1H_Ranged_Reload"
  | "1H_Ranged_Shoot"
  | "1H_Ranged_Shooting"
  | "2H_Melee_Attack_Chop"
  | "2H_Melee_Attack_Slice"
  | "2H_Melee_Attack_Spin"
  | "2H_Melee_Attack_Spinning"
  | "2H_Melee_Attack_Stab"
  | "2H_Melee_Idle"
  | "2H_Ranged_Aiming"
  | "2H_Ranged_Reload"
  | "2H_Ranged_Shoot"
  | "2H_Ranged_Shooting"
  | "Block"
  | "Block_Attack"
  | "Block_Hit"
  | "Blocking"
  | "Cheer"
  | "Death_A"
  | "Death_A_Pose"
  | "Death_B"
  | "Death_B_Pose"
  | "Dodge_Backward"
  | "Dodge_Forward"
  | "Dodge_Left"
  | "Dodge_Right"
  | "Dualwield_Melee_Attack_Chop"
  | "Dualwield_Melee_Attack_Slice"
  | "Dualwield_Melee_Attack_Stab"
  | "Hit_A"
  | "Hit_B"
  | "Idle"
  | "Interact"
  | "Jump_Full_Long"
  | "Jump_Full_Short"
  | "Jump_Idle"
  | "Jump_Land"
  | "Jump_Start"
  | "Lie_Down"
  | "Lie_Idle"
  | "Lie_Pose"
  | "Lie_StandUp"
  | "PickUp"
  | "Running_A"
  | "Running_B"
  | "Running_Strafe_Left"
  | "Running_Strafe_Right"
  | "Sit_Chair_Down"
  | "Sit_Chair_Idle"
  | "Sit_Chair_Pose"
  | "Sit_Chair_StandUp"
  | "Sit_Floor_Down"
  | "Sit_Floor_Idle"
  | "Sit_Floor_Pose"
  | "Sit_Floor_StandUp"
  | "Spellcast_Long"
  | "Spellcast_Raise"
  | "Spellcast_Shoot"
  | "Spellcasting"
  | "T-Pose"
  | "Throw"
  | "Unarmed_Idle"
  | "Unarmed_Melee_Attack_Kick"
  | "Unarmed_Melee_Attack_Punch_A"
  | "Unarmed_Melee_Attack_Punch_B"
  | "Unarmed_Pose"
  | "Use_Item"
  | "Walking_A"
  | "Walking_B"
  | "Walking_Backwards"
  | "Walking_C";

interface AnimationClip extends THREE.AnimationClip {
  name: ActionName;
}

export const MageGLBPath = "/Mage.glb";

function MageComponent({
  bookOpen = false,
  weapon = "staff",
  animation = "Idle",
  animationReversed = false,
  ...restProps
}: JSX.IntrinsicElements["group"] & {
  bookOpen?: boolean;
  weapon?: "staff" | "wand";
  animation?: ActionName;
  animationReversed?: boolean;
}) {
  console.log("Mage render");
  const group = useRef<THREE.Group>(null);
  const { nodes, materials, animations } = useGLTF("/Mage.glb") as GLTFResult;
  const { actions } = useAnimations<AnimationClip>(
    animations as AnimationClip[],
    group
  );
  const [skeleton, setSkeleton] = useState<THREE.Skeleton | undefined>(
    undefined
  );
  const bonesRef = useRef<THREE.Bone[]>([]);

  const addBoneRoot = useCallback((boneRef: THREE.Bone) => {
    if (bonesRef.current.length === 0) {
      const bones: THREE.Bone[] = [];
      const traverse = (bone: THREE.Bone) => {
        bones.push(bone);
        bone.children.forEach((child) => {
          if (child instanceof THREE.Bone) {
            traverse(child);
          }
        });
      };
      traverse(boneRef);
      bonesRef.current = bones;

      const boneInverses: THREE.Matrix4[] = [];
      nodes["Mage_ArmLeft"].skeleton.boneInverses.forEach((inverse) => {
        boneInverses.push(inverse.clone());
      });
      const skeletonInstance = new THREE.Skeleton(bones, boneInverses);
      setSkeleton(skeletonInstance);
    }
  }, []);

  useEffect(() => {
    if (!animation || !actions[animation]) {
      return;
    }
    actions[animation]?.play();
    const anim = actions[animation];
    if (anim !== null) {
      anim.timeScale = animationReversed ? -1 : 1;
    }
    return () => {
      if (!actions[animation]) {
        return;
      }
      actions[animation]?.stop();
    };
  }, [animation, actions, animationReversed]);

  return (
    <group ref={group} {...restProps} dispose={null}>
      <group name="Scene">
        <group
          name={"Rig"}
          position={nodes["Rig"].position}
          rotation={nodes["Rig"].rotation}
          scale={nodes["Rig"].scale}
        >
          <skinnedMesh
            name={"Mage_ArmLeft"}
            geometry={nodes["Mage_ArmLeft"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <skinnedMesh
            name={"Mage_ArmRight"}
            geometry={nodes["Mage_ArmRight"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <skinnedMesh
            name={"Mage_Body"}
            geometry={nodes["Mage_Body"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <skinnedMesh
            name={"Mage_Head"}
            geometry={nodes["Mage_Head"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <skinnedMesh
            name={"Mage_LegLeft"}
            geometry={nodes["Mage_LegLeft"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <skinnedMesh
            name={"Mage_LegRight"}
            geometry={nodes["Mage_LegRight"].geometry}
            material={materials["mage_texture"]}
            skeleton={skeleton}
            castShadow
          ></skinnedMesh>
          <bone
            name={"root"}
            rotation={nodes["root"].rotation}
            ref={addBoneRoot}
          >
            <bone
              name={"hips"}
              position={nodes["hips"].position}
              rotation={nodes["hips"].rotation}
            >
              <bone
                name={"spine"}
                position={nodes["spine"].position}
                rotation={nodes["spine"].rotation}
              >
                <bone
                  name={"chest"}
                  position={nodes["chest"].position}
                  scale={nodes["chest"].scale}
                >
                  <bone
                    name={"upperarml"}
                    position={nodes["upperarml"].position}
                    rotation={nodes["upperarml"].rotation}
                    scale={nodes["upperarml"].scale}
                  >
                    <bone
                      name={"lowerarml"}
                      position={nodes["lowerarml"].position}
                      rotation={nodes["lowerarml"].rotation}
                      scale={nodes["lowerarml"].scale}
                    >
                      <bone
                        name={"wristl"}
                        position={nodes["wristl"].position}
                        rotation={nodes["wristl"].rotation}
                        scale={nodes["wristl"].scale}
                      >
                        <bone
                          name={"handl"}
                          position={nodes["handl"].position}
                          rotation={nodes["handl"].rotation}
                          scale={nodes["handl"].scale}
                        >
                          <bone
                            name={"handslotl"}
                            position={nodes["handslotl"].position}
                            rotation={nodes["handslotl"].rotation}
                            scale={nodes["handslotl"].scale}
                          >
                            {bookOpen ? (
                              <mesh
                                name={"Spellbook_open"}
                                geometry={nodes["Spellbook_open"].geometry}
                                material={materials["mage_texture"]}
                                position={nodes["Spellbook_open"].position}
                                rotation={nodes["Spellbook_open"].rotation}
                                scale={nodes["Spellbook_open"].scale}
                              ></mesh>
                            ) : (
                              <mesh
                                name={"Spellbook"}
                                geometry={nodes["Spellbook"].geometry}
                                material={materials["mage_texture"]}
                                position={nodes["Spellbook"].position}
                                rotation={nodes["Spellbook"].rotation}
                                scale={nodes["Spellbook"].scale}
                              ></mesh>
                            )}
                          </bone>
                        </bone>
                      </bone>
                    </bone>
                  </bone>
                  <bone
                    name={"upperarmr"}
                    position={nodes["upperarmr"].position}
                    rotation={nodes["upperarmr"].rotation}
                    scale={nodes["upperarmr"].scale}
                  >
                    <bone
                      name={"lowerarmr"}
                      position={nodes["lowerarmr"].position}
                      rotation={nodes["lowerarmr"].rotation}
                      scale={nodes["lowerarmr"].scale}
                    >
                      <bone
                        name={"wristr"}
                        position={nodes["wristr"].position}
                        rotation={nodes["wristr"].rotation}
                        scale={nodes["wristr"].scale}
                      >
                        <bone
                          name={"handr"}
                          position={nodes["handr"].position}
                          rotation={nodes["handr"].rotation}
                          scale={nodes["handr"].scale}
                        >
                          <bone
                            name={"handslotr"}
                            position={nodes["handslotr"].position}
                            rotation={nodes["handslotr"].rotation}
                            scale={nodes["handslotr"].scale}
                          >
                            {weapon === "wand" ? (
                              <mesh
                                name={"1H_Wand"}
                                geometry={nodes["1H_Wand"].geometry}
                                material={materials["mage_texture"]}
                                position={nodes["1H_Wand"].position}
                                rotation={nodes["1H_Wand"].rotation}
                                scale={nodes["1H_Wand"].scale}
                              ></mesh>
                            ) : (
                              <mesh
                                name={"2H_Staff"}
                                geometry={nodes["2H_Staff"].geometry}
                                material={materials["mage_texture"]}
                                position={nodes["2H_Staff"].position}
                                rotation={nodes["2H_Staff"].rotation}
                                scale={nodes["2H_Staff"].scale}
                              ></mesh>
                            )}
                          </bone>
                        </bone>
                      </bone>
                    </bone>
                  </bone>
                  <bone name={"head"} position={nodes["head"].position}>
                    <mesh
                      name={"Mage_Hat"}
                      geometry={nodes["Mage_Hat"].geometry}
                      material={materials["mage_texture"]}
                      position={nodes["Mage_Hat"].position}
                      rotation={nodes["Mage_Hat"].rotation}
                    ></mesh>
                  </bone>
                  <mesh
                    name={"Mage_Cape"}
                    geometry={nodes["Mage_Cape"].geometry}
                    material={materials["mage_texture"]}
                    position={nodes["Mage_Cape"].position}
                    rotation={nodes["Mage_Cape"].rotation}
                  ></mesh>
                </bone>
              </bone>
              <bone
                name={"upperlegl"}
                position={nodes["upperlegl"].position}
                rotation={nodes["upperlegl"].rotation}
                scale={nodes["upperlegl"].scale}
              >
                <bone
                  name={"lowerlegl"}
                  position={nodes["lowerlegl"].position}
                  rotation={nodes["lowerlegl"].rotation}
                  scale={nodes["lowerlegl"].scale}
                >
                  <bone
                    name={"footl"}
                    position={nodes["footl"].position}
                    rotation={nodes["footl"].rotation}
                    scale={nodes["footl"].scale}
                  >
                    <bone
                      name={"toesl"}
                      position={nodes["toesl"].position}
                      rotation={nodes["toesl"].rotation}
                      scale={nodes["toesl"].scale}
                    ></bone>
                  </bone>
                </bone>
              </bone>
              <bone
                name={"upperlegr"}
                position={nodes["upperlegr"].position}
                rotation={nodes["upperlegr"].rotation}
                scale={nodes["upperlegr"].scale}
              >
                <bone
                  name={"lowerlegr"}
                  position={nodes["lowerlegr"].position}
                  rotation={nodes["lowerlegr"].rotation}
                  scale={nodes["lowerlegr"].scale}
                >
                  <bone
                    name={"footr"}
                    position={nodes["footr"].position}
                    rotation={nodes["footr"].rotation}
                    scale={nodes["footr"].scale}
                  >
                    <bone
                      name={"toesr"}
                      position={nodes["toesr"].position}
                      rotation={nodes["toesr"].rotation}
                      scale={nodes["toesr"].scale}
                    ></bone>
                  </bone>
                </bone>
              </bone>
            </bone>
            <bone
              name={"kneeIKl"}
              position={nodes["kneeIKl"].position}
              rotation={nodes["kneeIKl"].rotation}
              scale={nodes["kneeIKl"].scale}
            ></bone>
            <bone
              name={"control-toe-rolll"}
              position={nodes["control-toe-rolll"].position}
              rotation={nodes["control-toe-rolll"].rotation}
            >
              <bone
                name={"control-heel-rolll"}
                position={nodes["control-heel-rolll"].position}
                rotation={nodes["control-heel-rolll"].rotation}
              >
                <bone
                  name={"control-foot-rolll"}
                  position={nodes["control-foot-rolll"].position}
                  rotation={nodes["control-foot-rolll"].rotation}
                  scale={nodes["control-foot-rolll"].scale}
                >
                  <bone
                    name={"heelIKl"}
                    position={nodes["heelIKl"].position}
                    rotation={nodes["heelIKl"].rotation}
                    scale={nodes["heelIKl"].scale}
                  ></bone>
                  <bone
                    name={"IK-footl"}
                    position={nodes["IK-footl"].position}
                    rotation={nodes["IK-footl"].rotation}
                    scale={nodes["IK-footl"].scale}
                  ></bone>
                </bone>
                <bone
                  name={"IK-toel"}
                  position={nodes["IK-toel"].position}
                  rotation={nodes["IK-toel"].rotation}
                  scale={nodes["IK-toel"].scale}
                ></bone>
              </bone>
            </bone>
            <bone
              name={"kneeIKr"}
              position={nodes["kneeIKr"].position}
              rotation={nodes["kneeIKr"].rotation}
              scale={nodes["kneeIKr"].scale}
            ></bone>
            <bone
              name={"control-toe-rollr"}
              position={nodes["control-toe-rollr"].position}
              rotation={nodes["control-toe-rollr"].rotation}
            >
              <bone
                name={"control-heel-rollr"}
                position={nodes["control-heel-rollr"].position}
                rotation={nodes["control-heel-rollr"].rotation}
              >
                <bone
                  name={"control-foot-rollr"}
                  position={nodes["control-foot-rollr"].position}
                  rotation={nodes["control-foot-rollr"].rotation}
                  scale={nodes["control-foot-rollr"].scale}
                >
                  <bone
                    name={"heelIKr"}
                    position={nodes["heelIKr"].position}
                    rotation={nodes["heelIKr"].rotation}
                    scale={nodes["heelIKr"].scale}
                  ></bone>
                  <bone
                    name={"IK-footr"}
                    position={nodes["IK-footr"].position}
                    rotation={nodes["IK-footr"].rotation}
                    scale={nodes["IK-footr"].scale}
                  ></bone>
                </bone>
                <bone
                  name={"IK-toer"}
                  position={nodes["IK-toer"].position}
                  rotation={nodes["IK-toer"].rotation}
                  scale={nodes["IK-toer"].scale}
                ></bone>
              </bone>
            </bone>
            <bone
              name={"elbowIKl"}
              position={nodes["elbowIKl"].position}
              rotation={nodes["elbowIKl"].rotation}
            ></bone>
            <bone
              name={"handIKl"}
              position={nodes["handIKl"].position}
              rotation={nodes["handIKl"].rotation}
              scale={nodes["handIKl"].scale}
            ></bone>
            <bone
              name={"elbowIKr"}
              position={nodes["elbowIKr"].position}
              rotation={nodes["elbowIKr"].rotation}
            ></bone>
            <bone
              name={"handIKr"}
              position={nodes["handIKr"].position}
              rotation={nodes["handIKr"].rotation}
            ></bone>
          </bone>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/Mage.glb");

export const Mage = memo(MageComponent);
