import { Button } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import {
  type ApiError,
  type InquiryPublic,
  ScheduledInquiriesService,
  type ScheduledInquiryCreate,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils/showToastOnError"
import ContentModal from "../Common/ContentModal"

type AddScheduledInquiryProps = {
  inquiry: InquiryPublic
}
const AddScheduledInquiry = ({ inquiry }: AddScheduledInquiryProps) => {
  const showToast = useCustomToast()
  const [isModalOpen, setModalOpen] = useState(false)

  const addToScheduledInquiries = async (data: ScheduledInquiryCreate) => {
    return ScheduledInquiriesService.scheduledInquiriesAddToSchedule({
      requestBody: data,
    })
  }

  const mutation = useMutation({
    mutationFn: addToScheduledInquiries,
    onSuccess: () => {
      showToast("Success!", "Added inquiry to schedule.", "success")
      closeModal()
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })

  const handleSubmit = () => {
    mutation.mutate({ inquiry_id: inquiry.id })
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
      <ContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        title={`You're about to add this inquiry to the schedule. Are you sure?`}
        content={<span>{inquiry.text}</span>}
        submitButtonText="Continue"
      />
    </>
  )
}

export default AddScheduledInquiry
