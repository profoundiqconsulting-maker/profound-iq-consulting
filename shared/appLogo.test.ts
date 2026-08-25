import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_URL } from "../client/src/components/BrandLogo";

const documentHead = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");

describe("shared app logo configuration", () => {
  it("uses the close-fit uploaded Profound IQ header logo asset", () => {
    expect(LOGO_URL).toBe("/manus-storage/ProfoundIQLogo-header_aad21220.jpg");
    expect(LOGO_URL).toMatch(/^\/manus-storage\/ProfoundIQLogo-header_.*\.jpg$/);
  });

  it("uses a real favicon and optimized brand images for metadata", () => {
    expect(documentHead).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico" />');
    expect(documentHead).toContain('<link rel="icon" type="image/png" sizes="256x256" href="/manus-storage/ProfoundIQ-favicon_7fd69208.png" />');
    expect(documentHead).toContain('<link rel="apple-touch-icon" sizes="256x256" href="/manus-storage/ProfoundIQ-favicon_7fd69208.png" />');
    expect(documentHead).toContain('<meta property="og:image" content="/manus-storage/ProfoundIQLogo-header_aad21220.jpg" />');
  });
});
