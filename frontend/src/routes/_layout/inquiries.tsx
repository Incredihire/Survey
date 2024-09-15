import {
  Container,
  Heading,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import Navbar from "../../components/Common/Navbar"
import AddInquiry from "../../components/Inquiries/AddInquiry"

const inquiriesSearchSchema = z.object({
  page: z.coerce.number().positive().default(1),
})

type InquiriesSearch = z.infer<typeof inquiriesSearchSchema>

export const Route = createFileRoute("/_layout/inquiries")({
  component: Inquiries,
  validateSearch: (search): InquiriesSearch => inquiriesSearchSchema.parse(search),
})

function Inquiries() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Inquiries Management
      </Heading>

      <Navbar type={"Inquiry"} addModalAs={AddInquiry} />
    </Container>
  )
}
