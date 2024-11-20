import { test as setup } from "@playwright/test"
import { firstSuperuserToken } from "../config.ts"
setup("authenticate", async ({ page, context }) => {
  const expiry = Math.floor(new Date().getTime() / 1000) + 60 * 60
  await context.addCookies([
    {
      name: "access_token",
      value: firstSuperuserToken,
      domain: "localhost",
      path: "/",
    },
    {
      name: "access_token_expiry",
      value: `${expiry}`,
      domain: "localhost",
      path: "/",
    },
  ])
  await page.context().storageState({ path: "playwright/.auth/user.json" })
})
