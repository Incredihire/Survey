import { Box, Flex, Spinner } from "@chakra-ui/react"
import type { ThemePublic } from "../../client/models.js"
import { useThemes } from "../../hooks/useThemes.js"
import { DataTable } from "../Common/Table.js"
import { themesColumns } from "./ThemesTable.columns.js"

const ThemesTable = () => {
  const { data: themes, isLoading } = useThemes()

  const handleRowClick = (theme: ThemePublic) => {
    console.log("Row clicked:", theme)
  }

  return (
    <Box>
      {isLoading ? (
        <Flex align="center" justify="center" height={200}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <DataTable
          data={themes?.data ?? []}
          columns={themesColumns}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  )
}

export default ThemesTable
