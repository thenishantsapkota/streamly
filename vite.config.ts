import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  // Server code reads secrets (TMDB_API_KEY, AUTH_*) from process.env; make
  // .env available there in dev the same way the host provides it in prod.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    server: { port: 3000 },
    resolve: { tsconfigPaths: true },
    plugins: [tailwindcss(), tanstackStart(), nitro(), viteReact()],
  };
});
