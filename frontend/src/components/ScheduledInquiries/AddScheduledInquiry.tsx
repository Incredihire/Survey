import { Button } from "@chakra-ui/react"
import { useState } from "react"
import { type InquiryPublic, ScheduledInquiriesService } from "../../client"
import FormModal from "../Common/FormModal.tsx"

type AddScheduledInquiryProps = {
  inquiry: InquiryPublic
}
const AddScheduledInquiry = ({ inquiry }: AddScheduledInquiryProps) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const addToScheduledInquiries = async () => {
    return ScheduledInquiriesService.addToSchedule({
      requestBody: {
        inquiry_id: inquiry.id,
      },
    })
  }

  const openModal = () => {
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }

  return (
    <>
      <Button onClick={openModal}>Add to Schedule</Button>
      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`You're about to add this inquiry to the schedule. Are you sure?`}
        mutationFn={addToScheduledInquiries}
        successMessage={"Added inquiry to schedule."}
        content={<span>{inquiry.text}</span>}
      />
    </>
  )
}

export default AddScheduledInquiry
