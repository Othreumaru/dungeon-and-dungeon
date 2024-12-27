import { useEffect, useRef } from "react";

export const useDrag = ({ onDrag }: { onDrag: (e: MouseEvent) => void }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ref: React.RefObject<any> = useRef(null);
  const isDragging = useRef(false);
  const onDragRef = useRef(onDrag);

  onDragRef.current = onDrag;

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      if (isDragging.current) {
        onDragRef.current(e);
      }
    };

    const element = ref.current;

    const handlePointerDown = () => {
      isDragging.current = true;
      document.addEventListener("pointermove", handlePointerMove);
      console.log("down");
    };
    const handlePointerUp = () => {
      isDragging.current = false;
      document.removeEventListener("pointermove", handlePointerMove);
      console.log("up");
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointerup", handlePointerUp);
    // element.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);

    return () => {
      element.removeEventListener("mousedown", handlePointerDown);
      element.removeEventListener("mouseup", handlePointerUp);
      // element.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("mouseup", handlePointerUp);
    };
  }, []);

  return { ref };
};
