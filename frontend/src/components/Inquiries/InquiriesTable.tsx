import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import { useMemo } from "react"
import type { InquiryPublic, SchedulePublic, ThemePublic } from "../../client"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { DataTable } from "../Common/Table.tsx"

import { columns } from "./InquiriesTable.columns.tsx"
import { ScheduledInquiriesTable } from "./ScheduledInquiriesTable.tsx"

interface InquiriesTableProps {
  themes: ThemePublic[]
  schedule: SchedulePublic
}

const InquiriesTable = ({ themes, schedule }: InquiriesTableProps) => {
  const { data: inquiriesData } = useInquiries()
  const inquiries = inquiriesData?.data ?? []
  const sortedInquiries: InquiryPublic[] = useMemo(() => {
    return inquiries
      .sort((a: InquiryPublic, b: InquiryPublic) =>
        (a.first_scheduled ?? "").localeCompare(b.first_scheduled ?? ""),
      )
      .sort((a: InquiryPublic, b: InquiryPublic) => {
        return (
          (schedule?.scheduled_inquiries_and_dates.inquiries.indexOf(a.id) ??
            -1) -
          (schedule?.scheduled_inquiries_and_dates.inquiries.indexOf(b.id) ??
            -1)
        )
      })
  }, [schedule?.scheduled_inquiries_and_dates?.inquiries, inquiries])

  const scheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries.indexOf(i.id) ?? -1) >= 0,
  )
  const unscheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries.indexOf(i.id) ?? -1) < 0,
  )

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  return (
    <Flex
      gap={4}
      marginTop={4}
      alignItems={"flex-start"}
      flexDirection={"column"}
    >
      <Tabs>
        <TabList>
          <Tab>Scheduled</Tab>
          <Tab>Unscheduled</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Box>
              <ScheduledInquiriesTable
                data={scheduledInquiries}
                columns={columns(themes, schedule)}
                onRowClick={handleRowClick}
                schedule={schedule}
              />
            </Box>
          </TabPanel>

          <TabPanel>
            <Box>
              <DataTable
                data={unscheduledInquiries}
                columns={columns(themes, schedule)}
                onRowClick={handleRowClick}
              />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  )
}

export default InquiriesTable
