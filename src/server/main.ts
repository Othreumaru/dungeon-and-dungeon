import { initServer } from "./server.ts";
import { initEngine } from "../engine/engine.ts";

const engineApi = initEngine();
initServer(engineApi);
