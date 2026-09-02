import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_URL } from "../client/src/components/BrandLogo";

const documentHead = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");

describe("shared app logo configuration", () => {
  it("uses the close-fit uploaded Profound IQ header logo asset", () => {
    expect(LOGO_URL).toBe("/ProfoundIQLogo.png");
    expect(LOGO_URL).toMatch(/^\/ProfoundIQLogo\.png$/);
  });

  it("uses a real favicon and optimized brand images for metadata", () => {
    expect(documentHead).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico" />');
    expect(documentHead).toContain('<meta property="og:image" content="http://localhost:3000/profound-iq-social-preview.svg" />');
    expect(documentHead).toContain('<meta property="og:image:width" content="1200" />');
    expect(documentHead).toContain('<meta property="og:image:height" content="630" />');
  });
});
