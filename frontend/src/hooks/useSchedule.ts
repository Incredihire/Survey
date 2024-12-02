import { useQuery } from "@tanstack/react-query"
import { ScheduleService } from "../client"

function getScheduleQueryOptions() {
  return {
    queryKey: ["schedule"],
    queryFn: () => ScheduleService.getSchedule(),
  }
}

export function useSchedule() {
  return useQuery({
    ...getScheduleQueryOptions(),
  })
}
