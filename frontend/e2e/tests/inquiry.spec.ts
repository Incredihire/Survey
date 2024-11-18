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
    await pm
      .oninquiryPage()
      .addInquiry_whenValidInquiryIsAdded_shouldShowInquiryInInquiriesList(
        "How would you rate the work environment in your team?",
      )
  })
  test("TC_002 Verify error messages appear for empty input fields ", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError("")
  })

  test("TC_003 Verify error message appears for input field with greater than 256 characters.", async ({
    page,
  }) => {
    const inputPhrase =
      "In a world where technology is advancing at an exponential rate, it's important to remember the value of human connection, empathy, and kindness. As we move forward, let's not forget the importance of collaboration creativity and the pursuit of happiness in world."
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError(inputPhrase)
  })

  test("TC_004 Verify error message appears for input field with greater than 256 characters.", async ({
    page,
  }) => {
    const inputPhrase = "whats up?"
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError(inputPhrase)
  })

  test("TC_005 Verify the behavior of Cancel button", async ({ page }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().dismissPopupUsingCancel()
  })

  test("TC_005 Verify the behavior of X button to cancel popup", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().dismissPopupUsingX()
  })

  test("TC_006 Verify the presence of AddInquiry button on Inquiry Management page", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm
      .oninquiryPage()
      .addInquiry_whenValidInquiryIsAdded_shouldShowInquiryInInquiriesList(
        "How was your week",
      )
  })
})
