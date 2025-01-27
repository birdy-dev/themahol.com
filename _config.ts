import vento from "lume/plugins/vento.ts";
import jsx from "lume/plugins/jsx.ts";
import googleFonts from "lume/plugins/google_fonts.ts";
import lume from "lume/mod.ts";

const site = lume();

/** Override vento default extensions */
site.use(vento({ extensions: [".html"], options: {} }));
site.use(jsx());
// todo: add tailwindcss
site.use(googleFonts({
  fonts:
    "https://fonts.google.com/share?selection.family=Bodoni+Moda:opsz,wght@6..96,688;6..96,800|Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900",
}));

export default site;
