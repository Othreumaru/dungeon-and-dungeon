import { ThreeElements as FiberThreeElements } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements extends FiberThreeElements {
    cubicBezierCurve3: Object3DNode<CustomElement, typeof CustomElement>;
  }
}
