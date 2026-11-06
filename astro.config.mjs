import { defineConfig, fontProviders } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://themahol.com",
  trailingSlash: "always",
  fonts: [
    {
      name: "Inter",
      cssVariable: "--font-inter",
      provider: fontProviders.google(),
      weights: ["100 900"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      name: "Oswald",
      cssVariable: "--font-oswald",
      provider: fontProviders.google(),
      weights: ["200 700"],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  output: "server",
  session: { driver: { entrypoint: "unstorage/drivers/memory" } },
  adapter: cloudflare({ imageService: "compile" }),
  vite: { plugins: [tailwindcss()] },
});
