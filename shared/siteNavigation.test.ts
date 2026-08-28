import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const shell = readFileSync("client/src/components/PublicPageShell.tsx", "utf8");
const home = readFileSync("client/src/pages/Home.tsx", "utf8");
const routes = readFileSync("client/src/App.tsx", "utf8");

describe("sitewide navigation alignment", () => {
  it("keeps the primary public journey links in the shared shell", () => {
    for (const path of ["/about", "/services", "/school-solutions", "/courses", "/assessment", "/careerpath", "/resources"]) {
      expect(shell).toContain(`href: "${path}"`);
    }
    expect(shell).toContain("aria-current={active ? \"page\" : undefined}");
    expect(shell).toContain("isAuthenticated ? \"/dashboard\" : \"/auth?mode=login\"");
    expect(shell).toContain('href="/contact"');
  });

  it("keeps home navigation aligned with registered routes and mobile access", () => {
    for (const path of ["/about", "/services", "/courses", "/assessment", "/careerpath", "/resources", "/contact"]) {
      expect(home).toContain(`href: "${path}"`);
      expect(routes).toContain(`path=\"${path}\"`);
    }
    expect(home).toContain('aria-label={menuOpen ? "Close navigation" : "Open navigation"}');
    expect(home).toContain('href="/dashboard"');
  });
});
