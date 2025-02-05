import { test as setup } from "@playwright/test"
import { chromium } from "playwright-extra"
import stealth from "puppeteer-extra-plugin-stealth"
import testConfig from "../../playwright.config"
import { ACCESS_TOKEN_COOKIE } from "../../src/initOpenAPI.ts"
import { firstSuperuser, firstSuperuserPassword } from "../config.ts"

setup("authenticate", async () => {
  let accessTokenCookie = null
  try {
    const userJson = await import("../../playwright/.auth/user.json", {
      assert: { type: "json" },
    })
    const cookies: any[] = userJson.default.cookies
    accessTokenCookie = cookies.find((c) => c.name === ACCESS_TOKEN_COOKIE)
  } catch (err) {
    console.error("Error:", err)
  }
  const epochSeconds = Math.floor(Date.now() / 1000)
  if (!accessTokenCookie || (accessTokenCookie.expires ?? 0) < epochSeconds) {
    // Add the plugin to playwright
    chromium.use(stealth())
    // set up the browser and launch it
    const browser = await chromium.launch()
    // open a new blank page
    const page = await browser.newPage()
    await page.goto("/")
    // wait for redirect to google signin page
    await page.waitForURL(
      /https:\/\/accounts\.google\.com\/v3\/signin\/identifier/,
    )
    await page.fill('input[type="email"]', firstSuperuser)
    await page.locator("#identifierNext >> button").click()
    await page.fill(
      '#password >> input[type="password"]',
      firstSuperuserPassword,
    )
    await page.locator("button >> nth=1").click()
    await page.waitForURL(/https:\/\/accounts\.google.com\/signin\/oauth\/id/)
    await page.locator("button >> nth=1").click()
    // Wait for redirect back to tested site after authentication
    await page.waitForURL(testConfig.use?.baseURL ?? "/")
    // Save signed in state
    await page.context().storageState({ path: "playwright/.auth/user.json" })
  }
})
