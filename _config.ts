import vento from "lume/plugins/vento.ts";
import nav from "lume/plugins/nav.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import icons from "lume/plugins/icons.ts";
import inline from "lume/plugins/inline.ts";
import picture from "lume/plugins/picture.ts";
import transformImages from "lume/plugins/transform_images.ts";
import metas from "lume/plugins/metas.ts";
import lume from "lume/mod.ts";

const site = lume({ src: "src" });

/** Override vento default extensions because the Vento plugin is not that great */
site.use(vento({ extensions: [".html"], options: {} }));
site.use(nav());
site.use(jsx());
site.use(tailwindcss({
  extensions: [".html", ".tsx", ".vto"],
  options: {
    theme: {
      extend: {
        fontFamily: {
          "sans": ["Inter", "sans-serif"],
          "title": ["Oswald", "sans-serif"],
        },
        colors: {
          "white": "#fdfdfd",
          "black": "#090909"
        },
        animation: {
          "marquee": "marquee 100s linear infinite",
        },
        keyframes: {
          "marquee": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-100%)" },
          },
        },
      },
    },
  },
}));
site.use(postcss());
site.use(googleFonts({
  cssFile: "styles.css", // appends if already exists
  fonts:
    "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Oswald:wght@200..700&display=swap",
}));
site.use(icons());
site.use(inline());
site.use(metas());

/// images
site.loadAssets([".jpg", ".svg"]);
site.use(picture());
site.use(transformImages());

export default site;
