import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const shell = readFileSync("client/src/components/PublicPageShell.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const routes = readFileSync("client/src/App.tsx", "utf8");
const verification = readFileSync(
  "client/src/pages/CertificateVerification.tsx",
  "utf8"
);
const notFound = readFileSync("client/src/pages/NotFound.tsx", "utf8");
const brandLogo = readFileSync("client/src/components/BrandLogo.tsx", "utf8");
const siteNav = readFileSync(
  "client/src/components/SiteNavigation.tsx",
  "utf8"
);

describe("sitewide navigation alignment", () => {
  it("keeps the primary public journey links in the shared shell", () => {
    for (const path of [
      "/about",
      "/services",
      "/school-solutions",
      "/courses",
      "/assessment",
      "/careerpath",
      "/resources",
    ]) {
      expect(siteNav).toContain(`href: "${path}"`);
    }
    expect(siteNav).toContain(
      'aria-current={item.active ? "page" : undefined}'
    );
    expect(siteNav).toContain(
      'isAuthenticated ? "/dashboard" : "/auth?mode=login"'
    );
    expect(shell).toContain('href="/contact"');
  });

  it("keeps public certificate sharing tied to the canonical verification URL", () => {
    expect(verification).toContain("PUBLISHED_SITE_ORIGIN");
    expect(verification).toContain("copyVerificationUrl");
    expect(verification).toContain("linkedin.com/sharing/share-offsite");
    expect(verification).toContain("facebook.com/sharer/sharer.php");
    expect(verification).toContain("wa.me/?text=");
    expect(verification).toContain("twitter.com/intent/tweet");
    expect(verification).toContain("navigator.share");
    expect(verification).toContain('recordShareEvent("native")');
    expect(verification).toContain("recordCertificateShare");
    expect(verification).toContain("actions.copied");
    for (const locale of [
      "en",
      "sw",
      "fr",
      "es",
      "pt",
      "ar",
      "zh",
      "hi",
      "de",
      "ja",
    ])
      expect(verification).toContain(`${locale}: {`);
    expect(verification).toContain("nativeShareSupported");
  });

  it("registers credential verification routes before the catch-all fallback", () => {
    expect(routes).toContain('path="/verify/assessment"');
    expect(routes).toContain('path="/verify/certificate"');
    expect(routes).toContain('path="/verify/psychometric"');
    expect(routes.indexOf('path="/verify/assessment"')).toBeLessThan(
      routes.indexOf('path="/404"')
    );
  });

  it("keeps the custom 404 page pointed to the homepage", () => {
    expect(notFound).toContain('setLocation("/")');
    expect(notFound).toContain("Return to the Profound IQ Consulting homepage");
  });

  it("keeps shared branding and sticky navigation resilient", () => {
    expect(brandLogo).toContain('const LOGO_URL = "/ProfoundIQLogo.png"');
    expect(brandLogo).toContain("onError={() => setFailed(true)}");
    expect(brandLogo).toContain("data-brand-logo");
    expect(siteNav).toContain("data-sticky-navigation");
    expect(siteNav).toContain("sticky top-0 z-50");
    expect(siteNav).toContain("data-compact={isCompact}");
    expect(siteNav).toContain('aria-label="Back to top"');
    expect(shell).toContain('aria-label="Social media links"');
    expect(siteNav).toContain("data-sticky-navigation");
    expect(siteNav).toContain("sticky top-0 z-50");
    expect(siteNav).toContain("data-compact={isCompact}");
    expect(siteNav).toContain('aria-label="Back to top"');
  });

  it("keeps home navigation aligned with registered routes and mobile access", () => {
    for (const path of [
      "/about",
      "/services",
      "/courses",
      "/assessment",
      "/careerpath",
      "/resources",
      "/contact",
    ]) {
      expect(siteNav).toContain(`href: "${path}"`);
      expect(routes).toContain(`path=\"${path}\"`);
    }
    expect(siteNav).toContain(
      'aria-label={menuOpen ? "Close navigation" : "Open navigation"}'
    );
    expect(siteNav).toContain('href="/dashboard"');
    expect(routes).toContain('path="/verify/assessment"');
  });
});
