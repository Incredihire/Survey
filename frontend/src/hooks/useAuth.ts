import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { OpenAPI } from "../client"
import { UsersService } from "../client"

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const {
    data: user,
    isLoading,
    failureReason,
  } = useQuery({
    queryKey: ["currentUser"],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    queryFn: UsersService.readUserMe,
    enabled: true,
  })
  if (failureReason) {
    window.location.href = OpenAPI.BASE + escape("/api/v1/auth/login")
  }
  return {
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export default useAuth
