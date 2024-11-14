import { test as setup } from "@playwright/test"

setup("authenticate", async ({ page }) => {
  await page.goto("/api/v1/auth/login?state=/")
  await page.waitForURL("/")
})
