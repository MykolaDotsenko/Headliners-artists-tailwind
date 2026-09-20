import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("has no WCAG A/AA or WCAG 2.2 AA axe violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});
