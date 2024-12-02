import { Box } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { InquiriesService, ScheduleService } from "../../client"
import type {
  InquiryPublic,
  SchedulePublic,
  ThemePublic,
} from "../../client/models.ts"
import Navbar from "../Common/Navbar.tsx"
import { DataTable } from "../Common/Table.tsx"
import AddInquiry from "./AddInquiry.tsx"
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

  const [inquiries, setInquiries] = useState<InquiryPublic[]>([])

  useEffect(() => {
    async function startGetInquiries() {
      const inquiriesUpdated = await InquiriesService.getInquries()
      //setInquiries(null)
      if (!ignore) {
        setInquiries(inquiriesUpdated.data)
      }
    }
    let ignore = false
    void startGetInquiries()
    return () => {
      ignore = true
    }
  }, [])

  const [sortedInquiries, setSortedInquiries] = useState<InquiryPublic[]>([])
  useEffect(() => {
    setSortedInquiries([])
    inquiries.sort((a: InquiryPublic, b: InquiryPublic) => {
      return (
        (schedule?.scheduled_inquiries?.indexOf(a.id) ?? -1) -
        (schedule?.scheduled_inquiries?.indexOf(b.id) ?? -1)
      )
    })
    setSortedInquiries([...inquiries])
  }, [schedule, inquiries])

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  return (
    <>
      <Navbar
        type={"Inquiry"}
        addModalAs={AddInquiry(themes, inquiries ?? [], setInquiries)}
      />
      <Box>
        <DataTable
          data={sortedInquiries}
          columns={columns(
            themes,
            inquiries ?? [],
            setInquiries,
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
