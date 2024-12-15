import { createContext, useEffect, useReducer } from "react";
import { rootReducer, initialState } from "../engine/reducers/root-reducer.ts";
import { createFrameTickAction, type Actions } from "../protocol/actions.ts";
import { useServerContext } from "./hooks/use-server-context.ts";
import type { State } from "../protocol/state.ts";

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
  const [state, dispatch] = useReducer(rootReducer, initialState);

  useEffect(() => {
    eventEmitter.on("message", dispatch);
    const intervalTimer = setInterval(() => {
      dispatch(createFrameTickAction(Date.now()));
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
