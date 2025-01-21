import { useQuery } from "@tanstack/react-query"
import { UsersService } from "../client"

const useAuth = () => {
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: UsersService.readUserMe,
    enabled: true,
  })
  return {
    user,
    isLoading,
  }
}

export default useAuth
