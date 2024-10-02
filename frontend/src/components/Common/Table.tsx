import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import {
  type Cell,
  type ColumnDef,
  type Header,
  type HeaderGroup,
  type Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

export type DataTableProps<Data extends object> = {
  data: Data[]
  columns: ColumnDef<Data, unknown>[]
  onRowClick?: (row: Data) => void
}

export function DataTable<Data extends object>({
  data,
  columns,
  onRowClick,
}: DataTableProps<Data>) {
  const table = useReactTable<Data>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <TableContainer>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup: HeaderGroup<Data>) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header: Header<Data, unknown>) => {
                return (
                  <Th key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </Th>
                )
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row: Row<Data>) => (
            <Tr key={row.id} onClick={() => onRowClick?.(row.original)}>
              {row.getVisibleCells().map((cell: Cell<Data, unknown>) => {
                return (
                  <Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                )
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
