import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections
    port: 5173,
    allowedHosts: [
      "thinktogether.tech",
      "www.thinktogether.tech",
      "143.110.176.130",
    ],
    hmr: {
      port: 5173,
      host: "143.110.176.130", // Use your server's public IP
    },
  },
});
