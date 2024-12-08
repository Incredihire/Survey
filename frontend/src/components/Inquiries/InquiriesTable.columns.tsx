import {
  type CellContext,
  type ColumnDef,
  type ColumnHelper as ColumnHelperType,
  createColumnHelper,
} from "@tanstack/react-table"
import type { InquiryPublic, SchedulePublic, ThemePublic } from "../../client"
import { formatISODateToUserTimezone } from "../../utils/date"
import AddScheduledInquiry from "../ScheduledInquiries/AddScheduledInquiry"

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
          <AddScheduledInquiry
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
        const now = new Date()

        const rank = schedule?.scheduled_inquiries.indexOf(original.id) ?? -1
        if (rank >= 0) {
          let scheduled_at = new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
          )
          if (schedule?.schedule.startDate) {
            const start_date = new Date(
              `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`,
            )
            if (start_date > scheduled_at) scheduled_at = start_date
          }
          const timesOfDay = schedule?.schedule.timesOfDay[0] ?? "08:00"
          const timesOfDaySplit = timesOfDay.split(":")
          scheduled_at.setHours(
            Number.parseInt(timesOfDaySplit[0]),
            Number.parseInt(timesOfDaySplit[1]),
            0,
            0,
          )
          scheduled_at.setDate(
            scheduled_at.getDate() +
              rank * (schedule?.schedule.daysBetween ?? 1),
          )
          return formatISODateToUserTimezone(scheduled_at.toISOString())
        }
        return (
          <span data-testid={"unscheduled-date-pattern"}>--/--/---- ----</span>
        )
      },
    }),
  ]
}
