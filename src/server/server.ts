import WebSocket, { WebSocketServer } from "ws";
import { createFrameTickAction, type Actions } from "../protocol/actions.ts";
import express from "express";
import type { Request } from "express";
import { ExpressAuth } from "@auth/express";
import type { ExpressAuthConfig } from "@auth/express";
import GitHub from "@auth/express/providers/github";
import { type IncomingMessage } from "http";
import { getSession } from "@auth/express";
import crypto from "crypto";
import { requestMoveHandler } from "./handlers/request-move-handler.ts";
import type { EngineApi } from "../engine/engine.ts";
import { requestJoinHandler } from "./handlers/request-join-handler.ts";
import type { PlayerContext, ServerApi, Session } from "./server-api.ts";
import { requestChatHandler } from "./handlers/request-chat-handler.ts";
import { requestLeaveHandler } from "./handlers/request-leave-handler.ts";
import { tickHandler } from "./handlers/tick-handler.ts";
import { ClientRequests } from "../protocol/requests.ts";

type UpgradedWebSocket = WebSocket & PlayerContext;

const PORT = process.env.PORT || 8080;

const hashStr = (str: string) => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return hash;
};

const expressAuthConfig: ExpressAuthConfig = { providers: [GitHub] };

export const initServer = (engineApi: EngineApi) => {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.static("dist"));
  app.use("/auth/*", ExpressAuth(expressAuthConfig));

  const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  const wss = new WebSocketServer({ noServer: true });

  const broadcast = (data: Actions) => {
    engineApi.applyAction(data, false);
    const buffer = JSON.stringify(data);
    console.log("broadcasting", buffer);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(buffer);
      }
    });
  };

  const send = (userId: string, data: Actions) => {
    const buffer = JSON.stringify(data);
    console.log("sending", buffer);
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client as UpgradedWebSocket).userId === userId
      ) {
        client.send(buffer);
      }
    });
  };

  const serverApi: ServerApi = {
    broadcast,
    send,
  };

  engineApi.onDispatch(broadcast);

  setInterval(() => {
    tickHandler(engineApi, serverApi);
    engineApi.applyAction(createFrameTickAction(Date.now()), false);
  }, 100);

  wss.on("connection", (ws) => {
    const session = (ws as UpgradedWebSocket).session;
    const userId = hashStr(session.email + session.name);
    const playerContext = { session, userId };
    (ws as UpgradedWebSocket).userId = userId;

    requestJoinHandler(playerContext, engineApi, serverApi);

    ws.on("error", console.error);

    ws.on("message", (data: string) => {
      const parsedRequest = ClientRequests.safeParse(
        JSON.parse(data.toString())
      );
      if (!parsedRequest.success) {
        console.error(parsedRequest.error);
        console.error("Invalid request", data.toString());
        return;
      }

      const request = parsedRequest.data;

      if (request.type === "request:chat") {
        requestChatHandler(request, playerContext, engineApi, serverApi);
      }
      if (request.type === "request:move") {
        requestMoveHandler(request, playerContext, engineApi, serverApi);
      }
    });

    ws.on("close", () => {
      requestLeaveHandler(playerContext, engineApi, serverApi);
    });
  });

  function onSocketError(err: Error) {
    console.error(err);
  }

  async function authenticate(
    request: IncomingMessage,
    next: (err: Error | null, client: Session | null) => void
  ) {
    const session = await getSession(request as Request, expressAuthConfig);
    if (!session || session.user === undefined) {
      return next(new Error("Unauthorized"), null);
    }
    next(null, session.user as Session);
  }

  server.on("upgrade", (request, socket, head) => {
    socket.on("error", onSocketError);

    void authenticate(request, (err, client) => {
      if (err || !client) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        console.error(
          "Unauthorized request from",
          request.socket.remoteAddress
        );
        socket.destroy();
        return;
      }

      console.log(
        "Authenticated request from",
        request.socket.remoteAddress,
        client
      );

      socket.removeListener("error", onSocketError);

      wss.handleUpgrade(request, socket, head, (ws) => {
        (ws as UpgradedWebSocket).session = client;
        wss.emit("connection", ws, request, client);
      });
    });
  });

  return wss;
};
