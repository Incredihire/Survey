import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import Navbar from "../../components/Common/Navbar"
import AddInquiry from "../../components/Inquiries/AddInquiry"
import InquiriesTable from "../../components/Inquiries/InquiriesTable.tsx"
import TimerPanel from "../../components/TimerPanel/TimerPanel.tsx"

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
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Inquiries Management
      </Heading>

      <Navbar type={"Inquiry"} addModalAs={AddInquiry} />
      <InquiriesTable />
      <TimerPanel />
    </Container>
  )
}
