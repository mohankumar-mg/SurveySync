import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { GlobalProvider } from "./GlobalContext";
import "./styles/index.css";
import App from "./components/App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <GlobalProvider>
        <StrictMode>
          <App />
        </StrictMode>
      </GlobalProvider>
    </AuthProvider>
  </BrowserRouter>
);
