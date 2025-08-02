/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  test: {
    globals: true,
    // Exclude Playwright component tests from Vitest
    exclude: ["**/node_modules/**", "**/*.tsx"],
  },
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
});
