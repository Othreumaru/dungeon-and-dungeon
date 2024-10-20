import EventEmitter from "eventemitter3";
import WebSocket, { WebSocketServer } from "ws";
import type { LeaveRequest, Requests } from "../api.ts";
import express from "express";
// import ViteExpress from "vite-express";

export const initServer = (eventEmitter: EventEmitter) => {
  const app = express();
  app.use(express.static("dist"));

  const server = app.listen(8080, () => {
    console.log("Server is listening...");
  });

  const wss = new WebSocketServer({ server });

  eventEmitter.on("broadcast", (data) => {
    const buffer = JSON.stringify(data);
    console.log("broadcasting", buffer);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(buffer);
      }
    });
  });

  wss.on("connection", (ws) => {
    ws.on("error", console.error);

    ws.on("message", (data) => {
      const request: Requests = JSON.parse(data.toString());
      if (request.type === "request:chat") {
        eventEmitter.emit("broadcast", {
          type: "action:chat",
          payload: {
            userId: (ws as unknown as { userId: string }).userId,
            message: request.payload.message,
          },
        });
      }
      if (request.type === "request:join") {
        (ws as unknown as { userId: string }).userId = request.payload.userId;
        eventEmitter.on(`message:${request.payload.userId}`, (data) => {
          ws.send(JSON.stringify(data));
        });
      }
      eventEmitter.emit("message", request);
    });

    ws.on("close", () => {
      const leaveRequest: LeaveRequest = {
        type: "request:leave",
        payload: {
          userId: (ws as unknown as { userId: string }).userId,
        },
      };
      eventEmitter.emit("message", leaveRequest);
      eventEmitter.removeAllListeners(`message:${leaveRequest.payload.userId}`);
    });
  });

  // ViteExpress.bind(app, server);

  return wss;
};
