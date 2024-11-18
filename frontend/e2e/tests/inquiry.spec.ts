import { test } from "@playwright/test"
import PageManager from "../page-objects/pageManager"

test.describe("Inquiry Management Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.afterEach(async ({ page }) => {
    await page.close()
  })

  test("TC_001 Verify the presence of AddInquiry button on Inquiry Management page", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().submitInquiry()
  })
  test("TC_002 Verify error messages appear for empty input fields ", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().submitInquiryWithValidation("")
  })

  test("TC_003 Verify error message appears for input field with less than 10 characters.", async ({
    page,
  }) => {
    const inputPhrase =
      "In a world where technology is advancing at an exponential rate, it's important to remember the value of human connection, empathy, and kindness. As we move forward, let's not forget the importance of collaboration creativity and the pursuit of happiness in world."
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().submitInquiryWithValidation(inputPhrase)
  })

  test("TC_004 Verify the behavior of Cancel button", async ({ page }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().dismissPopupUsingCancel()
  })

  test("TC_005 Verify the behavior of X button to cole popup", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().dismissPopupUsingX()
  })
})
