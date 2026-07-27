import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  css: {
    devSourcemap: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const modulePath = id.replaceAll("\\", "/");

          if (!modulePath.includes("/node_modules/")) return;
          if (
            modulePath.includes("/@firebase+") ||
            modulePath.includes("/firebase@")
          ) {
            return "firebase";
          }
          if (modulePath.includes("/sweetalert2@")) return "alerts";
          if (
            modulePath.includes("/framer-motion@") ||
            modulePath.includes("/motion-dom@") ||
            modulePath.includes("/motion-utils@")
          ) {
            return "motion";
          }
          if (modulePath.includes("/gsap@")) return "gsap";
          if (
            modulePath.includes("/@tiptap+") ||
            modulePath.includes("/prosemirror-") ||
            modulePath.includes("/linkifyjs@")
          ) {
            return "editor";
          }
          if (
            modulePath.includes("/highlight.js@") ||
            modulePath.includes("/lowlight@")
          ) {
            return "syntax-highlighting";
          }
        },
      },
    },
  },
});



