import { Box, Flex, Spinner } from "@chakra-ui/react"
import { useMemo } from "react"
import type { InquiryPublic } from "../../client/models.ts"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { DataTable } from "../Common/Table.tsx"
import { columns } from "./InquiriesTable.columns.ts"

const InquiriesTable = () => {
  const { data: inquiries, isLoading } = useInquiries()

  // Sort inquiries from Newest to oldest
  const sortedInquiries = useMemo(() => {
    if (!inquiries?.data) return []
    return inquiries.data.sort((a: InquiryPublic, b: InquiryPublic) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [inquiries])

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  return (
    <Box>
      {isLoading ? (
        <Flex align="center" justify="center" height={200}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <DataTable
          data={sortedInquiries}
          columns={columns}
          onRowClick={handleRowClick}
        />
      )}
    </Box>
  )
}

export default InquiriesTable
