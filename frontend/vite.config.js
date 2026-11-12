
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:5000",
      "/jobs": "http://localhost:5000",
      "/applications": "http://localhost:5000",
    },
  },
});
