import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "./index.css";
import { SessionProvider } from "./session-context.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider baseUrl="/auth">
      <App />
    </SessionProvider>
  </StrictMode>
);
