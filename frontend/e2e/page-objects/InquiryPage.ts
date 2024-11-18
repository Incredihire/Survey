import { expect } from "@playwright/test"
import HelperBase from "./helperBase"

export default class InquiryPage extends HelperBase {
  async navigateToInquiriesPage() {
    await this.page.waitForSelector("p.chakra-text.css-0", { timeout: 5000 })
    await expect(this.page.locator("p.chakra-text.css-0")).toHaveText(
      "Welcome back, nice to see you again!",
    )
    await this.page.getByText("Inquiries").click()
  }

  async openInquiryForm() {
    const inquiryTitle = this.page.getByRole("heading", {
      name: "Inquiries Management",
    })
    await expect(inquiryTitle).toHaveText("Inquiries Management")
    await this.page.getByRole("button", { name: "Inquiry" }).click()
    await this.page.waitForSelector(".chakra-modal__footer", {
      state: "visible",
    })
    await expect(
      this.page.getByLabel("Add Inquiry").getByText("Add Inquiry"),
    ).toHaveText("Add Inquiry")
  }

  async submitInquiry() {
    const randomQuestion = this.getRandomQuestion() ?? "Default inquiry text"
    await this.navigateToInquiriesPage()
    await this.openInquiryForm()
    await this.fillTextByTestId("add-inquiry-text", randomQuestion)
    await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
    await this.waitForNumberOfSeconds(3)
    await expect(this.page.locator(`text=${randomQuestion}`)).toBeVisible()
  }

  async submitInquiryWithValidation(inputText: string) {
    await this.navigateToInquiriesPage()
    await this.openInquiryForm()
    await this.fillTextByTestId("add-inquiry-text", inputText)
    if (inputText.length === 0) {
      await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
      await expect(this.page.getByText("Inquiry text is required.")).toHaveText(
        "Inquiry text is required.",
      )
    } else if (inputText.length < 10) {
      await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
      await expect(
        this.page.getByText("Inquiry must be at least 10 characters."),
      ).toHaveText("Inquiry must be at least 10 characters.")
    } else if (inputText.length > 256) {
      await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
      await expect(
        this.page.getByText("Inquiry can not be greater than 256 characters."),
      ).toHaveText("Inquiry can not be greater than 256 characters.")
    } else {
      await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
    }
  }

  async dismissPopupUsingCancel() {
    await this.navigateToInquiriesPage()
    await this.openInquiryForm()
    await this.page.getByRole("button", { name: "Cancel" }).click()
    await expect(this.page.getByRole("button", { name: "Cancel" })).toBeHidden()
  }
  async dismissPopupUsingX() {
    await this.navigateToInquiriesPage()
    await this.openInquiryForm()
    await this.page.locator(".chakra-modal__close-btn").click()
    await expect(this.page.locator(".chakra-modal__close-btn")).toBeHidden()
  }
}
