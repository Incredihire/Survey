import { Flex, Spinner } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"

import { useEffect } from "react"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import useAuth from "../hooks/useAuth"
import { isLoggedIn } from "../utils/cookies"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  useEffect(() => {
    const openLoginPage = () => {
      window.location.href = `/api/v1/auth/login?state=${encodeURI(window.location.href)}`
    }
    const handleCookieChange = (event: any) => {
      if (
        event.deleted.some((cookie: any) => cookie.name === "access_token") &&
        !isLoggedIn()
      ) {
        openLoginPage()
      }
    }
    if ("cookieStore" in window) {
      ;(window as any).cookieStore.addEventListener(
        "change",
        handleCookieChange,
      )
    }
    if (!isLoggedIn()) {
      openLoginPage()
    }
    return () => {
      if ("cookieStore" in window) {
        ;(window as any).cookieStore.removeEventListener(
          "change",
          handleCookieChange,
        )
      }
    }
  }, [])

  const { isLoading } = useAuth()
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
