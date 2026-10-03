import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const plugins = [react(), tailwindcss()];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const basePath = env.VITE_BASE_PATH?.replace(/\/+$/, "") || "";

  const isAnalyze = mode === "analyze";

  return {
    base: basePath ? `${basePath}/` : "/",
    plugins: isAnalyze ? [...plugins, visualizer({ filename: "dist/stats.html", open: false, gzipSize: true, brotliSize: true })] : plugins,
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src").replace(/\\/g, "/"),
        "@shared": path.resolve(import.meta.dirname, "shared").replace(/\\/g, "/"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets").replace(/\\/g, "/"),
      },
    },
    envDir: path.resolve(import.meta.dirname),
    root: path.resolve(import.meta.dirname, "client"),
    publicDir: path.resolve(import.meta.dirname, "client", "public"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      chunkSizeWarningLimit: 3000,
      sourcemap: false,
      reportCompressedSize: false,
      rolldownOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules/react/")) return "vendor-react";
            if (id.includes("node_modules/react-dom/")) return "vendor-react";
            if (id.includes("node_modules/wouter")) return "vendor-react";
            if (id.includes("node_modules/@trpc")) return "vendor-trpc";
            if (id.includes("node_modules/@tanstack")) return "vendor-trpc";
            if (id.includes("node_modules/clsx")) return "vendor-utils";
            if (id.includes("node_modules/class-variance-authority")) return "vendor-utils";
            if (id.includes("node_modules/date-fns")) return "vendor-utils";
            if (id.includes("node_modules/next-themes")) return "vendor-utils";
            if (id.includes("node_modules/react-hook-form")) return "vendor-forms";
            if (id.includes("node_modules/framer-motion")) return "vendor-framer-motion";
            if (id.includes("node_modules/streamdown")) return "vendor-streamdown";
            if (id.includes("node_modules/input-otp")) return "vendor-ui-extras";
            if (id.includes("node_modules/react-resizable-panels")) return "vendor-ui-extras";
            if (id.includes("node_modules/vaul")) return "vendor-ui-extras";
          },
        },
      },
    },
    server: {
      host: "127.0.0.1",
      allowedHosts: ["localhost", "127.0.0.1"],
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        "/api/trpc": {
          target: "http://localhost:3000",
          changeOrigin: true,
        },
      },
    },
  };
});
