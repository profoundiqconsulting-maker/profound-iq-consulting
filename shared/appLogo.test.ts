import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGO_URL } from "../client/src/components/BrandLogo";

const documentHead = readFileSync(new URL("../client/index.html", import.meta.url), "utf8");

describe("shared app logo configuration", () => {
  it("uses the close-fit uploaded Profound IQ header logo asset", () => {
    expect(LOGO_URL).toBe("/manus-storage/profound-iq-logo_b3f171ae.webp");
    expect(LOGO_URL).toMatch(/^\/manus-storage\/profound-iq-logo_.*\.webp$/);
  });

  it("uses a real favicon and optimized brand images for metadata", () => {
    expect(documentHead).toContain('<link rel="icon" type="image/x-icon" href="/favicon.ico" />');
    expect(documentHead).toContain('<link rel="icon" type="image/png" sizes="256x256" href="/manus-storage/ProfoundIQ-favicon_7fd69208.png" />');
    expect(documentHead).toContain('<link rel="apple-touch-icon" sizes="256x256" href="/manus-storage/ProfoundIQ-favicon_7fd69208.png" />');
    expect(documentHead).toContain('<meta property="og:image" content="https://profoundiq-vguqrhsm.manus.space/manus-storage/profound-iq-social-preview_9d540b32.png" />');
    expect(documentHead).toContain('<meta property="og:image:width" content="1200" />');
    expect(documentHead).toContain('<meta property="og:image:height" content="630" />');
  });
});
