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
  type ColumnDef,
  type Table as ReactTableType,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

export type DataTableProps<Data extends object> = {
  data: Data[]
  columns: ColumnDef<Data, string>[]
  onRowClick?: (row: Data) => void
}

export function DataTable<Data extends object>({
  data,
  columns,
  onRowClick,
}: DataTableProps<Data>) {
  const table: ReactTableType<Data> = useReactTable<Data>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
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
        <Tbody>
          {table.getRowModel().rows.map((row) => {
            const { original } = row
            return (
              <Tr key={row.id} onClick={() => onRowClick?.(original)}>
                {row.getVisibleCells().map((cell) => (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            )
          })}
        </Tbody>
      </ChakraTable>
    </TableContainer>
  )
}
