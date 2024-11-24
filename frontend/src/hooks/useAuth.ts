import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { UsersService } from "../client/services"

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const {
    data: user,
    isLoading,
    refetch,
    failureReason,
  } = useQuery({
    queryKey: ["currentUser"],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    queryFn: UsersService.readUserMe,
    enabled: true,
  })
  if (failureReason) {
    const gotoLogin = () => {
      window.location.href = escape("/api/v1/auth/login")
    }
    fetch("/api/v1/auth/refresh", { method: "POST" })
      .then((response) => {
        if (response.ok) {
          refetch().catch(gotoLogin)
        } else {
          gotoLogin()
        }
      })
      .catch(gotoLogin)
  }
  return {
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export default useAuth
