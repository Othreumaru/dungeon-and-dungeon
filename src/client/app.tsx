import "./app.css";
import { ChatWindow } from "./components/chat-window/chat-window";
import { GameViewport } from "./components/game-viewport/game-viewport";
import { EngineContextProvider } from "./engine-context";
import { ServerContextProvider } from "./server-context";

function App() {
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
