import { expect, test } from "@playwright/test"
import PageManager from "../page-objects/pageManager"

test.describe("Inquiry Edit Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.afterEach(async ({ page }) => {
    await page.close()
  })

  test("TC_001 Verify Admin should be able to click on the pencil icon to trigger a pop-up window", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await test.step("Click on edit button", async () => {
      await pm.getinquiryPage().navigateToInquiriesPage()
      await pm.getinquiryPage().editUnscheduledInquiry()
      await expect(page.getByText("Update Inquiry")).toBeVisible()
    })
  })
})
