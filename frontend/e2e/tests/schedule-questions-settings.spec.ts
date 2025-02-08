import { expect, test } from "@playwright/test"
import PageManager from "../page-objects/pageManager"

test.describe("Schedule settings Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.afterEach(async ({ page }) => {
    await page.close()
  })

  test("TC_001 Verify the visibility of Schedule Settings button", async ({
    page,
  }) => {
    const pm = new PageManager(page)

    await test.step("Check Presence of Schedule settings button on inquiries page", async () => {
      await pm.getinquiryPage().navigateToInquiriesPage()
      await expect(
        page.getByRole("button", { name: "Schedule Settings" }),
      ).toBeVisible()
    })
  })

  test("TC_002 Verify the schedule creation process", async ({ page }) => {
    const pm = new PageManager(page)
    await test.step("Create Schedule", async () => {
      await pm.getinquiryPage().navigateToInquiriesPage()
      await pm.getschedulesettingsPage().createSchedule()

      const toastLocator = page.locator('[id^="toast-"] .chakra-alert__desc')
      await expect(toastLocator).toBeVisible()
      const toastMessage = await toastLocator.textContent()
      expect(toastMessage).toContain("Schedule created successfully.")
    })
  })

  test("TC_003 Verify the days between inquiries match the input during schedule creation", async ({
    page,
  }) => {
    const pm = new PageManager(page)

    await test.step("Verify frequency between days matches the days set in schedule settings", async () => {
      await pm.getinquiryPage().navigateToInquiriesPage()
      const scheduleDetails = await pm
        .getschedulesettingsPage()
        .createSchedule()

      const inquiryDates = await pm
        .getschedulesettingsPage()
        .getInquiryTableColumnData(4)

      for (let i = 0; i < inquiryDates.length - 1; i++) {
        const currentDate = inquiryDates[i]
        const nextDate = inquiryDates[i + 1]

        // Skip invalid dates
        if (currentDate === "--/--/---- ----" || nextDate === "--/--/---- ----")
          continue

        const daysBetweenScheduledinquiries =
          (new Date(nextDate).getTime() - new Date(currentDate).getTime()) /
          (1000 * 60 * 60 * 24)
        expect(daysBetweenScheduledinquiries).toBe(
          Number.parseInt(scheduleDetails.daysBetween),
        )
      }
    })
  })
})
