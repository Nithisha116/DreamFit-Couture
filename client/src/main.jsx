import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import "./index.css";
import AppRouter from "./routes/AppRouter";
import { store } from "./app/store";
import { persistor } from "./app/persistor";

import ConflictModal from "./components/ConflictModal";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppRouter />
        <ConflictModal />
      </PersistGate>
    </Provider>
  </StrictMode>
);
