import {
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import * as InquiriesService from "../../client/services/inquiriesService.ts"
import { formatISODateToUserTimezone } from "../../utils/date.ts"

const InquiriesTable = () => {
  function getInquiriesQueryOptions() {
    return {
      queryKey: ["inquiries"],
      queryFn: () => InquiriesService.readInquiries(),
    }
  }

  const { data: inquiries, isPending } = useQuery({
    ...getInquiriesQueryOptions(),
  })

  // Sort inquiries from Newest to oldest
  const sortedInquiries = useMemo(() => {
    if (!inquiries?.data) return []
    return inquiries.data.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [inquiries])

  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>Text</Th>
            <Th>Created At</Th>
          </Tr>
        </Thead>
        {isPending ? (
          <Tbody>
            <Tr>
              {new Array(3).fill(null).map((_, index) => (
                <Td key={index}>
                  <SkeletonText noOfLines={1} />
                </Td>
              ))}
            </Tr>
          </Tbody>
        ) : (
          <Tbody>
            {sortedInquiries.length > 0 ? (
              sortedInquiries.map((inquiry) => (
                <Tr
                  key={inquiry.id}
                  onClick={() => {
                    console.log(inquiry)
                  }}
                  data-testid="inquiry-row"
                >
                  <Td data-testid="inquiry-text">{inquiry.text}</Td>
                  <Td data-testid="inquiry-datetime">
                    {formatISODateToUserTimezone(inquiry.created_at)}
                  </Td>
                </Tr>
              ))
            ) : (
              <></>
            )}
          </Tbody>
        )}
      </Table>
    </TableContainer>
  )
}

export default InquiriesTable
