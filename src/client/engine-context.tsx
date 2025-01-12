import { createContext, useEffect, useRef, useState } from "react";
import { initialState } from "../engine/reducers/root-reducer.ts";
import { type Actions } from "../protocol/actions.ts";
import { useServerContext } from "./hooks/use-server-context.ts";
import type { RootState, State } from "../protocol/state.ts";
import { createTick } from "../engine/engine.ts";
import hash from "object-hash";

export const EngineContext = createContext<{
  state: State;
  serverStartTime: number;
}>(null as unknown as { state: State; serverStartTime: number });
export const EngineDispatchContext = createContext<(action: Actions) => void>(
  () => {}
);

export const EngineContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const serverStartTimeRef = useRef(0);
  const eventEmitter = useServerContext();
  const [state, setState] = useState<State>(initialState.state);
  const isSyncedRef = useRef(false);

  useEffect(() => {
    eventEmitter.on("sync", (action) => {
      setState(action.state);
      isSyncedRef.current = true;
      serverStartTimeRef.current = action.serverStartTimeInLocalTime;
    });
  }, [eventEmitter]);

  useEffect(() => {
    let tick:
      | ((
          state: RootState,
          a: Actions[]
        ) => { state: RootState; timeToProcess: number })
      | null = null;
    let rootState: RootState = {
      ...initialState,
      hash: hash(initialState, { algorithm: "md5" }),
    };
    const invokeTick = () => {
      if (!isSyncedRef.current) {
        setTimeout(invokeTick, 100);
        return;
      }
      if (tick === null) {
        tick = createTick(new Date(serverStartTimeRef.current), undefined);
      }
      const { timeToProcess, state: newRootState } = tick!(rootState, []);
      console.log(rootState.tick, rootState.hash);
      setState(newRootState.state);
      rootState = newRootState;
      setTimeout(invokeTick, timeToProcess);
    };

    setTimeout(invokeTick, 100);
  }, []);

  return (
    <EngineContext.Provider
      value={{ state, serverStartTime: serverStartTimeRef.current }}
    >
      <EngineDispatchContext.Provider value={() => {}}>
        {children}
      </EngineDispatchContext.Provider>
    </EngineContext.Provider>
  );
};
