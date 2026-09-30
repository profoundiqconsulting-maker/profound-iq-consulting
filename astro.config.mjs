import tailwindcss from "@tailwindcss/vite";
import react from "@astrojs/react";
import path from "node:path";
import { defineConfig } from "astro/config";

const root = import.meta.dirname;

export default defineConfig({
  site: "https://www.profoundiqconsulting.com",
  base: "/",
  output: "static",
  integrations: [react()],
  publicDir: path.resolve(root, "client", "public"),
  outDir: path.resolve(root, "dist", "astro"),
  build: {
    format: "directory",
  },
  vite: {
    envDir: root,
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(root, "client", "src").replace(/\\/g, "/"),
        "@shared": path.resolve(root, "shared").replace(/\\/g, "/"),
        "@assets": path.resolve(root, "attached_assets").replace(/\\/g, "/"),
      },
    },
    server: {
      fs: {
        strict: false,
        allow: [root],
      },
      proxy: {
        "/api/trpc": {
          target: "http://127.0.0.1:3000",
          changeOrigin: true,
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 4321,
  },
});
