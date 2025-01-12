import {
  Table as ChakraTable,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type ColumnDef,
  type Table as ReactTableType,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  type ApiError,
  type InquiryPublic,
  type SchedulePublic,
  ScheduleService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast.ts"
import { handleError } from "../../utils/showToastOnError.ts"

export type ScheduledInquiriesTableProps<InquiryPublic> = {
  data: InquiryPublic[]
  schedule: SchedulePublic
  columns: ColumnDef<InquiryPublic, string>[]
  onRowClick?: (row: InquiryPublic) => void
}

export function ScheduledInquiriesTable<Data extends object>({
  data,
  schedule,
  columns,
  onRowClick,
}: ScheduledInquiriesTableProps<Data>) {
  const table: ReactTableType<Data> = useReactTable<Data>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const reorderMutation = useMutation({
    mutationFn: async (scheduled_inquiries: number[]) => {
      const data = await ScheduleService.updateScheduledInquiries({
        requestBody: scheduled_inquiries,
      })
      queryClient.setQueryData(["schedule"], data)
      await queryClient.invalidateQueries({ queryKey: ["inquiries"] })
      showToast("Success!", "Inquiry schedule reordered", "success")
    },
    onError: (err: ApiError) => {
      handleError(err, showToast)
    },
  })
  const onDragEnd = (result: DropResult /*, provided: ResponderProvided*/) => {
    if (result.destination) {
      const reorderedItems = Array.from(data)
      const [reorderedItem] = reorderedItems.splice(result.source.index, 1)
      reorderedItems.splice(result.destination.index, 0, reorderedItem)
      const scheduled_inquiries = reorderedItems.map(
        (x) => (x.valueOf() as InquiryPublic).id,
      )
      const startIndex =
        schedule.scheduled_inquiries_and_dates.inquiries.indexOf(
          schedule.scheduled_inquiries[0],
        )
      reorderMutation.mutate(
        scheduled_inquiries
          .slice(startIndex)
          .concat(scheduled_inquiries.slice(0, startIndex)),
      )
    }
  }
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <TableContainer>
        <ChakraTable>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Droppable droppableId="scheduled-inquiry-table-body">
            {(provided) => (
              <Tbody ref={provided.innerRef} {...provided.droppableProps}>
                {table.getRowModel().rows.map((row) => {
                  const { original } = row
                  return (
                    <Draggable
                      isDragDisabled={false}
                      key={row.id}
                      draggableId={row.id.toString()}
                      index={row.index}
                    >
                      {(provided) => (
                        <Tr
                          key={row.id}
                          onClick={() => onRowClick?.(original)}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <Td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </Td>
                          ))}
                        </Tr>
                      )}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </Tbody>
            )}
          </Droppable>
        </ChakraTable>
      </TableContainer>
    </DragDropContext>
  )
}
