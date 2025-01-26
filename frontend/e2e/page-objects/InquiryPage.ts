import HelperBase from "./helperBase"

export default class InquiryPage extends HelperBase {
  private readonly inquiryLink = this.page.getByRole("link", {
    name: "Inquiries",
  })
  private readonly addInquiryButton =
    this.page.getByTestId("add-inquiry-button")
  private readonly popupFooter = this.page.locator(".chakra-modal__footer")
  private readonly cancelButton = this.page.getByRole("button", {
    name: "Cancel",
  })
  private readonly closeButton = this.page.locator(".chakra-modal__close-btn")
  private readonly unscheduledTab = this.page.getByRole("tab", {
    name: "Unscheduled",
  })
  private readonly editIcon = this.page
    .locator(
      'tbody > tr:visible td:nth-of-type(1) button[data-testid="edit-inquiry-button"]',
    )
    .first()

  async navigateToInquiriesPage() {
    await this.page.waitForSelector("p.chakra-text.css-0", { timeout: 5000 })
    await this.inquiryLink.click()
  }

  async openInquiryForm() {
    await this.addInquiryButton.click()
    await this.popupFooter.waitFor({ state: "visible" })
  }

  async addInquiry(inputText: string) {
    await this.fillTextByTestId("add-inquiry-text", inputText)
    await this.assertButtonTextByTestIdAndClick("submit-add-inquiry", "Save")
  }

  async dismissPopupUsingCancel() {
    await this.cancelButton.click()
  }

  async dismissPopupUsingX() {
    await this.closeButton.click()
  }

  async editUnscheduledInquiry() {
    await this.unscheduledTab.click()
    await this.editIcon.waitFor({ state: "visible" })
    await this.editIcon.click()
  }
}
