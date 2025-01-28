import { expect, test } from "@playwright/test"
import PageManager from "../page-objects/pageManager"

test.describe("Categories Management Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.afterEach(async ({ page }) => {
    await page.close()
  })

  test("TC_001 Verify navigating to Categories page", async ({ page }) => {
    const pm = new PageManager(page)
    await pm.getcategoriesPage().navigateToCategoriesPage()

    await expect(
      page.getByRole("heading", { name: "Categories Management" }),
    ).toHaveText("Categories Management")
    await expect(
      page.getByRole("cell", { name: "Text", exact: true }),
    ).toHaveText("Text")
    await expect(
      page.getByRole("cell", { name: "Description", exact: true }),
    ).toHaveText("Description")
  })
})
