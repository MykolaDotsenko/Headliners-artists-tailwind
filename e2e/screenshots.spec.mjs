import { mkdir } from "node:fs/promises";
import { test } from "@playwright/test";

const outputDir = "artifacts/screenshots";

async function prepare(page, viewport) {
  await mkdir(outputDir, { recursive: true });
  await page.setViewportSize(viewport);
  await page.addInitScript(() => localStorage.setItem("headliners-theme", "dark"));
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content: "*,*::before,*::after{animation:none!important;transition:none!important}"
  });
}

test("capture desktop portfolio screenshot", async ({ page }) => {
  await prepare(page, { width: 1440, height: 1000 });
  await page.screenshot({
    path: `${outputDir}/headliners-desktop.jpg`,
    type: "jpeg",
    quality: 86,
    fullPage: false
  });
});

test("capture mobile portfolio screenshot", async ({ page }) => {
  await prepare(page, { width: 390, height: 844 });
  await page.screenshot({
    path: `${outputDir}/headliners-mobile.jpg`,
    type: "jpeg",
    quality: 86,
    fullPage: false
  });
});
