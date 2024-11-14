import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import type { UserPublic } from "../client"
import { UsersService } from "../client/services"
import { isLoggedIn } from "../utils/cookies"

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const { data: user, isLoading } = useQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    // eslint-disable-next-line @typescript-eslint/unbound-method
    queryFn: UsersService.readUserMe,
    enabled: isLoggedIn,
  })

  return {
    user,
    isLoading,
    error,
    resetError: () => setError(null),
  }
}

export default useAuth
