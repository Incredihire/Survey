import {
  type CellContext,
  type ColumnDef,
  type ColumnHelper as ColumnHelperType,
  createColumnHelper,
} from "@tanstack/react-table"
import type { InquiryPublic } from "../../client"
import { formatISODateToUserTimezone } from "../../utils/date"
import AddScheduledInquiry from "../ScheduledInquiries/AddScheduledInquiry"

const columnHelper: ColumnHelperType<InquiryPublic> =
  createColumnHelper<InquiryPublic>()

export function columns(
  refetchInquiries: () => Promise<void>,
): ColumnDef<InquiryPublic, string>[] {
  return [
    columnHelper.display({
      header: "Action",
      cell: ({ row }) => (
        <>
          <AddScheduledInquiry
            refetchInquiries={refetchInquiries}
            inquiry={row.original}
          />
        </>
      ),
    }),
    columnHelper.accessor("text", {
      header: "Inquiry",
      cell: (info: CellContext<InquiryPublic, string>) => (
        <span
          className={
            !info.row.original.scheduled_inquiry?.rank ? "inactive-text" : ""
          }
        >
          {info.getValue()}
        </span>
      ),
      enableResizing: true,
    }),
    columnHelper.display({
      header: "Category",
      cell: ({ row: { original } }) => (
        <span
          className={!original.scheduled_inquiry?.rank ? "inactive-text" : ""}
        >
          {original.theme?.name}
        </span>
      ),
    }),
    columnHelper.display({
      header: "Scheduled",
      cell: ({ row: { original } }) => {
        let scheduled_at: Date | null = null
        if (original.scheduled_inquiry?.rank) {
          scheduled_at = new Date()
          scheduled_at.setHours(8, 0, 0, 0)
          scheduled_at.setDate(
            scheduled_at.getDate() + original.scheduled_inquiry.rank,
          )
        }
        return (
          <span>
            {scheduled_at
              ? formatISODateToUserTimezone(scheduled_at.toISOString())
              : "--/--/----  ----"}
          </span>
        )
      },
    }),
  ]
}
