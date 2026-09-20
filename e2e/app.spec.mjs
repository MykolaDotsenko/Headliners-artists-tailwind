import { expect, test } from "@playwright/test";

test("core content and responsive images render without broken media", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();

  await expect(page).toHaveTitle(/Headliners/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Seven nights");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

  await page.waitForLoadState("networkidle");
  const images = page.locator("img");

  for (let index = 0; index < (await images.count()); index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
      .toBe(true);
  }
});

test("theme choice persists and updates browser theme metadata", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /switch to .* theme/i });
  const initialDark = await page.locator("html").evaluate((element) =>
    element.classList.contains("dark"),
  );

  await toggle.click();
  await expect
    .poll(() => page.locator("html").evaluate((element) => element.classList.contains("dark")))
    .toBe(!initialDark);

  const expectedColor = initialDark ? "#f4f4f5" : "#09090b";
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", expectedColor);

  await page.reload();
  await expect
    .poll(() => page.locator("html").evaluate((element) => element.classList.contains("dark")))
    .toBe(!initialDark);
});

test("carousel controls move the artist rail", async ({ page }) => {
  await page.goto("/");
  const carousel = page.locator("#carousel");
  const next = page.getByRole("button", { name: "Show next artists" });

  const before = await carousel.evaluate((element) => element.scrollLeft);
  await next.click();

  await expect
    .poll(() => carousel.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(before);
});

test("newsletter demo validates input and never performs a network submission", async ({ page }) => {
  const writes = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });

  await page.goto("/");
  const input = page.getByLabel("Email address");
  const submit = page.getByRole("button", { name: "Try demo" });

  await input.fill("invalid");
  await submit.click();
  await expect(page.locator("#newsletter-status")).toContainText("valid email");

  await input.fill("reader@example.com");
  await submit.click();
  await expect(page.locator("#newsletter-status")).toContainText("not sent or stored");
  await expect(input).toHaveValue("");
  expect(writes).toEqual([]);
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, exposes state, and closes with Escape while restoring focus", async ({ page }) => {
    await page.goto("/");
    const button = page.locator("#mobile-menu-button");
    await expect(button).toHaveAttribute("aria-label", "Open navigation menu");

    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-menu")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#mobile-menu")).toBeHidden();
    await expect(button).toBeFocused();
  });
});
