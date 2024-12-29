import { useEffect, useMemo, useRef, useState } from "react";
import EventEmitter from "eventemitter3";
import { Actions } from "../../protocol/actions";
import { useUserId } from "./use-user-id";

export const useServer = () => {
  const { setUserId } = useUserId();
  const socketRef = useRef<WebSocket | null>(null);
  const eventEmitter = useMemo(() => new EventEmitter(), []);
  const [syncRequestTimestamp, setSyncRequestTimestamp] = useState(0);

  useEffect(() => {
    if (socketRef.current !== null) {
      return;
    }
    const socket = new WebSocket(
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.host === "localhost:5173" ? "localhost:8080" : location.host}`
    );

    socket.onmessage = (event) => {
      console.log(`received: ${event.data}`);
      try {
        const action: Actions = JSON.parse(event.data);
        if (action.type === "action:sync") {
          const now = Date.now();
          const latency = (now - syncRequestTimestamp) / 2;
          console.log(`latency: ${latency}ms`);
          const serverTime = action.payload.serverTime + latency;
          const offset = serverTime - now;
          console.log(`offset: ${offset}ms`);
          setUserId(action.payload.userId);
        }
        eventEmitter.emit("message", action);
      } catch (error) {
        console.error(error);
      }
    };

    socket.onopen = () => {
      setSyncRequestTimestamp(Date.now());
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
