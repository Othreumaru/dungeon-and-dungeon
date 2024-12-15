import { useReducer } from "react";
import {
  rootReducer,
  initialState,
} from "../../engine/reducers/root-reducer.ts";

export const useEngine = () => {
  return useReducer(rootReducer, initialState);
};
