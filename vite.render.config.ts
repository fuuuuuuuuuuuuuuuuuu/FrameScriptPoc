import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-render",
    rollupOptions: {
      input: {
        render: resolve(__dirname, "render.html"),
      },
    },
  },
});
