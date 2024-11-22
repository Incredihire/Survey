import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import type { UserPublic } from "../client"
import { UsersService } from "../client/services"

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const {
    data: user,
    isLoading,
    refetch,
    failureReason,
  } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    queryFn: UsersService.readUserMe,
    enabled: true,
  })
  if (failureReason) {
    fetch("/api/v1/auth/refresh", { method: "POST" }).then((response) => {
      if (response.ok) {
        refetch()
      } else {
        window.location.href = escape("/api/v1/auth/login")
      }
    })
  }
  return {
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export default useAuth
