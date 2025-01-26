import type { Locator } from "@playwright/test"
import { scheduleSettingsData } from "../test-data/constants"
import HelperBase from "./helperBase"

export default class ScheduleSettingsPage extends HelperBase {
  private readonly scheduleSettingsButton = this.page.getByTestId(
    "schedule-settings-button",
  )
  private readonly dateStartInput = this.page.locator('input[name="startDate"]')
  private readonly dateEndInput = this.page.locator('input[name="endDate"]')
  private readonly daysBetweenInput = this.page.locator(
    'input[name="daysBetween"]',
  )
  private readonly timeOfDayInput = this.page.locator('input[name="timeOfDay"]')
  private readonly skipWeekendsCheckbox = this.page
    .getByLabel("Schedule Settings")
    .locator("span")
    .first()
  private readonly skipHolidaysCheckbox = this.page
    .getByLabel("Schedule Settings")
    .locator("span")
    .nth(2)

  private readonly createScheduleButton = this.page.getByRole("button", {
    name: "Create Schedule",
  })

  private readonly inquiriesTableRows = this.page.locator("tbody > tr:visible")

  async selectDateFromToday(
    numberOfDaysFromToday: number,
    dateType: "start" | "end",
  ) {
    if (numberOfDaysFromToday < 0) {
      throw new Error(
        `Invalid input: numberOfDaysFromToday (${numberOfDaysFromToday}) cannot be negative.`,
      )
    }

    if (!this.page.isClosed()) {
      const date = new Date()
      date.setDate(date.getDate() + numberOfDaysFromToday)

      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")

      const formattedDate = `${year}-${month}-${day}`

      const dateInput =
        dateType === "start" ? this.dateStartInput : this.dateEndInput

      await dateInput.fill(formattedDate)
    } else {
      throw new Error("Page has been closed")
    }
  }

  async setDaysBetween(days: string) {
    await this.daysBetweenInput.fill(days)
  }

  async setTimeOfDay(time: string) {
    await this.timeOfDayInput.fill(time)
  }

  async toggleCheckbox(checkbox: Locator, shouldCheck: boolean) {
    if (shouldCheck) {
      await checkbox.check()
    } else {
      await checkbox.uncheck()
    }
  }

  async getScheduleDetails(): Promise<{
    dateStart: number
    dateEnd: number
    daysBetween: string
    timeOfDay: string
    shouldSkipWeekends: boolean
    shouldSkipHolidays: boolean
  }> {
    return {
      dateStart: scheduleSettingsData.selectStartDateFromToday,
      dateEnd: scheduleSettingsData.selectEndDateFromToday,
      daysBetween: scheduleSettingsData.daysBetween.toString(),
      timeOfDay: scheduleSettingsData.timeOfDay,
      shouldSkipWeekends: scheduleSettingsData.shouldSkipWeekends,
      shouldSkipHolidays: scheduleSettingsData.shouldSkipHolidays,
    }
  }

  async createSchedule() {
    await this.scheduleSettingsButton.click()
    const scheduleDetails = await this.getScheduleDetails()
    await this.selectDateFromToday(scheduleDetails.dateStart, "start")
    await this.selectDateFromToday(scheduleDetails.dateEnd, "end")
    await this.setDaysBetween(scheduleDetails.daysBetween)
    await this.setTimeOfDay(scheduleDetails.timeOfDay)
    await this.toggleCheckbox(
      this.skipWeekendsCheckbox,
      scheduleDetails.shouldSkipWeekends,
    )
    await this.toggleCheckbox(
      this.skipHolidaysCheckbox,
      scheduleDetails.shouldSkipHolidays,
    )
    await this.createScheduleButton.click()

    return scheduleDetails
  }

  async getInquiryTableColumnData(columnIndex: number): Promise<string[]> {
    const numberOfRows = await this.inquiriesTableRows.all()
    const columnValues: string[] = []

    for (const row of numberOfRows) {
      const cell = row.locator(`td:nth-of-type(${columnIndex})`)
      const cellText = await cell.textContent()

      if (cellText) {
        columnValues.push(cellText.trim())
      }
    }
    return columnValues
  }
}
