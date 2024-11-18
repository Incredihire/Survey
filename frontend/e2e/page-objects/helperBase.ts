import { type Page, expect } from "@playwright/test"
import questionsData from "../test-data/questions.json" assert { type: "json" }

class HelperBase {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async waitForNumberOfSeconds(timeinSeconds: number) {
    await this.page.waitForTimeout(timeinSeconds * 1000)
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

  async getRandomQuestion() {
    //const questions = this.loadQuestions().questions;
    const randomIndex = Math.floor(
      Math.random() * questionsData.questions.length,
    )
    return questionsData.questions[randomIndex].questionText
  }
}

export default HelperBase
