import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { tutorialHashes } from "./tutorial-routes";
import "./public.css";
import "./components/compare.css";
import "./project-home.css";
import "./tutorial-refinement.css";
import "./research-companion.css";

const ProjectHome = lazy(() => import("./project-home").then((module) => ({ default: module.ProjectHome })));
const PublicTutorial = lazy(() => import("./public-tutorial").then((module) => ({ default: module.PublicTutorial })));

const params = new URLSearchParams(window.location.search);
// Korean copy is retained in source for future use, but the public site is English-only for now.
const lang = "en" as const;
const requestedHash = window.location.hash.slice(1);
const showTutorial = params.get("view") === "tutorial" || tutorialHashes.has(requestedHash);
document.documentElement.lang = lang;
document.documentElement.dataset.view = showTutorial ? "tutorial" : "project";
document.title = showTutorial ? "PEC-Fuse | Research Companion" : "PEC-Fuse | Research Project";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<div className="app-loading" role="status">Loading PEC-Fuse</div>}>
      {showTutorial ? <PublicTutorial lang={lang} /> : <ProjectHome lang={lang} />}
    </Suspense>
  </StrictMode>,
);
