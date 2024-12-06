/* Codacy is unhappy with await */
/* eslint-disable @typescript-eslint/await-thenable */
/* Codacy is unhappy with click events */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* Codacy is unhappy with mocking */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Inquiries } from "../../src/routes/_layout/inquiries"
import "@testing-library/jest-dom"
import { InquiriesService } from "../../src/client/services"
import {
  MAX_INQUIRY_LENGTH,
  MIN_INQUIRY_LENGTH,
} from "../../src/components/Inquiries/AddInquiry"
import { useInquiries } from "../../src/hooks/useInquiries.ts"
import { useSchedule } from "../../src/hooks/useSchedule.ts"
import { useThemes } from "../../src/hooks/useThemes.ts"

jest.mock("../../src/hooks/useThemes")
jest.mock("../../src/hooks/useSchedule")
jest.mock("../../src/hooks/useInquiries")
jest.mock("../../src/client/services")

const mockUseThemes = useThemes as jest.Mock
const mockUseSchedule = useSchedule as jest.Mock
const mockUseInquiries = useInquiries as jest.Mock
const inquiriesService = InquiriesService as jest.Mocked<
  typeof InquiriesService
>

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
  scheduled_inquiries: [],
}

const emptyDataList = { data: [], count: 0 }

const unicodeText =
  "Тенденция к взаимопомощи у человека имеет столь отдаленное происхождение и так глубоко переплетена со всей прошлой эволюцией человеческого рода, что она сохранилась у человечества вплоть до настоящего времени, несмотря на все превратности истории."
const nonUnicodeText =
  "\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF"

const queryClient = new QueryClient()
describe("Add Inquiry", () => {
  beforeEach(async () => {
    mockUseThemes.mockReturnValue({ data: emptyDataList, isLoading: false })
    mockUseSchedule.mockReturnValue({ data: singleSchedule, isLoading: false })
    mockUseInquiries.mockReturnValue({ data: emptyDataList, isLoading: false })
    render(
      <QueryClientProvider client={queryClient}>
        <Inquiries />
      </QueryClientProvider>,
    )
    await userEvent.click(await screen.getByText("Add Inquiry"))
  })

  it("should display add modal when user presses Add Inquiry button", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    fireEvent.change(textArea, {
      target: {
        value: "Why do birds suddenly appear every time you are near?",
      },
    })
    const createInquiry = inquiriesService.createInquiry.mockResolvedValue({
      text: "Why do birds suddenly appear every time you are near?",
      theme_id: null,
      first_scheduled: "2024-12-06T20:07:13.756000",
      id: 9999,
      created_at: "2024-12-06T20:07:28.628373",
      theme: null,
    })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    await waitFor(() => expect(createInquiry).toHaveBeenCalled())
  })

  it("should display required error when no string is entered", async () => {
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    await screen.getByText("Inquiry text is required.")
  })

  it("should display error message when user enters inquiry less than 10 characters", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    const shortString = "W".repeat(MIN_INQUIRY_LENGTH - 1)
    fireEvent.change(textArea, { target: { value: shortString } })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    await screen.getByText(
      `Inquiry must be at least ${MIN_INQUIRY_LENGTH} characters.`,
    )
  })

  it("should display error message when user enters inquiry more than 255 characters", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    const longString = "W".repeat(MAX_INQUIRY_LENGTH + 1)
    fireEvent.change(textArea, { target: { value: longString } })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    await screen.getByText(
      `Inquiry can not be greater than ${MAX_INQUIRY_LENGTH} characters.`,
    )
  })

  it("should display error message when user enters a non-Unicode string", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    fireEvent.change(textArea, { target: { value: nonUnicodeText } })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    await screen.getByText("Inquiry must be a valid unicode string.")
  })

  it("should accept foreign language unicode characters", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    fireEvent.change(textArea, { target: { value: unicodeText } })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
    const unicodeErrorString = await screen.queryByText(
      "Inquiry must be a valid unicode string.",
    )
    expect(unicodeErrorString).toBeNull()
  })
})
