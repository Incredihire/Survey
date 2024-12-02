import { Box } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { ScheduleService } from "../../client"
import type { InquiryPublic, SchedulePublic, ThemePublic } from "../../client"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { DataTable } from "../Common/Table.tsx"
import { columns } from "./InquiriesTable.columns.tsx"
type InquiriesTableProps = {
  themes: ThemePublic[]
}

const InquiriesTable = ({ themes }: InquiriesTableProps) => {
  const [schedule, setSchedule] = useState<SchedulePublic | null>(null)
  useEffect(() => {
    async function startGetSchedule() {
      setSchedule(null)
      const s = await ScheduleService.getSchedule()
      if (!ignore) {
        setSchedule(s)
      }
    }
    let ignore = false
    void startGetSchedule()
    return () => {
      ignore = true
    }
  }, [])

  const { data: inquiries } = useInquiries()

  const [sortedInquiries, setSortedInquiries] = useState<InquiryPublic[]>([])
  useEffect(() => {
    setSortedInquiries([])
    if (inquiries?.data) {
      inquiries?.data.sort((a: InquiryPublic, b: InquiryPublic) => {
        return (
          (schedule?.scheduled_inquiries?.indexOf(a.id) ?? -1) -
          (schedule?.scheduled_inquiries?.indexOf(b.id) ?? -1)
        )
      })
      setSortedInquiries([...inquiries.data])
    }
  }, [schedule, inquiries?.data])

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  return (
    <>
      <Box>
        <DataTable
          data={sortedInquiries}
          columns={columns(
            themes,
            sortedInquiries ?? [],
            setSortedInquiries,
            schedule,
            setSchedule,
          )}
          onRowClick={handleRowClick}
        />
      </Box>
    </>
  )
}

export default InquiriesTable
