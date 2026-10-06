import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/pec-fuse-ranking/" : "/",
  build: { outDir: "dist", emptyOutDir: true },
}));
