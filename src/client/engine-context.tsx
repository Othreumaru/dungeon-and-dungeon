import { createContext, useEffect, useReducer } from "react";
import { reducer, initialState } from "../engine/reducer.ts";
import { State, Actions } from "../api";
import { useServerContext } from "./hooks/use-server-context.ts";

export const EngineContext = createContext<State>(null as unknown as State);
export const EngineDispatchContext = createContext<(action: Actions) => void>(
  () => {}
);

export const EngineContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const eventEmitter = useServerContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    eventEmitter.on("message", dispatch);
    const intervalTimer = setInterval(() => {
      dispatch({ type: "action:frame-tick", payload: { frame: Date.now() } });
    }, 100);
    return () => {
      clearInterval(intervalTimer);
      eventEmitter.off("message", dispatch);
    };
  }, [eventEmitter]);

  return (
    <EngineContext.Provider value={state}>
      <EngineDispatchContext.Provider value={dispatch}>
        {children}
      </EngineDispatchContext.Provider>
    </EngineContext.Provider>
  );
};
