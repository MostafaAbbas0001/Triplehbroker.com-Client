import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  publicDir: "src/public",
  server: {
    host: "::",
    port: 8080,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    ...(command === "build"
      ? [
          nitro({
            defaultPreset: "cloudflare-module",
            publicAssets: [{ baseURL: "/", dir: "src/public", maxAge: 86_400 }],
          }),
        ]
      : []),
    viteReact(),
  ],
}));
