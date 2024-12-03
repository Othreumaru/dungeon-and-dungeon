import { useEffect, useRef } from "react";

export const Action = ({
  action,
}: {
  action: {
    name: string;
  };
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const testProgressRef = useRef<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      testProgressRef.current += 0.01;
      if (testProgressRef.current > 1) {
        testProgressRef.current = 0;
      }
      if (progressRef.current) {
        progressRef.current.style.top = `${100 - testProgressRef.current * 100}%`;
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

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
