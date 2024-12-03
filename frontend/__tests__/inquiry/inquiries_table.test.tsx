import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen /*, within*/ } from "@testing-library/react"
import InquiriesTable from "../../src/components/Inquiries/InquiriesTable"
import "@testing-library/jest-dom"
import { useInquiries } from "../../src/hooks/useInquiries"
//import dayjs from "dayjs"
import { useSchedule } from "../../src/hooks/useSchedule"

jest.mock("../../src/hooks/useSchedule")
jest.mock("../../src/hooks/useInquiries")

describe("Inquiries Table", () => {
  const mockUseSchedule = useSchedule as jest.Mock
  const singleSchedule = {
    schedule: {
      startDate: "2024-12-03",
      endDate: "2025-01-02",
      daysBetween: 1,
      skipWeekends: false,
      skipHolidays: false,
      timesOfDay: ["08:00"],
    },
    id: 1,
    scheduled_inquiries: [1, 2, 3, 4, 5, 6],
  }

  const mockUseInquiries = useInquiries as jest.Mock

  const multipleInquiries = [
    {
      id: 1,
      text: "How is your work-life balance?",
      created_at: "2024-09-22T18:20:53.734830",
      first_scheduled: "2024-09-22T18:20:53.734830",
    },
    {
      id: 2,
      text: "Is communication effective?",
      created_at: "2024-09-22T12:30:53.734830",
      first_scheduled: "2024-09-22T12:30:53.734830",
    },
    {
      id: 3,
      text: "How satisfied are you with the work environment?",
      created_at: "2024-09-21T09:20:53.734830",
      first_scheduled: "2024-09-21T09:20:53.734830",
    },
    {
      id: 4,
      text: "How do you feel about your current role?",
      created_at: "2024-09-19T09:20:53.734830",
      first_scheduled: "2024-09-19T09:20:53.734830",
    },
    {
      id: 5,
      text: "How is feedback typically given and received within the team?",
      created_at: "2024-09-22T09:20:53.734830",
      first_scheduled: "2024-09-22T09:20:53.734830",
    },
  ]

  const singleInquiry = [
    {
      id: 6,
      text: "How is your work-life balance?",
      created_at: "2024-09-22T18:20:53.734830",
      first_scheduled: "2024-09-22T18:20:53.734830",
    },
  ]

  // TODO: implement valid Scheduled column test(s)
  // const inquiryWithoutCreationDate = [
  //   {
  //     id: "92bc71bf-f42c-4b56-b55d-fddaf4633550",
  //     text: "How is your work-life balance?",
  //     created_at: "",
  //   },
  // ]

  const queryClient = new QueryClient()
  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <InquiriesTable />
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

  it("should display correct number of inquiries in table.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: multipleInquiries },
      isLoading: false,
    })
    renderComponent()
    const rows = screen.getAllByRole("row")
    expect(rows.length).toBe(multipleInquiries.length + 1) // +1 for header
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

  /* TODO: implement valid Scheduled column test(s)
  it("should display correct inquiry created date and time, formatted to the user's timezone.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
    })
    // Mock the user's timezone
    jest.spyOn(dayjs.tz, "guess").mockReturnValue("America/Los_Angeles")
    renderComponent()
    expect(screen.getByText("Sep 22, 2024 11:20 AM")).toBeInTheDocument()
  })


  it("should throw an error for inquiry with invalid created date and time.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: inquiryWithoutCreationDate },
      isLoading: false,
    })
    jest.spyOn(console, "error").mockImplementation(jest.fn())
    expect(() => renderComponent()).toThrow()
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
      throw new Error(
        `Invalid index for "Scheduled" column: ${scheduledIndex}`,
      )
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

      // eslint-disable-next-line security/detect-object-injection
      const dateCell = cells[scheduledIndex]
      const dateText = dateCell.textContent?.trim() ?? ""
      return new Date(dateText)
    })

    // Validate that each date is less than the previous date (newest to oldest)
    for (let i = 1; i < inquiryDates.length; i++) {
      expect(inquiryDates[i].getTime()).toBeLessThan(
        inquiryDates[i - 1].getTime(),
      )
    }
  })*/

  it("should log the inquiry details on console when clicked.", () => {
    mockUseInquiries.mockReturnValue({
      data: { data: singleInquiry },
      isLoading: false,
    })
    renderComponent()

    console.log = jest.fn()

    const rows = screen.getAllByRole("row")
    const dataRow = rows[1] // First data row

    fireEvent.click(dataRow)

    expect(console.log).toHaveBeenCalledWith(
      "Row clicked:",
      expect.objectContaining({
        id: singleInquiry[0].id,
        text: singleInquiry[0].text,
        created_at: singleInquiry[0].created_at,
      }),
    )
  })
})
