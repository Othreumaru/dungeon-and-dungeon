import EventEmitter from "eventemitter3";
import WebSocket, { WebSocketServer } from "ws";
import type {
  JoinRequest,
  LeaveRequest,
  ServerUpgradedRequest,
  ServerUpgradedRequests,
} from "../api.ts";
import express from "express";
import type { Request } from "express";
import { ExpressAuth } from "@auth/express";
import type { ExpressAuthConfig } from "@auth/express";
import GitHub from "@auth/express/providers/github";
import type { IncomingMessage } from "http";
import { getSession } from "@auth/express";
import crypto from "crypto";

type Session = {
  name: string;
  email: string;
  image: string;
};
type UpgradedWebSocket = WebSocket & { session: Session };

const hashStr = (str: string) => {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return hash;
};

const expressAuthConfig: ExpressAuthConfig = { providers: [GitHub] };

export const initServer = (eventEmitter: EventEmitter) => {
  const app = express();
  app.set("trust proxy", true);
  app.use(express.static("dist"));
  app.use("/auth/*", ExpressAuth(expressAuthConfig));

  const server = app.listen(8080, () => {
    console.log("Server is listening...");
  });

  const wss = new WebSocketServer({ noServer: true });

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
    const session = (ws as UpgradedWebSocket).session;
    const userId = hashStr(session.email + session.name);

    eventEmitter.on(`message:${userId}`, (data) => {
      ws.send(JSON.stringify(data));
    });

    const joinRequest: ServerUpgradedRequest<JoinRequest> = {
      type: "request:join",
      payload: {
        session: {
          userId,
          name: session.name,
          image: session.image,
          email: session.email,
        },
      },
    };

    eventEmitter.emit("message", joinRequest);

    ws.on("error", console.error);

    ws.on("message", (data) => {
      const request: ServerUpgradedRequests = JSON.parse(data.toString());
      if (request.type === "request:chat") {
        eventEmitter.emit("broadcast", {
          type: "action:chat",
          payload: {
            userId: (ws as unknown as { userId: string }).userId,
            message: request.payload.message,
          },
        });
      }

      if (request.type !== "request:join") {
        eventEmitter.emit("message", {
          ...request,
          payload: {
            ...request.payload,
            session: {
              userId,
              ...session,
            },
          },
        });
      }
    });

    ws.on("close", () => {
      const leaveRequest: ServerUpgradedRequest<LeaveRequest> = {
        type: "request:leave",
        payload: {
          session: {
            userId,
            ...session,
          },
        },
      };
      eventEmitter.emit("message", leaveRequest);
      eventEmitter.removeAllListeners(`message:${userId}`);
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

    // This function is not defined on purpose. Implement it with your own logic.
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
