import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react"
import { Inquiries } from "../../src/routes/_layout/inquiries"
import "@testing-library/jest-dom"
import type { InquiryPublic } from "../../src/client"
import {
  InquiriesService,
  ScheduleService,
  ThemesService,
} from "../../src/client/services"
import { useInquiries } from "../../src/hooks/useInquiries"
import { useSchedule } from "../../src/hooks/useSchedule"

jest.mock("../../src/hooks/useSchedule")
jest.mock("../../src/hooks/useInquiries")
jest.mock("../../src/client/services")

describe("Inquiries Table", () => {
  const mockUseSchedule = useSchedule as jest.Mock
  const singleSchedule = {
    schedule: {
      startDate: "2024-12-09",
      endDate: null,
      daysBetween: 1,
      skipWeekends: false,
      skipHolidays: false,
      timesOfDay: ["08:00"],
    },
    id: 1,
    scheduled_inquiries: [1, 2, 3, 4, 5, 6],
    scheduled_inquiries_and_dates: {
      inquiries: [1, 2, 3, 4, 5, 6],
      dates: [
        "12/09/2024 08:00 AM",
        "12/10/2024 08:00 AM",
        "12/11/2024 08:00 AM",
        "12/12/2024 08:00 AM",
        "12/13/2024 08:00 AM",
        "12/14/2024 08:00 AM",
        "12/15/2024 08:00 AM",
      ],
    },
  }

  const mockUseInquiries = useInquiries as jest.Mock

  const multipleInquiries: InquiryPublic[] = [
    {
      id: 1,
      text: "How is your work-life balance?",
      created_at: "2024-09-22T18:20:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-22T18:20:53.734830",
    },
    {
      id: 2,
      text: "Is communication effective?",
      created_at: "2024-09-22T12:30:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-22T12:30:53.734830",
    },
    {
      id: 3,
      text: "How satisfied are you with the work environment?",
      created_at: "2024-09-21T09:20:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-21T09:20:53.734830",
    },
    {
      id: 4,
      text: "How do you feel about your current role?",
      created_at: "2024-09-19T09:20:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-19T09:20:53.734830",
    },
    {
      id: 5,
      text: "How is feedback typically given and received within the team?",
      created_at: "2024-09-22T09:20:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-22T09:20:53.734830",
    },
    {
      id: 6,
      text: "How is your work-life balance?",
      created_at: "2024-09-22T18:20:53.734830",
      theme_id: null,
      first_scheduled: "2024-09-22T18:20:53.734830",
    },
  ]

  const singleInquiry = [multipleInquiries[0]]

  const inquiryUnscheduled: InquiryPublic[] = [
    {
      id: 7,
      text: "How is your work-life balance?",
      created_at: "2024-09-23T18:20:53.734830",
      theme_id: null,
      first_scheduled: null,
    },
  ]

  const inquiriesService = InquiriesService as jest.Mocked<
    typeof InquiriesService
  >

  const themesService = ThemesService as jest.Mocked<typeof ThemesService>
  themesService.getThemes.mockResolvedValue({ data: [], count: 0 })

  const scheduleService = ScheduleService as jest.Mocked<typeof ScheduleService>

  const queryClient = new QueryClient()
  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <Inquiries />
      </QueryClientProvider>,
    )

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSchedule.mockReturnValue({ data: singleSchedule, isLoading: false })
  })

  it("should display empty table when there's no inquiries.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    })

    renderComponent()
    expect(screen.getAllByRole("row").length).toBe(1) // only header row
  })

  it("should display correct number of inquiries in table.", async () => {
    mockUseInquiries.mockReturnValue({
      data: { data: multipleInquiries },
      isLoading: false,
    })
    renderComponent()
    const removeFromScheduleButtons = await screen.findAllByRole("button", {
      name: "Remove from Schedule",
    })
    expect(removeFromScheduleButtons.length).toBe(multipleInquiries.length)
  })

  it("should display correct inquiry text.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
    })
    renderComponent()

    expect(
      screen.getByText("How is your work-life balance?"),
    ).toBeInTheDocument()
  })

  it("should display correct inquiry scheduled date and time, formatted to the user's timezone.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
    })
    renderComponent()
    expect(screen.getByText("12/09/2024 08:00 AM")).toBeInTheDocument()
  })
  it("should render placeholder scheduled text for inquiry with not in scheduled_inquiries list", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryUnscheduled },
      isLoading: false,
    })
    renderComponent()
    expect(screen.getByTestId("unscheduled-date-pattern")).toBeInTheDocument()
  })

  it("should display inquiries from newest to oldest.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: multipleInquiries },
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
      refetch: jest.fn(),
    })

    renderComponent()

    // Find the index of the "Created At" column
    const headerCells = screen.getAllByRole("columnheader")
    const scheduledHeader = headerCells.find(
      (header) => header.textContent === "Scheduled",
    )
    // Ensure the "Created At" header exists
    expect(scheduledHeader).toBeInTheDocument()

    if (!scheduledHeader) {
      throw new Error('"Created At" header not found in the table.')
    }

    const scheduledIndex = headerCells.indexOf(scheduledHeader)

    // Validate createdAtIndex
    const totalColumns = headerCells.length
    if (
      typeof scheduledIndex !== "number" ||
      !Number.isInteger(scheduledIndex) ||
      scheduledIndex < 0 ||
      scheduledIndex >= totalColumns
    ) {
      throw new Error(`Invalid index for "Scheduled" column: ${scheduledIndex}`)
    }

    // Get all data rows excluding the header
    const allRows = screen.getAllByRole("row")
    const dataRows = allRows.slice(1) // Exclude header row

    // Extract and parse dates from the "Created At" column
    const inquiryDates = dataRows.map((row) => {
      const cells = within(row).getAllByRole("cell")
      const totalCells = cells.length

      // Validate cells array and createdAtIndex
      if (scheduledIndex >= totalCells) {
        throw new Error(
          `Row has fewer cells (${totalCells}) than expected index (${scheduledIndex})`,
        )
      }

      const dateCell = cells[scheduledIndex]
      const dateText = dateCell.textContent?.trim() ?? ""
      return new Date(dateText)
    })

    // Validate that each date is greater than the previous date (oldest to newest)
    expect(
      inquiryDates.every(
        (value, index) =>
          index === 0 || value.getTime() > inquiryDates[index - 1].getTime(),
      ),
    ).toEqual(true)
  })

  it("should log the inquiry details on console when clicked.", async () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
    })
    renderComponent()

    console.log = jest.fn()

    const removeFromScheduleButton = await screen.findByRole("button", {
      name: "Remove from Schedule",
    })
    const dataRow = removeFromScheduleButton.closest("tr")
    if (dataRow) fireEvent.click(dataRow)

    expect(console.log).toHaveBeenCalledWith(
      "Row clicked:",
      expect.objectContaining({
        id: singleInquiry[0].id,
        text: singleInquiry[0].text,
        created_at: singleInquiry[0].created_at,
      }),
    )
  })

  it("should display update modal when user presses edit inquiry button", async () => {
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryUnscheduled },
      isLoading: false,
    })
    renderComponent()

    const unscheduledTab = screen.getByText("Unscheduled")
    fireEvent.click(unscheduledTab)

    fireEvent.click(screen.getByTestId("edit-inquiry-button"))
    const textArea = screen.getByTestId("update-inquiry-text")
    fireEvent.change(textArea, {
      target: {
        value: "Why do birds suddenly appear every time you are near?",
      },
    })
    const updateInquiry = inquiriesService.updateInquiry.mockResolvedValue({
      ...inquiryUnscheduled[0],
      text: "Why do birds suddenly appear every time you are near?",
    })
    fireEvent.click(screen.getByTestId("submit-update-inquiry"))
    await waitFor(() => {
      expect(updateInquiry).toHaveBeenCalled()
    })
  })

  it("should show modal when add to schedule clicked and update scheduled inquiries when continue button clicked", async () => {
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryUnscheduled },
      isLoading: false,
    })
    renderComponent()

    const unscheduledTab = screen.getByText("Unscheduled")
    fireEvent.click(unscheduledTab)

    const addToScheduleButton = screen.getByText("Add to Schedule")
    fireEvent.click(addToScheduleButton)

    expect(
      screen.getByText(
        "You're about to add this inquiry to the schedule. Are you sure?",
      ),
    ).toBeVisible()

    const updateScheduledInquiries =
      scheduleService.updateScheduledInquiries.mockResolvedValueOnce({
        ...singleSchedule,
        scheduled_inquiries: [inquiryUnscheduled[0].id],
        scheduled_inquiries_and_dates: {
          inquiries: [inquiryUnscheduled[0].id],
          dates: [
            `${singleSchedule.schedule.startDate} ${singleSchedule.schedule.timesOfDay[0]} AM`,
          ],
        },
      })
    const continueButton = screen.getByText("Continue")
    fireEvent.click(continueButton)
    await waitFor(() => {
      expect(updateScheduledInquiries).toHaveBeenCalled()
    })
  })

  it("should update scheduled inquiries when drags and drops a row", async () => {
    const updateScheduledInquiries =
      scheduleService.updateScheduledInquiries.mockResolvedValueOnce(
        singleSchedule,
      )
    mockUseInquiries.mockReturnValue({
      data: { data: multipleInquiries },
      isLoading: false,
    })
    renderComponent()
    const removeFromScheduleButtons = await screen.findAllByRole("button", {
      name: "Remove from Schedule",
    })
    expect(removeFromScheduleButtons.length).toBe(multipleInquiries.length)
    const dataRow = removeFromScheduleButtons[0].closest("tr")
    if (dataRow) {
      const SPACE = { keyCode: 32 }
      const ARROW_DOWN = { keyCode: 40 }
      fireEvent.keyDown(dataRow, SPACE) // Begins the dnd
      fireEvent.keyDown(dataRow, ARROW_DOWN) // Moves the element
      fireEvent.keyDown(dataRow, SPACE) // Ends the dnd
    }
    await waitFor(() => {
      expect(updateScheduledInquiries).toHaveBeenCalled()
    })
  })

  it("should update scheduled inquiries when remove from schedule clicked", async () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
    })
    renderComponent()

    const updateScheduledInquiries =
      scheduleService.updateScheduledInquiries.mockResolvedValueOnce({
        ...singleSchedule,
        scheduled_inquiries: [],
        scheduled_inquiries_and_dates: { inquiries: [], dates: [] },
      })
    const removeFromScheduleButton = screen.getByText("Remove from Schedule")
    fireEvent.click(removeFromScheduleButton)
    await waitFor(() => {
      expect(updateScheduledInquiries).toHaveBeenCalled()
    })
  })

  it("should remove inquiry when delete button clicked", async () => {
    const deleteInquiry = inquiriesService.deleteInquiry.mockResolvedValueOnce({
      message: "Inquiry deleted",
    })
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryUnscheduled },
      isLoading: false,
    })
    renderComponent()

    const unscheduledTab = screen.getByText("Unscheduled")
    fireEvent.click(unscheduledTab)

    const deleteInquiryButton = screen.getByTestId("delete-inquiry-button")
    expect(deleteInquiryButton).toBeVisible()
    fireEvent.click(deleteInquiryButton)

    await waitFor(() => {
      expect(deleteInquiry).toHaveBeenCalled()
    })
  })

  it("should fail inquiry when delete button clicked", async () => {
    const deleteInquiryRejected =
      inquiriesService.deleteInquiry.mockRejectedValueOnce({
        detail: "Invalid inquiry id for delete",
      })
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryUnscheduled },
      isLoading: false,
    })
    renderComponent()

    const unscheduledTab = screen.getByText("Unscheduled")
    fireEvent.click(unscheduledTab)

    const deleteInquiryButton = screen.getByTestId("delete-inquiry-button")
    expect(deleteInquiryButton).toBeVisible()
    fireEvent.click(deleteInquiryButton)

    await waitFor(() => {
      expect(deleteInquiryRejected).toHaveBeenCalled()
    })
  })
})
