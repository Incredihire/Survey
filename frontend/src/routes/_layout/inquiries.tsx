import {
  Container,
  Heading,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

import * as InquiriesService from "../../client/services/inquiriesService";
import Navbar from "../../components/Common/Navbar";
import AddInquiry from "../../components/Inquiries/AddInquiry";

// Dayjs Configurations
// eslint-disable-next-line
dayjs.extend(utc);
// eslint-disable-next-line
dayjs.extend(timezone);
// eslint-disable-next-line
const userTimezone = dayjs.tz.guess();

// Already typed by zod library https://zod.dev/
// eslint-disable-next-line
const inquiriesSearchSchema = z.object({
  // eslint-disable-next-line
  page: z.number().catch(1),
});

// createFileRoute is already typed by tanstack-router: https://tanstack.com/router/latest/docs/framework/react/guide/type-safety
// eslint-disable-next-line
export const Route = createFileRoute("/_layout/inquiries")({
  component: Inquiries,
  // eslint-disable-next-line
  validateSearch: (search) => inquiriesSearchSchema.parse(search),
});

function getInquiriesQueryOptions() {
  return {
    queryKey: ["inquiries"],
    queryFn: () => InquiriesService.readInquiries(),
  };
}

// Format date to user's timezone
// ex. Sep 17, 2024 14:13 PM
function formatDate(date: Date): string {
  try {
    // eslint-disable-next-line
    return dayjs.utc(date).tz(userTimezone).format("MMM DD, YYYY hh:mm A");
  } catch (error) {
    console.error("Error formatting date:", error);
    return new Date(date).toISOString();
  }
}

function InquiriesTable() {
  const { data: inquiries, isPending } = useQuery({
    ...getInquiriesQueryOptions(),
  });

  // Sort inquries from Newest to oldest
  const sortedInquiries = inquiries?.data.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

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
                    console.log(inquiry);
                  }}
                >
                  <Td>{inquiry.text}</Td>
                  <Td>{formatDate(inquiry.created_at)}</Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </>
  );
}

function Inquiries() {
  return (
    <Container maxW="full">
      <Heading size="lg" textAlign={{ base: "center", md: "left" }} pt={12}>
        Inquiries Management
      </Heading>

      <Navbar type={"Inquiry"} addModalAs={AddInquiry} />
      <InquiriesTable />
    </Container>
  );
}