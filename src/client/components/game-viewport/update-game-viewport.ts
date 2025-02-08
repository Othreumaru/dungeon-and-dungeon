import { RootState as RTFState } from "@react-three/fiber";
import { Responses } from "../../../protocol/responses";

export const context = {
  updateGameViewport: () => {
    // do nothing
  },
};

let serverStartTimeInLocalTime = 0;

const updateGameViewportConnected = (state: RTFState, delta: number) => {
  console.log("updateGameViewport", state, delta);
};

let syncRequestTimestamp = 0;

const socket = new WebSocket(
  `${location.protocol === "https:" ? "wss" : "ws"}://${location.host === "localhost:5173" ? "localhost:8080" : location.host}`
);

socket.onmessage = (event) => {
  // console.log(`received: ${event.data}`);
  try {
    const action: Responses = JSON.parse(event.data);
    if (action.type === "response:sync") {
      const now = Date.now();
      const requestResponseTime = now - syncRequestTimestamp;
      const latency = requestResponseTime / 2;
      console.log(`latency: ${latency}ms`);
      const serverTime = action.payload.serverCurrentTime + latency;

      const offset = serverTime - now - latency;
      serverStartTimeInLocalTime = serverTime - offset;
      console.log(`offset: ${offset}ms`);
      console.log("serverStartTimeInLocalTime", serverStartTimeInLocalTime);
      context.updateGameViewport = updateGameViewportConnected;
      // setUserId(action.payload.userId);
      /*eventEmitter.emit("sync", {
        state: action.payload.state,
        serverStartTimeInLocalTime,
      });*/
    }
    // eventEmitter.emit("response", action);
  } catch (error) {
    console.error(error);
  }
};

socket.onopen = () => {
  syncRequestTimestamp = Date.now();
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

/*eventEmitter.on("request", (data) => {
  console.log(`sending: ${JSON.stringify(data, null, 2)}`);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  }
});*/
