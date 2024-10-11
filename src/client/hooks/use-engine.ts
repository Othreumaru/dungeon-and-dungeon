import { useReducer } from "react";
import { reducer, initialState } from "../../engine/reducer.ts";

export const useEngine = () => {
  return useReducer(reducer, initialState);
};
