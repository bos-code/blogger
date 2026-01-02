import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  css: {
    // Suppress @property warnings from DaisyUI
    // @property is valid CSS (CSS Houdini) but not recognized by all processors
    // It will work correctly in browsers that support it (Chrome, Edge, Safari)
    devSourcemap: true,
  },
  build: {
    // Fix: Split vendor chunks (e.g., react, firebase, etc.)
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "vendor-react";
            if (id.includes("firebase")) return "vendor-firebase";
            return "vendor";
          }
        },
      },
    },
    // Optional: raise limit if absolutely necessary (but don't rely on this)
    chunkSizeWarningLimit: 4000, // optional — default is 500
    // Note: The @property warning from DaisyUI is harmless - it's valid CSS that browsers support
    // Vite's CSS optimizer doesn't recognize it, but it will work correctly in the browser
  },
});





