import { Container, Heading } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import Navbar from "../../components/Common/Navbar"
import AddTheme from "../../components/Themes/AddTheme.tsx"
import ThemesTable from "../../components/Themes/ThemesTable.tsx"

// Already typed by zod library https://zod.dev/
// eslint-disable-next-line
const inquiriesSearchSchema = z.object({
  // eslint-disable-next-line
  page: z.number().catch(1),
})

// createFileRoute is already typed by tanstack-router: https://tanstack.com/router/latest/docs/framework/react/guide/type-safety
// eslint-disable-next-line
export const Route = createFileRoute("/_layout/themes")({
  component: Themes,
  // eslint-disable-next-line
  validateSearch: (search) => inquiriesSearchSchema.parse(search),
})

export function Themes() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Themes Management
      </Heading>

      <Navbar type={"Theme"} addModalAs={AddTheme} />
      <ThemesTable />
    </Container>
  )
}
