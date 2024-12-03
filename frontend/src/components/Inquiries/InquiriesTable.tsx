import { Box } from "@chakra-ui/react"
import { useMemo } from "react"
import type {
  InquiryPublic,
  SchedulePublic,
  ThemePublic,
} from "../../client/models.ts"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { DataTable } from "../Common/Table.tsx"
import { columns } from "./InquiriesTable.columns.tsx"
type InquiriesTableProps = {
  themes: ThemePublic[]
  schedule: SchedulePublic | null | undefined
  scheduledFilter: boolean
}

const InquiriesTable = ({
  themes,
  schedule,
  scheduledFilter,
}: InquiriesTableProps) => {
  const { data: inquiries } = useInquiries()
  const sortedInquiries = useMemo(() => {
    return (inquiries?.data ?? [])
      .sort((a: InquiryPublic, b: InquiryPublic) =>
        (a.first_scheduled ?? "").localeCompare(b.first_scheduled ?? ""),
      )
      .sort((a: InquiryPublic, b: InquiryPublic) => {
        return (
          (schedule?.scheduled_inquiries.indexOf(a.id) ?? -1) -
          (schedule?.scheduled_inquiries.indexOf(b.id) ?? -1)
        )
      })
      .filter(
        (i) =>
          (schedule?.scheduled_inquiries.indexOf(i.id) ?? -1) >= 0 ===
          scheduledFilter,
      )
  }, [schedule?.scheduled_inquiries, inquiries?.data, scheduledFilter])
  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }
  return (
    <Box>
      <DataTable
        data={sortedInquiries}
        columns={columns(themes, schedule)}
        onRowClick={handleRowClick}
      />
    </Box>
  )
}

export default InquiriesTable
