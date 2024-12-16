import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Inquiries } from "../../src/routes/_layout/inquiries"
import "@testing-library/jest-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// eslint-disable-next-line
const mockCreateSchedule = jest.fn(() => {})

jest.mock("../../src/hooks/useCreateSchedule.ts", () => () => ({
  createSchedule: mockCreateSchedule,
}))

describe("TimerPanel", () => {
  it("should show a form with fields that can be changed andand submitted", async () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <Inquiries />
      </QueryClientProvider>,
    )
    const startDate = "2024-10-01"
    const endDate = "2024-11-01"
    const daysBetween = 2
    const timeOfDay = "10:00"
    const scheduleSettingsButton = screen.getByText("Schedule Settings")
    fireEvent.click(scheduleSettingsButton)
    const startDateInput = screen.getByLabelText("Date Start")
    const endDateInput = screen.getByLabelText("Date End")
    const daysBetweenInput = screen.getByLabelText("Days Between Inquiries")
    const timeOfDayInput = screen.getByLabelText("Time of Day for Inquiries")
    const skipWeekendsCheckbox = screen.getByLabelText("Skip Weekends")
    const skipHolidaysCheckbox = screen.getByLabelText("Skip Holidays")

    fireEvent.change(startDateInput, { target: { value: startDate } })
    fireEvent.change(endDateInput, { target: { value: endDate } })
    fireEvent.change(daysBetweenInput, { target: { value: daysBetween } })
    fireEvent.change(timeOfDayInput, { target: { value: timeOfDay } })
    fireEvent.click(skipWeekendsCheckbox)
    fireEvent.click(skipHolidaysCheckbox)
    fireEvent.click(skipHolidaysCheckbox)

    expect(startDateInput).toHaveValue(startDate)
    expect(endDateInput).toHaveValue(endDate)
    expect(daysBetweenInput).toHaveValue(daysBetween.toString())
    expect(timeOfDayInput).toHaveValue(timeOfDay)
    expect(skipWeekendsCheckbox).toBeChecked()
    expect(skipHolidaysCheckbox).not.toBeChecked()

    const submitButton = screen.getByText("Create Schedule")
    fireEvent.submit(submitButton)

    // eslint-disable-next-line
    await waitFor(async () => {
      expect(mockCreateSchedule).toHaveBeenCalledTimes(1)
      expect(mockCreateSchedule).toHaveBeenCalledWith({
        schedule: {
          startDate: startDate,
          endDate: endDate,
          daysBetween: daysBetween,
          timesOfDay: [timeOfDay],
          skipHolidays: false,
          skipWeekends: true,
        },
      })
    })
  })

  it("updates end date when start date is changed to a later date", () => {
    const queryClient = new QueryClient()
    render(
      <QueryClientProvider client={queryClient}>
        <Inquiries />
      </QueryClientProvider>,
    )
    const scheduleSettingsButton = screen.getByText("Schedule Settings")
    fireEvent.click(scheduleSettingsButton)
    const startDateInput = screen.getByLabelText("Date Start")
    const endDateInput = screen.getByLabelText("Date End")

    fireEvent.change(startDateInput, { target: { value: "2024-10-01" } })
    fireEvent.change(endDateInput, { target: { value: "2024-11-01" } })
    fireEvent.change(startDateInput, { target: { value: "2024-12-01" } })

    expect(endDateInput).toHaveValue("2025-01-01")
  })
})
