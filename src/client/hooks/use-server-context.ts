import { useContext } from "react";
import { ThemeContext } from "../server-context";
import { EventEmitter } from "eventemitter3";

export const useServerContext = () => {
  return useContext<EventEmitter>(ThemeContext);
};
