// Disabling these ESLint rules for mocking the "dayjs" module
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Disabling to mock return value of "dayjs.tz.guess" function
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { useQuery } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import InquiriesTable from "../../src/components/Inquiries/InquiriesTable"
import "@testing-library/jest-dom"
import dayjs from "dayjs"

const multipleInquiries = [
  {
    id: "92bc71bf-f42c-4b56-b55d-fddaf4633550",
    text: "How is your work-life balance?",
    created_at: "2024-09-22T18:20:53.734830",
  },
  {
    id: "736381f5-becf-4783-8f04-98250e69c0b3",
    text: "Is communication effective?",
    created_at: "2024-09-22T12:30:53.734830",
  },
  {
    id: "df1e0d27-4f77-4d6b-b997-2b07d892db17",
    text: "How satisfied are you with the work environment?",
    created_at: "2024-09-21T09:20:53.734830",
  },
  {
    id: "13f29f63-2793-49b5-a6a9-c26acda6651f",
    text: "How do you feel about your current role?",
    created_at: "2024-09-19T09:20:53.734830",
  },
  {
    id: "f919b688-f9c6-49cb-87c0-4dab68a4a04c",
    text: "How is feedback typically given and received within the team?",
    created_at: "2024-09-22T09:20:53.734830",
  },
]

const singleInquiry = [
  {
    id: "92bc71bf-f42c-4b56-b55d-fddaf4633550",
    text: "How is your work-life balance?",
    created_at: "2024-09-22T18:20:53.734830",
  },
]

const inquiryWithoutCreationDate = [
  {
    id: "92bc71bf-f42c-4b56-b55d-fddaf4633550",
    text: "How is your work-life balance?",
    created_at: "",
  },
]

jest.mock("@tanstack/react-query")

describe("Inquiries Table", () => {
  const renderComponent = () => render(<InquiriesTable />)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should display empty table when there's no inquiries.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: [] },
      isPending: false,
    })

    renderComponent()
    expect(screen.getAllByRole("row").length).toBe(1) // just the header row
  })

  it("should display correct number of inquiries in table.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: multipleInquiries },
      isPending: false,
    })
    renderComponent()
    expect(screen.getAllByTestId("inquiry-row").length).toBe(
      multipleInquiries.length,
    )
  })

  it("should display correct inquiry text.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: singleInquiry },
      isPending: false,
    })
    renderComponent()
    expect(screen.getByTestId("inquiry-text")).toHaveTextContent(
      "How is your work-life balance?",
    )
  })

  it("should display correct inquiry created date and time, formatted to the user's timzeone.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: singleInquiry },
      isPending: false,
    })
    // Pretend user's in America/Los_Angeles Timezone
    jest.spyOn(dayjs.tz, "guess").mockReturnValue("America/Los_Angeles")
    renderComponent()
    expect(screen.getByTestId("inquiry-datetime")).toHaveTextContent(
      "Sep 22, 2024 11:20 AM",
    )
  })

  it("should throw an error for inquiry with invalid created date and time.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: inquiryWithoutCreationDate },
      isPending: false,
    })
    jest.spyOn(console, "error").mockImplementation(jest.fn())
    expect(() => renderComponent()).toThrow()
  })

  it("should display inquiries from newest to oldest.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: multipleInquiries },
      isPending: false,
    })
    renderComponent()

    const dateColumns = screen.getAllByTestId("inquiry-datetime")
    const inquiryDates = dateColumns.map(
      (col) => new Date(col.textContent?.trim() ?? ""),
    )
    for (let i = 1; i < inquiryDates.length; i++) {
      // The inquiries used for this test always have valid created_at datetime value
      /* eslint-disable-next-line */
      expect(inquiryDates[i].getTime()).toBeLessThan(
        inquiryDates[i - 1].getTime(),
      )
    }
  })

  it("should log the inquiry details on console when clicked.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: singleInquiry },
      isPending: false,
    })
    renderComponent()

    console.log = jest.fn()

    const inquiryRow = screen.getByTestId("inquiry-row")
    inquiryRow.click()

    expect(console.log).toHaveBeenCalledWith(
      expect.objectContaining({
        id: singleInquiry[0].id,
        text: singleInquiry[0].text,
        created_at: singleInquiry[0].created_at,
      }),
    )
  })
})
