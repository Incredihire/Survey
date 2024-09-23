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
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import * as InquiriesService from "../../client/services/inquiriesService.ts"

// Dayjs Configurations
// eslint-disable-next-line
dayjs.extend(utc)
// eslint-disable-next-line
dayjs.extend(timezone)
// eslint-disable-next-line
const userTimezone = dayjs.tz.guess()

function getInquiriesQueryOptions() {
  return {
    queryKey: ["inquiries"],
    queryFn: () => InquiriesService.readInquiries(),
  }
}

// Format ISO date to the user's timezone.
// ex. Sep 17, 2024 14:13 PM
function formatDate(date: string): string {
  const invalidDateMessage = "Invalid Date"
  if (typeof date !== "string") return invalidDateMessage
  const parsedDate = dayjs.utc(date)
  return parsedDate.isValid()
    ? parsedDate.tz(userTimezone).format("MMM DD, YYYY hh:mm A")
    : invalidDateMessage
}

const InquiriesTable = () => {
  const { data: inquiries, isPending } = useQuery({
    ...getInquiriesQueryOptions(),
  })

  // Sort inquries from Newest to oldest
  const sortedInquiries = inquiries?.data.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <>
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
              {sortedInquiries?.map((inquiry) => (
                <Tr
                  key={inquiry.id}
                  onClick={() => {
                    console.log(inquiry)
                  }}
                >
                  <Td data-testid="inquiry-text">{inquiry.text}</Td>
                  <Td data-testid="inquiry-datetime">
                    {formatDate(inquiry.created_at)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </>
  )
}

export default InquiriesTable
