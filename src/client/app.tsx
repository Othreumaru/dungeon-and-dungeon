import "./app.css";
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
        <GameViewport />
        <ChatWindow />
      </EngineContextProvider>
    </ServerContextProvider>
  );
}

export default App;
