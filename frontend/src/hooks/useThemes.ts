import { useQuery } from "@tanstack/react-query"
import { ThemesService } from "../client"

function getThemesQueryOptions() {
  return {
    queryKey: ["themes"],
    queryFn: () => ThemesService.getThemes(),
  }
}

export function useThemes() {
  return useQuery({
    ...getThemesQueryOptions(),
  })
}
