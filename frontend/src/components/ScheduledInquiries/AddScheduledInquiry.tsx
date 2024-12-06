import { Button, Flex } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash } from "react-icons/fi"
import {
  type ApiError,
  InquiriesService,
  type InquiryPublic,
  type SchedulePublic,
  ScheduleService,
  type ThemePublic,
} from "../../client"
import UpdateInquiry from "../../components/Inquiries/UpdateInquiry"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils/showToastOnError.ts"
import FormModal from "../Common/FormModal.tsx"

type AddScheduledInquiryProps = {
  themes: ThemePublic[]
  inquiry: InquiryPublic
  schedule: SchedulePublic | null | undefined
}
const AddScheduledInquiry = ({
  themes,
  inquiry,
  schedule,
}: AddScheduledInquiryProps) => {
  const queryClient = useQueryClient()
  const [isModalOpen, setModalOpen] = useState(false)
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false)

  const showToast = useCustomToast()
  const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
  const rank = scheduled_inquiries.indexOf(inquiry.id) + 1

  const addToScheduledInquiries = async () => {
    await ScheduleService.updateScheduledInquiries({
      requestBody: [...scheduled_inquiries, inquiry.id],
    })
    await queryClient.invalidateQueries({ queryKey: ["schedule"] })
    await InquiriesService.updateInquiry({
      requestBody: { ...inquiry, first_scheduled: new Date().toISOString() },
    })
  }

  const deleteInquiryMutation = useMutation({
    mutationFn: async () => {
      await InquiriesService.deleteInquiry({
        inquiryId: inquiry.id,
      })
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      showToast("Success!", "Inquiry deleted", "success")
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })

  const rankUpMutation = useMutation({
    mutationFn: async () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      const scheduled_inquiry_id = scheduled_inquiries.splice(index, 1)[0]
      scheduled_inquiries.splice(index - 1, 0, scheduled_inquiry_id)
      const data = await ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
      queryClient.setQueryData(["schedule"], data)
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      showToast(
        "Success!",
        `"${inquiry.text}" moved to ${(data.scheduled_inquiries ?? []).indexOf(inquiry.id) + 1}`,
        "success",
      )
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })

  const rankDownMutation = useMutation({
    mutationFn: async () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      const scheduled_inquiry_id = scheduled_inquiries.splice(index, 1)[0]
      scheduled_inquiries.splice(index + 1, 0, scheduled_inquiry_id)
      const data = await ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
      queryClient.setQueryData(["schedule"], data)
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      showToast(
        "Success!",
        `"${inquiry.text}" moved to rank ${(data.scheduled_inquiries ?? []).indexOf(inquiry.id) + 1}`,
        "success",
      )
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })

  const disableMutation = useMutation({
    mutationFn: async () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      scheduled_inquiries.splice(index, 1)
      const scheduled = await ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
      queryClient.setQueryData(["schedule"], scheduled)
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      showToast(
        "Success!",
        `Removed "${inquiry.text}" from schedule`,
        "success",
      )
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })
  const openModal = () => {
    setModalOpen(true)
  }
  const closeModal = () => {
    setModalOpen(false)
  }

  const openUpdateModal = () => {
    setUpdateModalOpen(true)
  }
  const closeUpdateModal = () => {
    setUpdateModalOpen(false)
  }
  return (
    <Flex flexDirection={"row"} alignItems={"center"} gap={1}>
      {!inquiry.first_scheduled && (
        <Button
          data-testid={"delete-inquiry-button"}
          onClick={() => {
            deleteInquiryMutation.mutate()
          }}
        >
          <FiTrash />
        </Button>
      )}
      <UpdateInquiry
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        inquiry={inquiry}
        themes={themes}
      />
      {!inquiry.first_scheduled && (
        <Button data-testid={"edit-inquiry-button"} onClick={openUpdateModal}>
          <FiEdit2 />
        </Button>
      )}
      {inquiry.first_scheduled && rank > 0 && (
        <Flex flexDirection={"column"} flexWrap={"nowrap"}>
          {rank > 1 ? (
            <Button
              data-testid={"rank-up-inquiry-button"}
              className={"btn-rank-up"}
              isDisabled={rank <= 1}
              onClick={() => {
                rankUpMutation.mutate()
              }}
            >
              <FiChevronUp />
            </Button>
          ) : (
            <div />
          )}
          {rank < scheduled_inquiries.length ? (
            <Button
              className={"btn-rank-down"}
              data-testid={"rank-down-inquiry-button"}
              isDisabled={rank >= scheduled_inquiries.length}
              onClick={() => {
                rankDownMutation.mutate()
              }}
            >
              <FiChevronDown />
            </Button>
          ) : (
            <div />
          )}
        </Flex>
      )}
      {rank > 0 && (
        <Button
          onClick={() => {
            disableMutation.mutate()
          }}
        >
          Remove from Schedule
        </Button>
      )}
      {rank === 0 && <Button onClick={openModal}>Add to Schedule</Button>}

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`You're about to add this inquiry to the schedule. Are you sure?`}
        mutationFn={addToScheduledInquiries}
        successMessage={"Added inquiry to schedule."}
        content={<span>{inquiry.text}</span>}
        submitButtonText="Continue"
        queryKeyToInvalidate={["inquiries"]}
      />
    </Flex>
  )
}

export default AddScheduledInquiry
