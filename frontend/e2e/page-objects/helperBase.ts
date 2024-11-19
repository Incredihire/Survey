import { type Page, expect } from "@playwright/test"

class HelperBase {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async assertButtonTextByTestIdAndClick(testId: string, text: string) {
    await expect(this.page.getByTestId(testId)).toHaveText(text)
    await this.page.getByTestId(testId).click()
  }

  async assertButtonTextByRoleAndNameAndClick(
    role: string,
    name: string,
    expectedText: string,
  ) {
    const button = this.page.locator(`[role="${role}"][name="${name}"]`)
    await expect(button).toHaveText(expectedText)
    await button.click()
  }

  async fillTextByTestId(testId: string, text: string) {
    const textArea = this.page.locator(`[data-testid="${testId}"]`)
    await textArea.waitFor({ state: "visible" })
    await textArea.fill(text)
  }
}

export default HelperBase
