import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const shell = readFileSync("client/src/components/PublicPageShell.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const routes = readFileSync("client/src/App.tsx", "utf8");
const verification = readFileSync("client/src/pages/CertificateVerification.tsx", "utf8");
const notFound = readFileSync("client/src/pages/NotFound.tsx", "utf8");

describe("sitewide navigation alignment", () => {
  it("keeps the primary public journey links in the shared shell", () => {
    for (const path of ["/about", "/services", "/school-solutions", "/courses", "/assessment", "/careerpath", "/resources"]) {
      expect(shell).toContain(`href: "${path}"`);
    }
    expect(shell).toContain("aria-current={active ? \"page\" : undefined}");
    expect(shell).toContain("isAuthenticated ? \"/dashboard\" : \"/auth?mode=login\"");
    expect(shell).toContain('href="/contact"');
  });

  it("keeps public certificate sharing tied to the canonical verification URL", () => {
    expect(verification).toContain("PUBLISHED_SITE_ORIGIN");
    expect(verification).toContain("copyVerificationUrl");
    expect(verification).toContain("linkedin.com/sharing/share-offsite");
    expect(verification).toContain("facebook.com/sharer/sharer.php");
    expect(verification).toContain("wa.me/?text=");
    expect(verification).toContain("twitter.com/intent/tweet");
    expect(verification).toContain('toast.success("Verification link copied")');
  });

  it("registers credential verification routes before the catch-all fallback", () => {
    expect(routes).toContain('path="/verify/assessment"');
    expect(routes).toContain('path="/verify/certificate"');
    expect(routes).toContain('path="/verify/psychometric"');
    expect(routes.indexOf('path="/verify/assessment"')).toBeLessThan(routes.indexOf('path="/404"'));
  });

  it("keeps the custom 404 page pointed to the homepage", () => {
    expect(notFound).toContain('setLocation("/")');
    expect(notFound).toContain("Return to the Profound IQ Consulting homepage");
  });

  it("keeps home navigation aligned with registered routes and mobile access", () => {
    for (const path of ["/about", "/services", "/courses", "/assessment", "/careerpath", "/resources", "/contact"]) {
      expect(home).toContain(`href: "${path}"`);
      expect(routes).toContain(`path=\"${path}\"`);
    }
    expect(home).toContain('aria-label={menuOpen ? "Close navigation" : "Open navigation"}');
    expect(home).toContain('href="/dashboard"');
    expect(routes).toContain('path="/verify/assessment"');
  });
});
