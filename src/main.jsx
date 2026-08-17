import React from "react";
import { createRoot } from "react-dom/client";
import { StoreProvider } from "./lib/store.jsx";
import { initSecurity } from "./lib/security.js";
import App from "./App.jsx";
import "./index.css";

initSecurity();

const rootEl = document.getElementById("root");
createRoot(rootEl).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
);
