import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProjectHome } from "./project-home";
import { PublicTutorial } from "./public-tutorial";
import "./public.css";
import "./components/compare.css";
import "./project-home.css";

const params = new URLSearchParams(window.location.search);
const lang = params.get("lang") === "ko" ? "ko" : "en";
const tutorialHashes = new Set([
  "tutorial",
  "microscope",
  "candidate-budget",
  "record",
  "equations",
  "model-lab",
  "atlas",
  "reproduce",
  "cite",
]);
const requestedHash = window.location.hash.slice(1);
const showTutorial = params.get("view") === "tutorial" || tutorialHashes.has(requestedHash);
document.documentElement.lang = lang;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {showTutorial ? <PublicTutorial lang={lang} /> : <ProjectHome lang={lang} />}
  </StrictMode>,
);
