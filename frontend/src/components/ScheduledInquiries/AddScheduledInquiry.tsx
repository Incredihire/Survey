import { Button, Flex, Switch, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
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
  inquiries: InquiryPublic[]
  setInquiries: React.Dispatch<React.SetStateAction<InquiryPublic[]>>
  setSchedule: React.Dispatch<React.SetStateAction<SchedulePublic | null>>
  schedule: SchedulePublic | null | undefined
}
const AddScheduledInquiry = ({
  themes,
  inquiry,
  inquiries,
  setInquiries,
  setSchedule,
  schedule,
}: AddScheduledInquiryProps) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false)

  const showToast = useCustomToast()
  const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
  const rank = scheduled_inquiries.indexOf(inquiry.id) + 1

  const addToScheduledInquiries = async () => {
    const scheduleUpdated = await ScheduleService.updateScheduledInquiries({
      requestBody: [...scheduled_inquiries, inquiry.id],
    })
    const addToSchedule = InquiriesService.updateInquiry({
      requestBody: { ...inquiry, first_scheduled: new Date().toISOString() },
    })

    const inquiry_scheduled = await addToSchedule
    setSchedule(scheduleUpdated)
    setInquiries([
      ...inquiries.filter((i) => i.id !== inquiry_scheduled.id),
      inquiry_scheduled,
    ])
    return addToSchedule
  }

  const deleteInquiryMutation = useMutation({
    mutationFn: () => {
      return InquiriesService.deleteInquiry({
        requestBody: {
          id: inquiry.id,
          text: inquiry.text,
          theme_id: inquiry.theme_id,
          first_scheduled: inquiry.first_scheduled,
        },
      })
    },
    onSuccess: (data) => {
      setInquiries(inquiries.filter((i) => i.id !== data.id))
      showToast("Success!", "Inquiry deleted", "success")
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // if (queryKeyToInvalidate) {
      //   void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      // }
    },
  })

  const rankUpMutation = useMutation({
    mutationFn: () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      const scheduled_inquiry_id = scheduled_inquiries.splice(index, 1)[0]
      scheduled_inquiries.splice(index - 1, 0, scheduled_inquiry_id)
      return ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
    },
    onSuccess: (data) => {
      setSchedule(data)
      showToast(
        "Success!",
        `"${inquiry.text}" moved to ${(data.scheduled_inquiries ?? []).indexOf(inquiry.id) + 1}`,
        "success",
      )
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // if (queryKeyToInvalidate) {
      //   void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      // }
    },
  })

  const rankDownMutation = useMutation({
    mutationFn: () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      const scheduled_inquiry_id = scheduled_inquiries.splice(index, 1)[0]
      scheduled_inquiries.splice(index + 1, 0, scheduled_inquiry_id)
      return ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
    },
    onSuccess: (data) => {
      setSchedule(data)
      showToast(
        "Success!",
        `"${inquiry.text}" moved to rank ${(data.scheduled_inquiries ?? []).indexOf(inquiry.id) + 1}`,
        "success",
      )
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // if (queryKeyToInvalidate) {
      //   void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      // }
    },
  })

  const disableMutation = useMutation({
    mutationFn: () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      const index = scheduled_inquiries.indexOf(inquiry.id)
      scheduled_inquiries.splice(index, 1)
      return ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
    },
    onSuccess: (data) => {
      setSchedule(data)
      showToast("Success!", `"${inquiry.text}" disabled`, "success")
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // if (queryKeyToInvalidate) {
      //   void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      // }
    },
  })

  const enableMutation = useMutation({
    mutationFn: () => {
      const scheduled_inquiries = schedule?.scheduled_inquiries ?? []
      return ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries.concat(inquiry.id),
      })
    },
    onSuccess: (data) => {
      setSchedule(data)
      showToast("Success!", `"${inquiry.text}" enabled`, "success")
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // if (queryKeyToInvalidate) {
      //   void queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate })
      // }
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
        inquiries={inquiries}
        setInquiries={setInquiries}
      />
      {!inquiry.first_scheduled && (
        <Button onClick={openUpdateModal}>
          <FiEdit2 />
        </Button>
      )}
      {inquiry.first_scheduled && rank > 0 && (
        <Flex flexDirection={"column"} flexWrap={"nowrap"}>
          <Button
            className={"btn-rank-up"}
            isDisabled={rank <= 1}
            onClick={() => {
              rankUpMutation.mutate()
            }}
          >
            <FiChevronUp />
          </Button>
          <Button
            className={"btn-rank-down"}
            isDisabled={rank >= scheduled_inquiries.length}
            onClick={() => {
              rankDownMutation.mutate()
            }}
          >
            <FiChevronDown />
          </Button>
        </Flex>
      )}
      {inquiry.first_scheduled && (
        <>
          <Switch
            defaultChecked={!!rank}
            onChange={(event) => {
              if (event.target.checked) {
                enableMutation.mutate()
              } else {
                disableMutation.mutate()
              }
            }}
          />
          <Text className={rank ? "" : "inactive-text"}>Scheduled</Text>
        </>
      )}
      {!inquiry.first_scheduled && (
        <Button onClick={openModal}>Add to Schedule</Button>
      )}

      <FormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`You're about to add this inquiry to the schedule. Are you sure?`}
        mutationFn={addToScheduledInquiries}
        successMessage={"Added inquiry to schedule."}
        content={<span>{inquiry.text}</span>}
        submitButtonText="Continue"
      />
    </Flex>
  )
}

export default AddScheduledInquiry
