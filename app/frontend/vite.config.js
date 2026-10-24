
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
    proxy: {
      "/api": "http://localhost:8000",
      "/webhooks": "http://localhost:8000",
      "/renders": "http://localhost:8000",
      "/outbound": "http://localhost:8000",
      "/health": "http://localhost:8000"
    }
  },
  plugins: [react(), tailwindcss()],
  base: "/"
});
