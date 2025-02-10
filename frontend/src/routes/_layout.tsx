import { Flex } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  return (
    <Flex maxW="large" h="auto" position="relative">
      <Sidebar />
      <Outlet />
      <UserMenu />
    </Flex>
  )
}
