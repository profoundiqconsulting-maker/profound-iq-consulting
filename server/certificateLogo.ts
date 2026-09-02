import { readFileSync } from "node:fs";
import { join } from "node:path";

const LOGO_PATH = join(process.cwd(), "client/public/ProfoundIQLogo.png");

export const CERTIFICATE_LOGO_DATA_URI = (() => {
  try {
    const bytes = readFileSync(LOGO_PATH);
    const base64 = Buffer.from(bytes).toString("base64");
    return `data:image/png;base64,${base64}`;
  } catch {
    return "";
  }
})();
