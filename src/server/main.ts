import EventEmitter from "eventemitter3";
import { initServer } from "./server.ts";
import { initEngine } from "../engine/engine.ts";

const eventEmitter = new EventEmitter();
initServer(eventEmitter);
initEngine(eventEmitter);
