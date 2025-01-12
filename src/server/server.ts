import WebSocket, { WebSocketServer } from "ws";
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
import { ClientRequests } from "../protocol/requests.ts";
import { createSyncResponse } from "../protocol/responses.ts";
import type { Responses } from "../protocol/responses.ts";
import fs from "node:fs";

type UpgradedWebSocket = WebSocket & PlayerContext;

const PORT = process.env.PORT || 80;
const LOG_FILE = "./log.ndjson";

const hashStr = (str: string) => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return hash;
};

const expressAuthConfig: ExpressAuthConfig = { providers: [GitHub] };

const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp}: ${message}`);
};

export const initServer = (engineApi: EngineApi) => {
  fs.truncate(LOG_FILE, 0, function () {
    console.log(`clearing ${LOG_FILE} done`);
  });
  const app = express();
  app.set("trust proxy", true);
  app.use(express.static("dist"));
  app.use("/auth/*", ExpressAuth(expressAuthConfig));

  const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });

  const wss = new WebSocketServer({ noServer: true });

  const broadcast = (data: Responses) => {
    const buffer = JSON.stringify(data, null, 2);
    log(`broadcasting: ${data.type}`);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(buffer);
      }
    });
  };

  const send = (userId: string, data: Responses) => {
    const buffer = JSON.stringify(data);
    log(`sending to ${userId}: ${data.type}`);
    wss.clients.forEach((client) => {
      if (
        client.readyState === WebSocket.OPEN &&
        (client as UpgradedWebSocket).userId === userId
      ) {
        client.send(buffer);
      }
    });
  };

  const sync = (userId: string) => {
    const state = engineApi.getState();
    const serverStartTime = engineApi.getServerStartTime().getTime();
    const syncResponse = createSyncResponse(
      userId,
      state,
      Date.now(),
      serverStartTime
    );
    const buffer = JSON.stringify(syncResponse);
    log(`syncing ${userId} state ${state.hash} with time ${serverStartTime}`);
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
    sync,
  };

  engineApi.onTick(({ timestamp, action, state }) => {
    // console.log(`tick ${state.tick} ${state.hash}`);
    fs.appendFile(
      LOG_FILE,
      `${JSON.stringify({
        timestamp: timestamp.toISOString(),
        action,
        state,
      })}\n`,
      function (err) {
        if (err) {
          throw err;
        }
      }
    );
  });

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
    console.log("upgrade request", request.url);
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
