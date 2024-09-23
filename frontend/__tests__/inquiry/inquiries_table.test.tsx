import { useQuery } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import InquiriesTable from "../../src/components/Inquiries/InquiriesTable"
import "@testing-library/jest-dom"

// import dayjs from "dayjs";
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

// dayjs.extend(utc);
// dayjs.extend(timezone);

const inquiries = [
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

// Mock dependencies
jest.mock("@tanstack/react-query")
jest.mock("dayjs", () => {
  const actualDayjs = jest.requireActual("dayjs")
  return {
    __esModule: true,
    default: actualDayjs,
    tz: {
      ...actualDayjs.tz,
      guess: jest.fn().mockReturnValue("America/Los_Angeles"),
    },
    utc: actualDayjs.utc,
  }
})

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

  // it("should display skeleton text when data is loading.", async () => {
  //   (useQuery as jest.Mock).mockReturnValue({
  //     data: null,
  //     isPending: true,
  //   });
  //   render(<InquiriesTable />);
  //   renderComponent();
  //   screen.debug();
  //   expect(screen.getByTestId("inquiry-placeholder")).toBeInTheDocument();
  // });

  it("should display correct number of inquiries in table.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: inquiries },
      isPending: false,
    })
    renderComponent()
    expect(screen.getAllByRole("row").length).toBe(inquiries.length + 1) // header row + inquiries
  })

  it("should display correct inquiry text.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: [inquiries[0]] },
      isPending: false,
    })
    renderComponent()
    expect(screen.getByTestId("inquiry-text")).toHaveTextContent(
      "How is your work-life balance?",
    )
  })

  // it("should display correct inquiry created date and time, formatted to the user's timzeone.", () => {
  //   (useQuery as jest.Mock).mockReturnValue({
  //     data: { data: [inquiries[0]] },
  //     isPending: false,
  //   });
  //   renderComponent();
  //   expect(screen.getByTestId("inquiry-datetime")).toHaveTextContent(
  //     "Sep 22, 2024 11:20 AM" // America/Los_Angeles Timezone
  //   );
  // });

  it("should display Invalid Date for inquiries with invalid created date and time.", () => {
    const inquiry = {
      id: "92bc71bf-f42c-4b56-b55d-fddaf4633550",
      text: "How is your work-life balance?",
      created_at: "",
    }
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: [inquiry] },
      isPending: false,
    })
    renderComponent()
    expect(screen.getByTestId("inquiry-datetime")).toHaveTextContent(
      "Invalid Date",
    )
  })

  it("should display inquiries from newest to oldest.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: inquiries },
      isPending: false,
    })
    renderComponent()

    const rows = screen.getAllByRole("row")
    expect(rows[1]).toHaveTextContent("How is your work-life balance?")
    expect(rows[2]).toHaveTextContent("Is communication effective?")
    expect(rows[3]).toHaveTextContent(
      "How is feedback typically given and received within the team?",
    )
    expect(rows[4]).toHaveTextContent(
      "How satisfied are you with the work environment?",
    )
    expect(rows[5]).toHaveTextContent(
      "How do you feel about your current role?",
    )
  })

  it("should log the inquiry details on console when clicked.", () => {
    ;(useQuery as jest.Mock).mockReturnValue({
      data: { data: [inquiries[0]] },
      isPending: false,
    })

    renderComponent()
    console.log = jest.fn() // Mock console.log

    const inquiryRow = screen.getByTestId("inquiry-row")
    inquiryRow.click()

    expect(console.log).toHaveBeenCalledWith(
      expect.objectContaining({
        id: inquiries[0].id,
        text: inquiries[0].text,
        created_at: inquiries[0].created_at,
      }),
    )
  })
})
