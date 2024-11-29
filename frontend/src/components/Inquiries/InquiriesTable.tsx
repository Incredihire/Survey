import { Box, Flex, Spinner } from "@chakra-ui/react"
import { useMemo } from "react"
import type { InquiryPublic } from "../../client/models.ts"
import { useInquiries } from "../../hooks/useInquiries.ts"
import { DataTable } from "../Common/Table.tsx"
import { columns } from "./InquiriesTable.columns.tsx"

const InquiriesTable = () => {
  const { data: inquiries, isLoading, refetch } = useInquiries()

  // Sort inquiries from Newest to oldest
  const sortedInquiries = useMemo(() => {
    if (!inquiries?.data) return []
    return inquiries.data.sort((a: InquiryPublic, b: InquiryPublic) => {
      return (
        (a.scheduled_inquiry ? a.scheduled_inquiry.rank : -1) -
        (b.scheduled_inquiry ? b.scheduled_inquiry.rank : -1)
      )
    })
  }, [inquiries])

  const handleRowClick = (inquiry: InquiryPublic) => {
    console.log("Row clicked:", inquiry)
  }

  const refetchInquiries = async () => {
    await refetch()
    // const target = inquiries?.data?.find(i => i.id == inquiry.id)
    // if(target) {
    //   target.rank = inquiry.rank
    //   target.theme_id = inquiry.theme_id
    // }
  }

  return (
    <Box>
      {isLoading ? (
        <Flex align="center" justify="center" height={200}>
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <DataTable
            data={sortedInquiries}
            columns={columns(refetchInquiries)}
            onRowClick={handleRowClick}
          />
        </>
      )}
    </Box>
  )
}

export default InquiriesTable
