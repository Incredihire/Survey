import type { Page } from "@playwright/test"

import CategoriesPage from "./CategoriesPage"
import InquiryPage from "./InquiryPage"
import ScheduleSettingsPage from "./ScheduleSettingsPage"

class PageManager {
  private readonly page: Page
  private readonly inquiryPage: InquiryPage
  private readonly categoriesPage: CategoriesPage
  private readonly scheduleSettingsPage: ScheduleSettingsPage

  constructor(page: Page) {
    this.page = page
    this.inquiryPage = new InquiryPage(this.page)
    this.categoriesPage = new CategoriesPage(this.page)
    this.scheduleSettingsPage = new ScheduleSettingsPage(this.page)
  }

  getinquiryPage() {
    return this.inquiryPage
  }

  getcategoriesPage() {
    return this.categoriesPage
  }

  getschedulesettingsPage() {
    return this.scheduleSettingsPage
  }
}

export default PageManager
