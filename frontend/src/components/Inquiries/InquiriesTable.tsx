import {useQuery} from "@tanstack/react-query";
import {SkeletonText, Table, TableContainer, Tbody, Td, Th, Thead, Tr} from "@chakra-ui/react";
import * as InquiriesService from "../../client/services/inquiriesService.ts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Dayjs Configurations
// eslint-disable-next-line
dayjs.extend(utc);
// eslint-disable-next-line
dayjs.extend(timezone);
// eslint-disable-next-line
const userTimezone = dayjs.tz.guess();

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

export default InquiriesTable;