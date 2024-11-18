import { expect, test } from "@playwright/test"
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
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    const inputText = "How would you rate the work environment in your team?"
    await pm
      .oninquiryPage()
      .addInquiry_whenValidInquiryIsAdded_shouldShowInquiryInInquiriesList(
        inputText,
      )

    await expect(page.locator(`text=${inputText}`)).toBeVisible()
  })

  test("TC_002 Verify error messages appear for empty input fields", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    const inputText = ""
    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError(inputText)

    await expect(page.getByText("Inquiry text is required.")).toHaveText(
      "Inquiry text is required.",
    )
  })

  test("TC_003 Verify error message appears for input field with greater than 256 characters", async ({
    page,
  }) => {
    const inputText =
      "In a world where technology is advancing at an exponential rate, it's important to remember the value of human connection, empathy, and kindness. As we move forward, let's not forget the importance of collaboration creativity and the pursuit of happiness in world."
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError(inputText)

    await expect(
      page.getByText("Inquiry can not be greater than 256 characters."),
    ).toHaveText("Inquiry can not be greater than 256 characters.")
  })

  test("TC_004 Verify error message appears for input field with less than 10 characters", async ({
    page,
  }) => {
    const inputText = "whats up?"
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    await pm
      .oninquiryPage()
      .inquiry_whenInvalidInquiryText_shouldShowValidationError(inputText)

    await expect(
      page.getByText("Inquiry must be at least 10 characters."),
    ).toHaveText("Inquiry must be at least 10 characters.")
  })

  test("TC_005 Verify the behavior of Cancel button", async ({ page }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    await pm.oninquiryPage().dismissPopupUsingCancel()

    await expect(page.getByRole("button", { name: "Cancel" })).toBeHidden()
  })

  test("TC_006 Verify the behavior of X button to cancel popup", async ({
    page,
  }) => {
    const pm = new PageManager(page)
    await pm.oninquiryPage()
    await pm.oninquiryPage().navigateToInquiriesPage()
    await pm.oninquiryPage().openInquiryForm()

    await pm.oninquiryPage().dismissPopupUsingX()

    await expect(page.locator(".chakra-modal__close-btn")).toBeHidden()
  })
})
