import HelperBase from "./helperBase"

export default class InquiryPage extends HelperBase {
  async navigateToInquiriesPage() {
    await this.page.waitForSelector("p.chakra-text.css-0", { timeout: 5000 })
    await this.page.getByRole("link", { name: "Inquiries" }).click()
  }

  async openInquiryForm() {
    await this.page.getByRole("button", { name: "Add Scheduled" }).click()
    await this.page.waitForSelector(".chakra-modal__footer", {
      state: "visible",
    })
  }

  async addInquiry(inputText: string) {
    await this.fillTextByTestId("add-inquiry-text", inputText)
    await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
  }

  async dismissPopupUsingCancel() {
    await this.page.getByRole("button", { name: "Cancel" }).click()
  }

  async dismissPopupUsingX() {
    await this.page.locator(".chakra-modal__close-btn").click()
  }
}
