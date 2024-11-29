import type { InquiryCreate } from "../../client/models"
import { InquiriesService } from "../../client/services"
import { useThemes } from "../../hooks/useThemes.js"
import { isValidUnicode } from "../../utils/validation"
import FormModal, { type FieldDefinition } from "../Common/FormModal"
export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

interface AddInquiryProps {
  isOpen: boolean
  onClose: () => void
}

const AddInquiry = ({ isOpen, onClose }: AddInquiryProps) => {
  const { data: themes, isLoading } = useThemes()

  const fields: FieldDefinition<InquiryCreate>[] = [
    {
      name: "text",
      label: "Inquiry Text",
      placeholder: "Enter the text of your inquiry.",
      type: "textarea",
      validation: {
        required: "Inquiry text is required.",
        minLength: {
          value: MIN_INQUIRY_LENGTH,
          message: `Inquiry must be at least ${MIN_INQUIRY_LENGTH} characters.`,
        },
        maxLength: {
          value: MAX_INQUIRY_LENGTH,
          message: `Inquiry can not be greater than ${MAX_INQUIRY_LENGTH} characters.`,
        },
        validate: (value: string) =>
          isValidUnicode(value) || "Inquiry must be a valid unicode string.",
      },
      inputProps: {
        "data-testid": "add-inquiry-text",
      },
    },
    {
      name: "theme_id",
      label: "Category",
      placeholder: "Choose a category",
      type: "select",
      options: isLoading
        ? []
        : (themes?.data || []).map((t) => [t.id.toString(), t.name]),
      inputProps: {
        "data-testid": "add-inquiry-theme-id",
      },
    },
  ]

  const mutationFn = async (data: InquiryCreate): Promise<void> => {
    if (!data.theme_id) data.theme_id = null
    await InquiriesService.createInquiry({ requestBody: data })
  }

  return (
    <FormModal<InquiryCreate>
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inquiry"
      fields={fields}
      mutationFn={mutationFn}
      successMessage="Inquiry created successfully."
      queryKeyToInvalidate={["inquiries"]}
      submitButtonProps={{ "data-testid": "submit-add-inquiry" }}
    />
  )
}

export default AddInquiry
