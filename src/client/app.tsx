import { Canvas } from "@react-three/fiber";
import "./app.css";
import { ActionToolbar } from "./components/action-toolbar/action-toolbar";
import { ChatWindow } from "./components/chat-window/chat-window";
import { GameViewport } from "./components/game-viewport/game-viewport";
import { EngineContextProvider } from "./engine-context";
import { ServerContextProvider } from "./server-context";
import { signIn, useSession } from "./session-context";

function App() {
  const { data: session } = useSession();
  if (!session) {
    return (
      <>
        Not signed in <br />
        <button
          onClick={() =>
            signIn("GitHub", {
              baseUrl: "/auth",
            })
          }
        >
          Sign in
        </button>
      </>
    );
  }
  return (
    <ServerContextProvider>
      <EngineContextProvider>
        <Canvas
          shadows={true}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            background: "lightgray",
          }}
          camera={{ position: [5, 6, 12], rotation: [1.7 * Math.PI, 0, 0] }}
        >
          <GameViewport />
        </Canvas>
        <ChatWindow />
        <ActionToolbar />
      </EngineContextProvider>
    </ServerContextProvider>
  );
}

export default App;
