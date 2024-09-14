import {
  Container,
  Heading,
} from "@chakra-ui/react"
import { createFileRoute} from "@tanstack/react-router"
import { z } from "zod"

import Navbar from "../../components/Common/Navbar"
import AddInquiry from "../../components/Inquiries/AddInquiry"

const inquiriesSearchSchema = z.object({
  page: z.number().catch(1),
})

export const Route = createFileRoute("/_layout/inquiries")({
  component: Inquiries,
  validateSearch: (search) => inquiriesSearchSchema.parse(search),
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
