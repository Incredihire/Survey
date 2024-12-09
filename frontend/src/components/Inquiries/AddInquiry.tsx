import { useQueryClient } from "@tanstack/react-query"
import {
  InquiriesService,
  type InquiryCreate,
  type SchedulePublic,
  ScheduleService,
  type ThemePublic,
} from "../../client"
import { isValidUnicode } from "../../utils/validation"
import FormModal, { type FieldDefinition } from "../Common/FormModal"
export const MIN_INQUIRY_LENGTH = 10
export const MAX_INQUIRY_LENGTH = 256

interface AddInquiryProps {
  isOpen: boolean
  onClose: () => void
  themes: ThemePublic[]
  schedule: SchedulePublic | null | undefined
  scheduledFilter: boolean
}

const AddInquiry = ({
  isOpen,
  onClose,
  themes,
  schedule,
  scheduledFilter,
}: AddInquiryProps) => {
  const queryClient = useQueryClient()
  const fields: FieldDefinition<InquiryCreate>[] = [
    {
      name: "first_scheduled",
      label: "",
      type: "input",
      inputProps: {
        hidden: true,
        defaultValue: scheduledFilter ? new Date().toISOString() : undefined,
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
        "data-testid": "add-inquiry-text",
      },
    },
    {
      name: "theme_id",
      label: "Category",
      placeholder: "Choose a category",
      type: "select",
      options: themes.map((t) => [t.id.toString(), t.name]),
      inputProps: {
        "data-testid": "add-inquiry-theme-id",
      },
    },
  ]

  const mutationFn = async (data: InquiryCreate): Promise<void> => {
    if (!data.theme_id) data.theme_id = null
    if (!data.first_scheduled) data.first_scheduled = null
    const inquiry = await InquiriesService.createInquiry({
      requestBody: data,
    })
    if (scheduledFilter && schedule) {
      await ScheduleService.updateScheduledInquiries({
        requestBody: [...schedule.scheduled_inquiries, inquiry.id],
      })
      void queryClient.invalidateQueries({ queryKey: ["schedule"] })
    }
  }
  return (
    <FormModal<InquiryCreate>
      isOpen={isOpen}
      onClose={onClose}
      title={"Add Inquiry"}
      fields={fields}
      mutationFn={mutationFn}
      successMessage="Inquiry created successfully."
      queryKeyToInvalidate={["inquiries"]}
      submitButtonProps={{ "data-testid": "submit-add-inquiry" }}
    />
  )
}
AddInquiry.displayName = "AddInquiry"
export default AddInquiry
