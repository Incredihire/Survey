import {
  Box,
  Button,
  Flex,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { FaPlus } from "react-icons/fa"
import type { InquiryPublic } from "../../client"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { useSchedule } from "../../hooks/useSchedule.ts"
import { useThemes } from "../../hooks/useThemes.ts"
import { DataTable } from "../Common/Table.tsx"
import AddInquiry from "./AddInquiry.tsx"
import { columns } from "./InquiriesTable.columns.tsx"
import { ScheduledInquiriesTable } from "./ScheduledInquiriesTable.tsx"
const InquiriesTable = () => {
  const { data: themesData } = useThemes()
  const themes = themesData?.data ?? []
  const { data: schedule } = useSchedule()
  const { data: inquiriesData } = useInquiries()
  const inquiries = inquiriesData?.data ?? []
  const [activeTabIndex, setActiveTabindex] = useState(0)
  const sortedInquiries: InquiryPublic[] = useMemo(() => {
    return inquiries
      .sort((a: InquiryPublic, b: InquiryPublic) =>
        (a.first_scheduled ?? "").localeCompare(b.first_scheduled ?? ""),
      )
      .sort((a: InquiryPublic, b: InquiryPublic) => {
        return (
          (schedule?.scheduled_inquiries.indexOf(a.id) ?? -1) -
          (schedule?.scheduled_inquiries.indexOf(b.id) ?? -1)
        )
      })
  }, [schedule?.scheduled_inquiries, inquiries])

  const scheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries.indexOf(i.id) ?? -1) >= 0,
  )
  const unscheduledInquiries = sortedInquiries.filter(
    (i) => (schedule?.scheduled_inquiries.indexOf(i.id) ?? -1) < 0,
  )

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  const addScheduledModal = useDisclosure()
  return (
    <Flex
      gap={4}
      marginTop={4}
      alignItems={"flex-start"}
      flexDirection={"column"}
    >
      <AddInquiry
        isOpen={addScheduledModal.isOpen}
        onClose={addScheduledModal.onClose}
        schedule={schedule}
        themes={themes}
        scheduledFilter={activeTabIndex === 0}
      />
      <Button
        variant="primary"
        gap={1}
        fontSize={{ base: "sm", md: "inherit" }}
        onClick={addScheduledModal.onOpen}
        data-testid={"add-inquiry-button"}
      >
        <Icon as={FaPlus} /> Add Inquiry
      </Button>

      <Tabs onChange={setActiveTabindex}>
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
