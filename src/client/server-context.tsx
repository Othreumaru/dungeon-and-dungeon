import { createContext } from "react";
import { useServer } from "./hooks/use-server";
import EventEmitter from "eventemitter3";

export const EventEmitterContext = createContext<EventEmitter>(
  null as unknown as EventEmitter
);

export const ServerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const eventEmitter = useServer();

  return (
    <EventEmitterContext.Provider value={eventEmitter}>
      {children}
    </EventEmitterContext.Provider>
  );
};
