import {
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  useDisclosure,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { FaCalendarCheck, FaPlus } from "react-icons/fa"
import AddInquiry from "../../components/Inquiries/AddInquiry.tsx"
import InquiriesTable from "../../components/Inquiries/InquiriesTable.tsx"
import TimerPanel from "../../components/TimerPanel/TimerPanel.tsx"
import { useSchedule } from "../../hooks/useSchedule.ts"
import { useThemes } from "../../hooks/useThemes.ts"

// Already typed by zod library https://zod.dev/
// eslint-disable-next-line
const inquiriesSearchSchema = z.object({
  // eslint-disable-next-line
  page: z.number().catch(1),
})

// createFileRoute is already typed by tanstack-router: https://tanstack.com/router/latest/docs/framework/react/guide/type-safety
// eslint-disable-next-line
export const Route = createFileRoute("/_layout/inquiries")({
  component: Inquiries,
  // eslint-disable-next-line
  validateSearch: (search) => inquiriesSearchSchema.parse(search),
})

export function Inquiries() {
  const { data: themesData } = useThemes()
  const themes = themesData?.data ?? []
  const { data: schedule } = useSchedule()
  const addInquiryModal = useDisclosure()
  const scheduleSettingsModal = useDisclosure()

  if (!schedule || !themesData) return "Data is loading."
  return (
    <Container maxW="full">
      <Heading
        size="lg"
        textAlign={{ base: "center", md: "left" }}
        pt={12}
        pb={4}
      >
        Inquiries Management
      </Heading>
      <Flex gap={2}>
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: "sm", md: "inherit" }}
          onClick={addInquiryModal.onOpen}
          data-testid={"add-inquiry-button"}
        >
          <Icon as={FaPlus} /> Add Inquiry
        </Button>
        <AddInquiry
          isOpen={addInquiryModal.isOpen}
          onClose={addInquiryModal.onClose}
          schedule={schedule}
          themes={themes}
          scheduledFilter={false}
        />
        <Button
          variant="primary"
          gap={1}
          fontSize={{ base: "sm", md: "inherit" }}
          onClick={scheduleSettingsModal.onOpen}
          data-testid={"schedule-settings-button"}
        >
          <Icon as={FaCalendarCheck} /> Schedule Settings
        </Button>
        <TimerPanel
          schedule={schedule}
          isOpen={scheduleSettingsModal.isOpen}
          onClose={scheduleSettingsModal.onClose}
        />
      </Flex>
      <InquiriesTable schedule={schedule} themes={themes} />
    </Container>
  )
}
