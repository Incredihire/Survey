import {
  Box,
  Button,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { FaPlus } from "react-icons/fa"
import type { InquiryPublic } from "../../client"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { useSchedule } from "../../hooks/useSchedule.ts"
import { useThemes } from "../../hooks/useThemes.ts"
import { DataTable } from "../Common/Table.tsx"
import AddInquiry from "./AddInquiry.tsx"
import { columns } from "./InquiriesTable.columns.tsx"

const InquiriesTable = () => {
  const { data: themesData } = useThemes()
  const themes = themesData?.data ?? []
  const { data: schedule } = useSchedule()
  const { data: inquiriesData } = useInquiries()
  const inquiries = inquiriesData?.data ?? []

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
  const addUnscheduledModal = useDisclosure()
  //const addInquiry = AddInquiry(themes, schedule, true)()
  return (
    <Tabs>
      <TabList>
        <Tab defaultChecked={true}>Scheduled</Tab>
        <Tab>Unscheduled</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <AddInquiry
            isOpen={addScheduledModal.isOpen}
            onClose={addScheduledModal.onClose}
            schedule={schedule}
            themes={themes}
            scheduledFilter={true}
          />
          <Button
            variant="primary"
            gap={1}
            fontSize={{ base: "sm", md: "inherit" }}
            onClick={addScheduledModal.onOpen}
            data-testid={"add-scheduled-button"}
          >
            <Icon as={FaPlus} /> Add Scheduled
          </Button>
          <Box>
            <DataTable
              data={scheduledInquiries}
              columns={columns(themes, schedule)}
              onRowClick={handleRowClick}
            />
          </Box>
        </TabPanel>

        <TabPanel>
          <AddInquiry
            isOpen={addUnscheduledModal.isOpen}
            onClose={addUnscheduledModal.onClose}
            schedule={schedule}
            themes={themes}
            scheduledFilter={false}
          />
          <Button
            variant="primary"
            gap={1}
            fontSize={{ base: "sm", md: "inherit" }}
            onClick={addUnscheduledModal.onOpen}
            data-testid={"add-unscheduled-button"}
          >
            <Icon as={FaPlus} /> Add Unscheduled
          </Button>
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
  )
}

export default InquiriesTable
