import { useEffect, useRef } from "react";
import { UnitAction } from "../../../protocol/state";

export const Action = ({ action }: { action: UnitAction }) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const testProgressRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (action.state.type !== "cooldown" && progressRef.current) {
      progressRef.current.style.top = "0%";
      return;
    }
    intervalRef.current = setInterval(() => {
      if (action.state.type !== "cooldown") {
        return;
      }
      testProgressRef.current += 0.1;
      if (testProgressRef.current > action.cooldown * 100) {
        clearInterval(intervalRef.current);
        if (progressRef.current) {
          progressRef.current.style.top = "0%";
        }
        testProgressRef.current = 0;
        return;
      }
      if (progressRef.current) {
        progressRef.current.style.top = `${(1 - (testProgressRef.current / action.cooldown) * 100) * 100}%`;
      }
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [action.cooldown, action.state.type]);

  return (
    <div
      className="action"
      key={action.name}
      onClick={() => console.log(action)}
    >
      <div className="action-cooldown-progress" ref={progressRef} />
      <div className="action-label">{action.name}</div>
    </div>
  );
};
