import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    // Fix: Split vendor chunks (e.g., react, firebase, etc.)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("firebase")) return "vendor-firebase";
            return "vendor";
          }
        },
      },
    },
    // Optional: raise limit if absolutely necessary (but don't rely on this)
    chunkSizeWarningLimit: 1000, // optional — default is 500
  },
});
