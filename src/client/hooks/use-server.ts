import { useEffect, useMemo, useRef } from "react";
import EventEmitter from "eventemitter3";
import { JoinRequest } from "../../api";
import { useUserId } from "./use-user-id";

export const useServer = () => {
  const userId = useUserId();
  const socketRef = useRef<WebSocket | null>(null);
  const eventEmitter = useMemo(() => new EventEmitter(), []);

  useEffect(() => {
    if (socketRef.current !== null) {
      return;
    }
    const socket = new WebSocket("ws://localhost:8080");

    socket.onmessage = (event) => {
      console.log(`received: ${event.data}`);
      try {
        eventEmitter.emit("message", JSON.parse(event.data));
      } catch (error) {
        console.error(error);
      }
    };

    socket.onclose = () => {
      console.log("disconnected");
    };

    socket.onopen = () => {
      console.log("connected");
      const JoinRequest: JoinRequest = {
        type: "request:join",
        payload: { userId },
      };
      socket.send(JSON.stringify(JoinRequest));
    };

    socketRef.current = socket;

    eventEmitter.on("request", (data) => {
      console.log(`sending: ${JSON.stringify(data)}`);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
      }
    });
  }, [eventEmitter, userId]);

  return eventEmitter;
};
