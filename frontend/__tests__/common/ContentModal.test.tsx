import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContentModal, {
  type ContentModalProps,
} from "../../src/components/Common/ContentModal"

describe("ContentModal", () => {
  const mockOnClose = jest.fn()
  const mockOnSubmit = jest.fn()

  const renderContentModal = (props: Partial<ContentModalProps> = {}) => {
    const defaultProps: ContentModalProps = {
      isOpen: true,
      onClose: mockOnClose,
      title: "Test Modal Title",
      onSubmit: mockOnSubmit,
      submitButtonText: "Submit",
      content: <div>Test Content</div>,
      ...props,
    }

    return render(<ContentModal {...defaultProps} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the modal when isOpen is true", () => {
    renderContentModal()

    expect(screen.getByText("Test Modal Title")).toBeInTheDocument()
    expect(screen.getByText("Test Content")).toBeInTheDocument()
    expect(screen.getByText("Submit")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("does not render the modal when isOpen is false", () => {
    renderContentModal({ isOpen: false })

    expect(screen.queryByText("Test Modal Title")).not.toBeInTheDocument()
  })

  it("calls onSubmit when the submit button is clicked", async () => {
    renderContentModal()

    const submitButton = screen.getByText("Submit")
    await userEvent.click(submitButton)

    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it("calls onClose when the cancel button is clicked", async () => {
    renderContentModal()

    const cancelButton = screen.getByText("Cancel")
    await userEvent.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("calls onClose when the close button is clicked", async () => {
    renderContentModal()

    const closeButton = screen.getByLabelText("Close")
    await userEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it("renders the correct submit button text", () => {
    renderContentModal({ submitButtonText: "Save" })

    expect(screen.getByText("Save")).toBeInTheDocument()
  })
})
