import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "@mantine/core/styles.css";
// import "./index.css";
import { SessionProvider } from "./session-context.tsx";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SessionProvider basePath="/auth">
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </SessionProvider>
  </StrictMode>
);
