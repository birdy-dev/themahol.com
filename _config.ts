import vento from "lume/plugins/vento.ts";
import jsx from "lume/plugins/jsx.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import postcss from "lume/plugins/postcss.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import lume from "lume/mod.ts";

const site = lume({ src: "src" });

/** Override vento default extensions because the Vento plugin is not that great */
site.use(vento({ extensions: [".html"], options: {} }));
site.use(jsx());
site.use(tailwindcss({
  options: {
    theme: {
      fontFamily: {
        "sans": ["Inter", "sans-serif"],
        "serif": ["Bodoni Moda", "serif"],
      },
    },
  },
}));
site.use(postcss());
site.use(googleFonts({
  cssFile: "styles.css", // appends if already exists
  fonts:
    "https://fonts.google.com/share?selection.family=Bodoni+Moda:opsz,wght@6..96,688;6..96,800|Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900",
}));

export default site;
