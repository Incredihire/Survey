import type {
  InquiryPublic,
  InquiryUpdate,
  ThemePublic,
} from "../../client/models"
import { InquiriesService } from "../../client/services"
import { isValidUnicode } from "../../utils/validation"
import FormModal, { type FieldDefinition } from "../Common/FormModal"
export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

interface UpdateInquiryProps {
  isOpen: boolean
  onClose: () => void
  inquiry: InquiryPublic
  themes: ThemePublic[]
}

const UpdateInquiry = ({
  isOpen,
  onClose,
  inquiry,
  themes,
}: UpdateInquiryProps) => {
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
      name: "first_scheduled",
      label: "",
      type: "input",
      inputProps: {
        hidden: true,
        defaultValue: inquiry.first_scheduled ?? undefined,
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
      options: themes.map((t) => [t.id.toString(), t.name]),
      inputProps: {
        "data-testid": "update-inquiry-theme-id",
        defaultValue: inquiry.theme_id?.toString(),
      },
    },
  ]

  const mutationFn = async (data: InquiryUpdate): Promise<void> => {
    if (!data.theme_id) data.theme_id = null
    if (!data.first_scheduled) data.first_scheduled = null
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
