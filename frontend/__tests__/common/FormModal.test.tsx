import "@testing-library/jest-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

jest.mock("../../src/hooks/useCustomToast", () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock("@tanstack/react-query", () => {
  const originalModule = jest.requireActual("@tanstack/react-query")
  return {
    ...originalModule,
    useMutation: jest.fn(),
    useQueryClient: jest.fn(),
  }
})

import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiError } from "../../src/client"
import FormModal, {
  type FieldDefinition,
  type FormModalProps,
} from "../../src/components/Common/FormModal"
import useCustomToast from "../../src/hooks/useCustomToast"

interface TestFormData {
  username: string
  bio?: string
}

describe("FormModal", () => {
  const mockOnClose = jest.fn()

  const mockMutationFn: jest.Mock<Promise<void>, [TestFormData]> = jest.fn()

  const mockShowToast = jest.fn()

  const queryClient = new QueryClient()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCustomToast as jest.Mock).mockReturnValue(mockShowToast)
    ;(useMutation as jest.Mock).mockImplementation(
      ({ onSuccess, onError, onSettled }) => ({
        mutate: (data: TestFormData) => {
          mockMutationFn(data)
            .then(() => {
              onSuccess?.()
              onSettled?.()
            })
            .catch((error: unknown) => {
              onError?.(error)
              onSettled?.()
            })
        },
        isLoading: false,
      }),
    )
    ;(useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: jest.fn(),
    })
  })

  const renderFormModal = (
    props: Partial<FormModalProps<TestFormData>> = {},
  ) => {
    const defaultProps: FormModalProps<TestFormData> = {
      isOpen: true,
      onClose: mockOnClose,
      title: "Test Form Modal",
      fields: [] as FieldDefinition<TestFormData>[],
      mutationFn: mockMutationFn,
      successMessage: "Form submitted successfully",
      ...props,
    }

    return render(
      <QueryClientProvider client={queryClient}>
        <FormModal {...defaultProps} />
      </QueryClientProvider>,
    )
  }

  it("renders the modal when isOpen is true", () => {
    renderFormModal()

    expect(screen.getByText("Test Form Modal")).toBeInTheDocument()
  })

  it("does not render the modal when isOpen is false", () => {
    renderFormModal({ isOpen: false })

    expect(screen.queryByText("Test Form Modal")).not.toBeInTheDocument()
  })

  it("renders fields based on the fields prop", () => {
    const fields: FieldDefinition<TestFormData>[] = [
      {
        name: "username",
        label: "Username",
        placeholder: "Enter your username",
        type: "input",
        validation: { required: "Username is required" },
        inputProps: { "data-testid": "username-input", size: "md" },
      },
      {
        name: "bio",
        label: "Bio",
        type: "textarea",
        placeholder: "Tell us about yourself",
        validation: { required: "Bio is required" },
        inputProps: { "data-testid": "bio-textarea", rows: 4 },
      },
    ]

    renderFormModal({ fields })

    expect(screen.getByLabelText("Username")).toBeInTheDocument()
    expect(screen.getByTestId("username-input")).toBeInTheDocument()

    expect(screen.getByLabelText("Bio")).toBeInTheDocument()
    expect(screen.getByTestId("bio-textarea")).toBeInTheDocument()
  })

  it("submits the form with valid data", async () => {
    mockMutationFn.mockResolvedValueOnce(undefined)

    const fields: FieldDefinition<TestFormData>[] = [
      {
        name: "username",
        label: "Username",
        placeholder: "Enter your username",
        type: "input",
        validation: { required: "Username is required" },
        inputProps: { "data-testid": "username-input", size: "md" },
      },
    ]

    renderFormModal({ fields })

    const usernameInput = screen.getByTestId("username-input")
    const saveButton = screen.getByRole("button", { name: /save/i })

    await userEvent.type(usernameInput, "testuser")
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockMutationFn).toHaveBeenCalledWith({ username: "testuser" })
    })

    expect(mockShowToast).toHaveBeenCalledWith(
      "Success!",
      "Form submitted successfully",
      "success",
    )
    expect(mockOnClose).toHaveBeenCalled()
  })

  it("displays validation errors", async () => {
    const fields: FieldDefinition<TestFormData>[] = [
      {
        name: "username",
        label: "Username",
        placeholder: "Enter your username",
        type: "input",
        validation: { required: "Username is required" },
        inputProps: { "data-testid": "username-input", size: "md" },
      },
    ]

    renderFormModal({ fields })

    const saveButton = screen.getByRole("button", { name: /save/i })

    await userEvent.click(saveButton)

    expect(await screen.findByText("Username is required")).toBeInTheDocument()
  })

  it("handles mutation error", async () => {
    const mockError: ApiError = {
      body: {
        detail: "Mutation failed",
      },
    } as ApiError

    mockMutationFn.mockRejectedValueOnce(mockError)

    const fields: FieldDefinition<TestFormData>[] = [
      {
        name: "username",
        label: "Username",
        placeholder: "Enter your username",
        type: "input",
        validation: { required: "Username is required" },
        inputProps: { "data-testid": "username-input", size: "md" },
      },
    ]

    renderFormModal({ fields })

    const usernameInput = screen.getByTestId("username-input")
    const saveButton = screen.getByRole("button", { name: /save/i })

    await userEvent.type(usernameInput, "testuser")
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockMutationFn).toHaveBeenCalledWith({ username: "testuser" })
    })

    expect(mockShowToast).toHaveBeenCalledWith(
      "Error",
      "Mutation failed",
      "error",
    )
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
