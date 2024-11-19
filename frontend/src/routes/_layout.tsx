import { Flex, Spinner } from "@chakra-ui/react"
import { Outlet, createFileRoute } from "@tanstack/react-router"

import { useEffect } from "react"
import Sidebar from "../components/Common/Sidebar"
import UserMenu from "../components/Common/UserMenu"
import useAuth from "../hooks/useAuth"
import {
  getAccessTokenExpiry,
  isLoggedIn,
  removeAccessTokenExpiry,
} from "../utils/cookies"

export const Route = createFileRoute("/_layout")({
  component: Layout,
})

function Layout() {
  useEffect(() => {
    const openLoginPage = () => {
      window.location.href = escape("/api/v1/auth/login")
    }
    let accessTokenExpiryTimeout: NodeJS.Timeout | null = null
    if (!isLoggedIn()) {
      openLoginPage()
    } else {
      const expiry = getAccessTokenExpiry()
      if (expiry) {
        const now = new Date()
        const delay = expiry - now.getTime() / 1000

        if (delay > 0) {
          accessTokenExpiryTimeout = setTimeout(() => {
            removeAccessTokenExpiry()
            openLoginPage()
          }, delay)
        }
      }
    }
    return () => {
      if (accessTokenExpiryTimeout) {
        clearTimeout(accessTokenExpiryTimeout)
        accessTokenExpiryTimeout = null
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
