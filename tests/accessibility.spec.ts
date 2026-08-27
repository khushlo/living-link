import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_PAGES = [
  { name: "Home", path: "/" },
  { name: "Sign In", path: "/sign-in" },
  { name: "Eligibility screener", path: "/could-i-qualify" },
  { name: "Ripple calculator", path: "/ripple" },
  { name: "Waitlist map", path: "/waitlist-map" },
  { name: "Donor stories", path: "/stories" },
  { name: "Conversation practice", path: "/start-conversation" },
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

test("public pages have one main landmark and unique ids", async ({ page }) => {
  for (const publicPage of PUBLIC_PAGES) {
    await page.goto(`http://localhost:3000${publicPage.path}`);
    await expect(page.locator("main#main-content")).toHaveCount(1);
    expect(await page.locator("main").count()).toBe(1);
    const ids = await page.locator("[id]").evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size, `${publicPage.name} contains duplicate ids`).toBe(ids.length);
  }
});

test("public navigation supports Escape and returns focus to the menu button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000/");
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  await expect(page.getByRole("button", { name: "Close menu" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});
