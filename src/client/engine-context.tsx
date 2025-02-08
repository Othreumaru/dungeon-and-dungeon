import { createContext, useEffect, useRef, useState } from "react";
import { initialState } from "../engine/reducers/root-reducer.ts";
import { type Actions } from "../protocol/actions.ts";
import { useServerContext } from "./hooks/use-server-context.ts";
import type { RootState } from "../protocol/state.ts";
import { createTick } from "../engine/engine.ts";
import hash from "object-hash";
import { SyncMessage } from "./hooks/use-server.ts";

export const EngineContext = createContext<{
  rootState: RootState;
  serverStartTime: number;
}>(null as unknown as { rootState: RootState; serverStartTime: number });

export const EngineDispatchContext = createContext<(action: Actions) => void>(
  () => {}
);

export const EngineContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("engine context provider");
  const serverStartTimeRef = useRef(0);
  const eventEmitter = useServerContext();
  const [rootState, setRootState] = useState<RootState>(initialState);
  const isSyncedRef = useRef(false);
  const isRunningRef = useRef(false);

  useEffect(() => {
    eventEmitter.on("sync", (action: SyncMessage) => {
      setRootState(action.state);
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

    isRunningRef.current = true;

    const invokeTick = () => {
      if (!isRunningRef.current) {
        console.log("not running");
        return;
      }
      if (!isSyncedRef.current) {
        console.log("not synced yet");
        setTimeout(invokeTick, rootState.state.tickDurationMs);
        return;
      }
      if (tick === null) {
        tick = createTick(new Date(serverStartTimeRef.current), undefined);
      }
      const { timeToProcess, state: newRootState } = tick!(rootState, []);
      console.log(Date.now(), rootState.tick, rootState.hash);
      setRootState(newRootState);
      rootState = newRootState;
      setTimeout(invokeTick, timeToProcess);
    };

    console.log("starting tick");
    setTimeout(invokeTick, rootState.state.tickDurationMs);

    return () => {
      console.log("stopping tick");
      isRunningRef.current = false;
    };
  }, []);

  return (
    <EngineContext.Provider
      value={{ rootState, serverStartTime: serverStartTimeRef.current }}
    >
      <EngineDispatchContext.Provider value={() => {}}>
        {children}
      </EngineDispatchContext.Provider>
    </EngineContext.Provider>
  );
};
