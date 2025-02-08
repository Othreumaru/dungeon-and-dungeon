import { useEffect, useMemo, useRef } from "react";
import EventEmitter from "eventemitter3";
import { useUserId } from "./use-user-id";
import { Responses } from "../../protocol/responses";
import type { RootState } from "../../protocol/state";

export type SyncMessage = {
  state: RootState;
  serverStartTimeInLocalTime: number;
};

export const useServer = () => {
  const { setUserId } = useUserId();
  const socketRef = useRef<WebSocket | null>(null);
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const syncRequestTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (socketRef.current !== null) {
      return;
    }
    const socket = new WebSocket(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host === "localhost:5173" ? "localhost:8080" : location.host}`
    );

    socket.onmessage = (event) => {
      // console.log(`received: ${event.data}`);
      try {
        const action: Responses = JSON.parse(event.data);
        if (action.type === "response:sync") {
          const now = Date.now();
          const requestResponseTime = now - syncRequestTimestampRef.current;
          const latency = requestResponseTime / 2;
          console.log(`latency: ${latency}ms`);
          const serverTime = action.payload.serverCurrentTime + latency;

          const offset = serverTime - now - latency;
          const serverStartTimeInLocalTime = serverTime - offset;
          console.log(`offset: ${offset}ms`);
          setUserId(action.payload.userId);
          eventEmitter.emit("sync", {
            state: action.payload.state,
            serverStartTimeInLocalTime,
          });
        }
        eventEmitter.emit("response", action);
      } catch (error) {
        console.error(error);
      }
    };

    socket.onopen = () => {
      syncRequestTimestampRef.current = Date.now();
      socket.send(
        JSON.stringify({
          type: "request:sync",
          payload: {
            tick: 0,
          },
        })
      );
    };

    socket.onclose = () => {
      console.log("disconnected");
    };

    socketRef.current = socket;

    eventEmitter.on("request", (data) => {
      console.log(`sending: ${JSON.stringify(data, null, 2)}`);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    });
  }, [eventEmitter, setUserId]);

  return eventEmitter;
};
