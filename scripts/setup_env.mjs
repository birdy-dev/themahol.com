import { constants, copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const destination = fileURLToPath(new URL("../.env", import.meta.url));
if (existsSync(destination)) {
  console.log("Keeping your existing .env file.");
} else {
  copyFileSync(new URL("../.env.example", import.meta.url), destination, constants.COPYFILE_EXCL);
  console.log("Created .env. Add Stripe test credentials to enable local checkout.");
}
