import { test as setup } from "@playwright/test"
import { firstSuperuserToken } from "../config.ts"

setup("authenticate", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "access_token",
      value: firstSuperuserToken,
      domain: "localhost",
      path: "/",
    },
    {
      name: "access_token_expiry",
      value: `${Math.floor(new Date().getTime() / 1000) + 60 * 60 * 1}`,
      domain: "localhost",
      path: "/",
    },
  ])
  await page.goto("/")
})
