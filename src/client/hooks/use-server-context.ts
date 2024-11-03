import { useContext } from "react";
import { EventEmitterContext } from "../server-context";
import { EventEmitter } from "eventemitter3";

export const useServerContext = () => {
  return useContext<EventEmitter>(EventEmitterContext);
};
