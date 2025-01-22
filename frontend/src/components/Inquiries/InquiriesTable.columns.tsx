import {
  type CellContext,
  type ColumnDef,
  type ColumnHelper as ColumnHelperType,
  createColumnHelper,
} from "@tanstack/react-table"
import type { InquiryPublic, SchedulePublic, ThemePublic } from "../../client"
import { formatISODateToUserTimezone } from "../../utils/date"
import InquiryManagement from "../ScheduledInquiries/InquiryManagement"

const columnHelper: ColumnHelperType<InquiryPublic> =
  createColumnHelper<InquiryPublic>()
export function columns(
  themes: ThemePublic[],
  schedule: SchedulePublic | null | undefined,
): ColumnDef<InquiryPublic, string>[] {
  return [
    columnHelper.display({
      header: "Action",
      cell: ({ row }) => (
        <>
          <InquiryManagement
            schedule={schedule}
            inquiry={row.original}
            themes={themes}
          />
        </>
      ),
    }),
    columnHelper.accessor("text", {
      header: "Inquiry",
      cell: (info: CellContext<InquiryPublic, string>) => {
        const str = info.getValue()
        if (str.length > 70) {
          return `${str.slice(0, 70)}...`
        }
        return str
      },
      enableResizing: true,
    }),
    columnHelper.display({
      header: "Category",
      cell: ({ row: { original } }) => original.theme?.name,
    }),
    columnHelper.display({
      header: "Scheduled",
      cell: ({ row }) => {
        const { original } = row
        if (
          schedule &&
          schedule.scheduled_inquiries_and_dates.inquiries.indexOf(
            original.id,
          ) >= 0
        ) {
          return (
            <span>
              {formatISODateToUserTimezone(
                schedule.scheduled_inquiries_and_dates.dates[
                  schedule.scheduled_inquiries_and_dates.inquiries.indexOf(
                    original.id,
                  )
                ],
              )}
            </span>
          )
        }
        return (
          <span data-testid={"unscheduled-date-pattern"}>--/--/---- ----</span>
        )
      },
    }),
  ]
}
