import { Box, Container, Flex, Spinner, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user, isLoading } = useAuth()

  return (
    <Container maxW="full">
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Box pt={12} m={4}>
          <Text fontSize="2xl">Hi, {user?.full_name || user?.email} 👋🏼</Text>
          <Text>Welcome back, nice to see you again!</Text>
        </Box>
      )}
    </Container>
  )
}
