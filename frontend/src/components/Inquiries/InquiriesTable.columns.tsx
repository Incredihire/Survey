import {
  type CellContext,
  type ColumnDef,
  type ColumnHelper as ColumnHelperType,
  createColumnHelper,
} from "@tanstack/react-table"
import { parseDate } from "tough-cookie"
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
      cell: (info: CellContext<InquiryPublic, string>) => (
        <span
          className={
            (schedule?.scheduled_inquiries.indexOf(info.row.original.id) ??
              -1) >= 0
              ? ""
              : "inactive-text"
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
          className={
            (schedule?.scheduled_inquiries.indexOf(original.id) ?? -1) >= 0
              ? ""
              : "inactive-text"
          }
        >
          {original.theme?.name}
        </span>
      ),
    }),
    columnHelper.display({
      header: "Scheduled",
      cell: ({ row }) => {
        const { original } = row
        let scheduled_at: Date | null = null
        const rank =
          (schedule?.scheduled_inquiries?.indexOf(original.id) ?? -1) + 1
        if (rank) {
          scheduled_at = parseDate(
            `${schedule?.schedule.startDate}·${schedule?.schedule.timesOfDay[0]}:${schedule?.schedule.timesOfDay[1]}·${schedule?.schedule.timesOfDay[2]}`,
          )
          if (!scheduled_at) {
            scheduled_at = new Date()
            scheduled_at.setHours(8, 0, 0, 0)
          }
          scheduled_at.setDate(
            scheduled_at.getDate() +
              rank * (schedule?.schedule.daysBetween ?? 1),
          )
        }
        return (
          <span
            className={
              (schedule?.scheduled_inquiries.indexOf(original.id) ?? -1) >= 0
                ? ""
                : "inactive-text"
            }
          >
            {scheduled_at
              ? formatISODateToUserTimezone(scheduled_at.toISOString())
              : "--/--/----  ----"}
          </span>
        )
      },
    }),
  ]
}
