import type { Page } from "@playwright/test"

import InquiryPage from "../page-objects/InquiryPage"

class PageManager {
  private readonly page: Page
  private readonly inquiryPage: InquiryPage

  constructor(page: Page) {
    this.page = page
    this.inquiryPage = new InquiryPage(this.page)
  }

  oninquiryPage() {
    return this.inquiryPage
  }
}

export default PageManager
