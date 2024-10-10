import { type ColumnDef, createColumnHelper } from "@tanstack/react-table"
import type { ThemePublic } from "../../client"

const columnHelper = createColumnHelper<ThemePublic>()

export const themesColumns: ColumnDef<ThemePublic, string>[] = [
  columnHelper.accessor("name", {
    header: "Text",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("description", {
    header: "Description",
    cell: (info) => info.getValue(),
  }),
]
