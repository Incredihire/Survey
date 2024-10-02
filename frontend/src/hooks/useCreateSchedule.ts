import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiError, TDataCreateSchedule } from "../client"
import * as scheduleService from "../client/services/scheduleService"
import { handleError } from "../utils"
import useCustomToast from "./useCustomToast"

const useCreateSchedule = () => {
  const showToast = useCustomToast()
  const queryClient = useQueryClient()

  const mutation = useMutation<
    TDataCreateSchedule,
    ApiError,
    TDataCreateSchedule
  >({
    mutationFn: (schedule: TDataCreateSchedule) =>
      scheduleService.createSchedule(schedule).then((response) => response),
    onSuccess: () => {
      showToast("Success!", "Schedule created successfully.", "success")
    },
    onError: (err) => {
      handleError(err, showToast)
    },
    onSettled: () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      queryClient.invalidateQueries({ queryKey: ["schedule"] })
    },
  })

  const createSchedule = (data: TDataCreateSchedule) => {
    mutation.mutate(data)
  }

  return { createSchedule }
}

export default useCreateSchedule
