import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
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
    if (inquiries) {
      const inquiriesList = inquiries.data
        .filter(
          (i) => (schedule?.scheduled_inquiries?.indexOf(i.id) ?? -1) >= -1,
        )
        .sort((a: InquiryPublic, b: InquiryPublic) => {
          return (
            (schedule?.scheduled_inquiries?.indexOf(a.id) ?? -1) -
            (schedule?.scheduled_inquiries?.indexOf(b.id) ?? -1)
          )
        })
      setSortedInquiries([...inquiriesList])
    }
  }, [schedule, inquiries])

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  const scheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries?.indexOf(i.id) ?? -1) >= 0,
  )
  const unscheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries?.indexOf(i.id) ?? -1) < 0,
  )

  return (
    <>
      <Tabs>
        <TabList>
          <Tab>Scheduled</Tab>
          <Tab>Unscheduled</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box>
              <DataTable
                data={scheduledInquiries}
                columns={columns(
                  themes,
                  scheduledInquiries,
                  setSortedInquiries,
                  schedule,
                  setSchedule,
                )}
                onRowClick={handleRowClick}
              />
            </Box>
          </TabPanel>

          <TabPanel>
            <Box>
              <DataTable
                data={unscheduledInquiries}
                columns={columns(
                  themes,
                  unscheduledInquiries,
                  setSortedInquiries,
                  schedule,
                  setSchedule,
                )}
                onRowClick={handleRowClick}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </>
  )
}

export default InquiriesTable
