import type { InquiryPublic, InquiryUpdate } from "../../client/models"
import { InquiriesService } from "../../client/services"
import { useThemes } from "../../hooks/useThemes.js"
import { isValidUnicode } from "../../utils/validation"
import FormModal, { type FieldDefinition } from "../Common/FormModal"
export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

interface UpdateInquiryProps {
  isOpen: boolean
  onClose: () => void
  inquiry: InquiryPublic
}

const UpdateInquiry = ({ isOpen, onClose, inquiry }: UpdateInquiryProps) => {
  const { data: themes, isLoading } = useThemes()

  const fields: FieldDefinition<InquiryUpdate>[] = [
    {
      name: "id",
      label: "",
      type: "input",
      validation: {
        required: "ID required.",
      },
      inputProps: {
        hidden: true,
        defaultValue: inquiry.id.toString(),
      },
    },
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
        "data-testid": "update-inquiry-text",
        defaultValue: inquiry.text,
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
        "data-testid": "update-inquiry-theme-id",
        defaultValue: inquiry.theme_id?.toString(),
      },
    },
  ]

  const mutationFn = async (data: InquiryUpdate): Promise<void> => {
    if (!data.theme_id) data.theme_id = null
    await InquiriesService.updateInquiry({ requestBody: data })
  }

  return (
    <FormModal<InquiryUpdate>
      isOpen={isOpen}
      onClose={onClose}
      title="Update Inquiry"
      fields={fields}
      mutationFn={mutationFn}
      successMessage="Inquiry updated successfully."
      queryKeyToInvalidate={["inquiries"]}
      submitButtonProps={{ "data-testid": "submit-update-inquiry" }}
    />
  )
}

export default UpdateInquiry
