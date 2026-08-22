import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_URL } from "../client/src/components/BrandLogo";

const documentHead = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");

describe("shared app logo configuration", () => {
  it("uses the uploaded Profound IQ logo asset", () => {
    expect(LOGO_URL).toBe("/manus-storage/ProfoundIQLogo3-cropped_15edcfe0.png");
    expect(LOGO_URL).toMatch(/^\/manus-storage\/ProfoundIQLogo3-cropped_.*\.png$/);
  });

  it("uses the logo for favicon and social metadata", () => {
    expect(documentHead).toContain(`<link rel="icon" type="image/png" href="${LOGO_URL}" />`);
    expect(documentHead).toContain(`<link rel="apple-touch-icon" href="${LOGO_URL}" />`);
    expect(documentHead).toContain(`<meta property="og:image" content="${LOGO_URL}" />`);
  });
});
