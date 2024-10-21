import { useQuery } from "@tanstack/react-query"
import { InquiriesService } from "../client"

function getInquiriesQueryOptions() {
  return {
    queryKey: ["inquiries"],
    queryFn: () => InquiriesService.getInquries(),
  }
}

export function useInquiries() {
  return useQuery({
    ...getInquiriesQueryOptions(),
  })
}
