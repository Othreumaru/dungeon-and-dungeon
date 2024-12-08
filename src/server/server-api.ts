import type { Actions } from "../protocol/actions.ts";

export type ServerApi = {
  broadcast: (action: Actions) => void;
  send: (userId: string, action: Actions) => void;
};

export type Session = {
  name: string;
  email: string;
  image: string;
};

export type PlayerContext = { session: Session; userId: string };
