import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { ApiError, ScheduleCreate } from "../client"
import { ScheduleService } from "../client/services"
import { handleError } from "../utils"
import useCustomToast from "./useCustomToast"

const useCreateSchedule = () => {
  const showToast = useCustomToast()
  const queryClient = useQueryClient()

  const mutation = useMutation<ScheduleCreate, ApiError, ScheduleCreate>({
    mutationFn: (schedule: ScheduleCreate) =>
      ScheduleService.scheduleCreateSchedule({ requestBody: schedule }).then(
        (response) => response,
      ),
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

  const createSchedule = (data: ScheduleCreate) => {
    mutation.mutate(data)
  }

  return { createSchedule }
}

export default useCreateSchedule
