import { createContext } from "react";
import { useServer } from "./hooks/use-server";
import EventEmitter from "eventemitter3";

export const ThemeContext = createContext<EventEmitter>(
  null as unknown as EventEmitter
);

export const ServerContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const eventEmitter = useServer();

  return (
    <ThemeContext.Provider value={eventEmitter}>
      {children}
    </ThemeContext.Provider>
  );
};
