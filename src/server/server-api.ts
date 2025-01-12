import { Responses } from "../protocol/responses.ts";

export type ServerApi = {
  broadcast: (action: Responses) => void;
  send: (userId: string, action: Responses) => void;
  sync: (userId: string) => void;
};

export type Session = {
  name: string;
  email: string;
  image: string;
};

export type PlayerContext = { session: Session; userId: string };
