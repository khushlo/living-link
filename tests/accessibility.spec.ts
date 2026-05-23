import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_PAGES = [
  { name: "Home", path: "/" },
  { name: "Sign In", path: "/sign-in" },
];

for (const page of PUBLIC_PAGES) {
  test(`${page.name} — no accessibility violations`, async ({ page: playwright }) => {
    await playwright.goto(`http://localhost:3000${page.path}`);
    await playwright.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page: playwright })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();

    expect(
      results.violations,
      `${page.name} has ${results.violations.length} axe violation(s):\n` +
        results.violations
          .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    ${v.helpUrl}`)
          .join("\n")
    ).toHaveLength(0);
  });
}
