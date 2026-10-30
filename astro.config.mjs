import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://themahol.com",
  trailingSlash: "always",
  output: "server",
  session: { driver: { entrypoint: "unstorage/drivers/memory" } },
  adapter: cloudflare({ imageService: "compile" }),
  vite: { plugins: [tailwindcss()] },
});
