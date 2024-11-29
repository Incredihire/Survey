import { Flex, Spinner } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"

import Cookies from "js-cookie"
import { OpenAPI } from "../client"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import useAuth from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  const { isLoading } = useAuth()
  if (
    !OpenAPI.TOKEN &&
    Cookies.get("access_token") &&
    window.location.host.startsWith("localhost:")
  ) {
    OpenAPI.TOKEN = Cookies.get("access_token")
  }
  return (
    <Flex maxW="large" h="auto" position="relative">
      <Sidebar />
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Outlet />
      )}
      <UserMenu />
    </Flex>
  )
}
