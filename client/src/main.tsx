import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AppProviders } from "./providers/AppProviders";
import { initAOS } from "./utils/aos";

import "../public/aos.min.js";

initAOS();

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
