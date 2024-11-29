import { Button, Flex, Switch } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { FiChevronDown, FiChevronUp, FiEdit2, FiTrash } from "react-icons/fi"
import {
  type ApiError,
  InquiriesService,
  type InquiryPublic,
  ScheduledInquiriesService,
} from "../../client"
import UpdateInquiry from "../../components/Inquiries/UpdateInquiry"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils/showToastOnError.ts"
import FormModal from "../Common/FormModal.tsx"

type AddScheduledInquiryProps = {
  inquiry: InquiryPublic
  refetchInquiries: () => Promise<void>
}
const AddScheduledInquiry = ({
  inquiry,
  refetchInquiries,
}: AddScheduledInquiryProps) => {
  const [isModalOpen, setModalOpen] = useState(false)
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false)

  const showToast = useCustomToast()

  const addToScheduledInquiries = async () => {
    const addToSchedule = ScheduledInquiriesService.addToSchedule({
      requestBody: {
        inquiry_id: inquiry.id,
      },
    })
    await addToSchedule
    await refetchInquiries()
    return addToSchedule
  }

  const deleteInquiryMutation = useMutation({
    mutationFn: () => {
      return InquiriesService.deleteInquiry({
        requestBody: {
          id: inquiry.id,
          text: inquiry.text,
          theme_id: inquiry.theme_id,
        },
      })
    },
    onSuccess: async () => {
      await refetchInquiries()
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

  const moveRankMutation = useMutation({
    mutationFn: (rank: number) => {
      return ScheduledInquiriesService.updateScheduledInquiry({
        requestBody: {
          id: inquiry.scheduled_inquiry?.id ?? 0,
          rank,
          inquiry_id: inquiry.id,
        },
      })
    },
    onSuccess: async (data) => {
      await refetchInquiries()
      showToast("Success!", `Rank moved to ${data.rank}`, "success")
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
      return ScheduledInquiriesService.disableScheduledInquiry({
        scheduledInquiryId: inquiry.scheduled_inquiry?.id ?? 0,
      })
    },
    onSuccess: async () => {
      await refetchInquiries()
      showToast("Success!", "Inquiry disabled", "success")
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
      return ScheduledInquiriesService.enableScheduledInquiry({
        scheduledInquiryId: inquiry.scheduled_inquiry?.id ?? 0,
      })
    },
    onSuccess: async () => {
      await refetchInquiries()
      showToast("Success!", "Inquiry enabled", "success")
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
      {!inquiry.scheduled_inquiry && (
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
      />
      {!inquiry.scheduled_inquiry && (
        <Button onClick={openUpdateModal}>
          <FiEdit2 />
        </Button>
      )}
      {(inquiry.scheduled_inquiry?.rank ?? 0) !== 0 && (
        <Flex flexDirection={"column"} flexWrap={"nowrap"}>
          <Button
            className={"btn-rank-up"}
            isDisabled={(inquiry.scheduled_inquiry?.rank ?? 1) === 1}
            onClick={() => {
              moveRankMutation.mutate(
                (inquiry.scheduled_inquiry?.rank ?? 2) - 1,
              )
            }}
          >
            <FiChevronUp />
          </Button>
          <Button
            className={"btn-rank-down"}
            onClick={() => {
              moveRankMutation.mutate(
                (inquiry.scheduled_inquiry?.rank ?? 1) + 1,
              )
            }}
          >
            <FiChevronDown />
          </Button>
        </Flex>
      )}
      {inquiry.scheduled_inquiry && (
        <Switch
          defaultChecked={!!inquiry.scheduled_inquiry.rank}
          onChange={(event) => {
            if (event.target.checked) {
              enableMutation.mutate()
            } else {
              disableMutation.mutate()
            }
          }}
        />
      )}
      <Button onClick={openModal} isDisabled={!!inquiry.scheduled_inquiry}>
        {inquiry.scheduled_inquiry ? "Scheduled" : "Add to Schedule"}
      </Button>
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
