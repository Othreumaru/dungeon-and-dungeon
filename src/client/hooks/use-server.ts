import { useEffect, useMemo, useRef } from "react";
import EventEmitter from "eventemitter3";
import { Actions } from "../../api";
import { useUserId } from "./use-user-id";

export const useServer = () => {
  const { setUserId } = useUserId();
  const socketRef = useRef<WebSocket | null>(null);
  const eventEmitter = useMemo(() => new EventEmitter(), []);

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
          setUserId(action.payload.userId);
        }
        eventEmitter.emit("message", action);
      } catch (error) {
        console.error(error);
      }
    };

    socket.onclose = () => {
      console.log("disconnected");
    };

    socketRef.current = socket;

    eventEmitter.on("request", (data) => {
      console.log(`sending: ${JSON.stringify(data)}`);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    });
  }, [eventEmitter, setUserId]);

  return eventEmitter;
};
