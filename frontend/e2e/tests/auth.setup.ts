import { test as setup } from "@playwright/test"
import { testSuperuserToken } from "../config.ts"
setup("authenticate", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "access_token_cookie",
      value: testSuperuserToken,
      domain: "localhost",
      path: "/",
    },
  ])
  await page.context().storageState({ path: "playwright/.auth/user.json" })
})
