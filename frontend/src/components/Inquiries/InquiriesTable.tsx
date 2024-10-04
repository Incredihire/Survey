import { EditIcon } from "@chakra-ui/icons"
import {
  IconButton,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import type { InquiryPublic } from "../../client/models.ts"
import * as InquiriesService from "../../client/services/inquiriesService.ts"
import { formatISODateToUserTimezone } from "../../utils/date.ts"
import AddOrEditInquiryModal from "./AddOrEditInquiryModal.tsx"
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

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedInquiry, setSelectedInquiry] = useState<
    InquiryPublic | undefined
  >(undefined)

  const handleEditClick = (inquiry: InquiryPublic) => {
    setSelectedInquiry(inquiry)
    onOpen()
  }

  return (
    <>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Text</Th>
              <Th>Created At</Th>
              <Th>Actions</Th>
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
                  <Tr key={inquiry.id} data-testid="inquiry-row">
                    <Td data-testid="inquiry-text">{inquiry.text}</Td>
                    <Td data-testid="inquiry-datetime">
                      {formatISODateToUserTimezone(inquiry.created_at)}
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Edit Inquiry"
                        icon={<EditIcon />}
                        onClick={() => {
                          handleEditClick(inquiry)
                        }}
                      />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3}>No inquiries found</Td>
                </Tr>
              )}
            </Tbody>
          )}
        </Table>
      </TableContainer>
      <AddOrEditInquiryModal
        isOpen={isOpen}
        onClose={onClose}
        mode={selectedInquiry ? "edit" : "add"}
        inquiry={selectedInquiry}
      />
    </>
  )
}

export default InquiriesTable
