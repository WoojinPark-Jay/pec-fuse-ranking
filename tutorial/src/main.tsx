import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PublicTutorial } from "./public-tutorial";
import "./public.css";
import "./components/compare.css";

const lang = new URLSearchParams(window.location.search).get("lang") === "ko" ? "ko" : "en";
document.documentElement.lang = lang;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PublicTutorial lang={lang} />
  </StrictMode>,
);
