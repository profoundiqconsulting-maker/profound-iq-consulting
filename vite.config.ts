import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const plugins = [react(), tailwindcss(), jsxLocPlugin()];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(import.meta.dirname), "");
  const basePath = env.VITE_BASE_PATH?.replace(/\/+$/, "") || "";

  return {
    base: basePath ? `${basePath}/` : "/",
    plugins,
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
      minify: "esbuild",
      cssMinify: "esbuild",
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "wouter"],
            "vendor-trpc": ["@trpc/client", "@trpc/react-query", "@tanstack/react-query"],
            "vendor-icons": ["lucide-react"],
            "vendor-radix": [
              "@radix-ui/react-accordion",
              "@radix-ui/react-alert-dialog",
              "@radix-ui/react-aspect-ratio",
              "@radix-ui/react-avatar",
              "@radix-ui/react-checkbox",
              "@radix-ui/react-collapsible",
              "@radix-ui/react-context-menu",
              "@radix-ui/react-dialog",
              "@radix-ui/react-dropdown-menu",
              "@radix-ui/react-hover-card",
              "@radix-ui/react-label",
              "@radix-ui/react-menubar",
              "@radix-ui/react-navigation-menu",
              "@radix-ui/react-popover",
              "@radix-ui/react-progress",
              "@radix-ui/react-radio-group",
              "@radix-ui/react-scroll-area",
              "@radix-ui/react-select",
              "@radix-ui/react-separator",
              "@radix-ui/react-slider",
              "@radix-ui/react-slot",
              "@radix-ui/react-switch",
              "@radix-ui/react-tabs",
              "@radix-ui/react-toggle",
              "@radix-ui/react-toggle-group",
              "@radix-ui/react-tooltip",
            ],
            "vendor-charts": ["recharts"],
            "vendor-utils": [
              "clsx",
              "class-variance-authority",
              "date-fns",
              "next-themes",
            ],
            "vendor-forms": ["react-hook-form"],
            "vendor-framer-motion": ["framer-motion"],
            "vendor-sonner": ["sonner"],
            "vendor-streamdown": ["streamdown"],
            "vendor-ui-extras": [
              "input-otp",
              "react-resizable-panels",
              "vaul",
            ],
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
