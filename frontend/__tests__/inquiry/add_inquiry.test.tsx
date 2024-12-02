/* Codacy is unhappy with await */
/* eslint-disable @typescript-eslint/await-thenable */
/* Codacy is unhappy with click events */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* Codacy is unhappy with mocking */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Inquiries } from "../../src/routes/_layout/inquiries"
import "@testing-library/jest-dom"
import {
  MAX_INQUIRY_LENGTH,
  MIN_INQUIRY_LENGTH,
} from "../../src/components/Inquiries/AddInquiry"

const unicodeText =
  "Тенденция к взаимопомощи у человека имеет столь отдаленное происхождение и так глубоко переплетена со всей прошлой эволюцией человеческого рода, что она сохранилась у человечества вплоть до настоящего времени, несмотря на все превратности истории."
const nonUnicodeText =
  "\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF\uD800-\uDBFF"

jest.mock("../../src/components/Inquiries/InquiriesTable", () => ({
  __esModule: true,
  default: () => <div />,
}))

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => {},
  useMutation: () => ({
    mutate: () => {},
  }),
}))

const queryClient = new QueryClient()
describe("Add Inquiry", () => {
  beforeEach(async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Inquiries />
      </QueryClientProvider>,
    )
    await userEvent.click(screen.getByText("Add Inquiry"))
  })

  it("should display add modal when user presses Add Inquiry button", async () => {
    const textArea = await screen.getByTestId("add-inquiry-text")
    fireEvent.change(textArea, {
      target: {
        value: "Why do birds suddenly appear every time you are near?",
      },
    })
    await userEvent.click(screen.getByTestId("submit-add-inquiry"))
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
