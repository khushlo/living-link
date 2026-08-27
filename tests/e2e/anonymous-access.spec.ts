import { expect, test } from "@playwright/test";

test("an anonymous visitor can open a public route", async ({ page }) => {
  const response = await page.goto("/stories");

  expect(response?.ok()).toBe(true);
  await expect(page).toHaveURL(/\/stories$/);
  await expect(page.locator("main#main-content")).toBeVisible();
});

test("an anonymous visitor is redirected from a protected neighbor", async ({ page }) => {
  await page.goto("/stories/share");

  await expect(page).toHaveURL(/\/sign-in(?:[/?]|$)/);
  expect(new URL(page.url()).searchParams.get("redirect_url")).toContain("/stories/share");
});
