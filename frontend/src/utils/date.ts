import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { isISODateTimeString } from "./validation"

// dayjs plugins
/* eslint-disable */
dayjs.extend(utc)
dayjs.extend(timezone)
/* eslint-enable */

export const INVALID_DATE_TYPE_ERROR_MESSAGE = "Date must be a string"
export const ISO_DATE_FORMAT_ERROR_MESSAGE = "Date must be in ISO 8601 format"
export const DATE_PARSING_ERROR_MESSAGE = "Error parsing the date"

/**
 * Format given date to specified format based relative to user's timezone.
 * Use this function to format the dateTime field retrieved from the database.
 * @param date - The date string to format (expected to be in ISO 8601 date format).
 * @returns Formatted date string
 * @throws Error message if the input is not valid ISO string or date cannot be parsed.
 *
 * Examples:
 *  Input: "2024-09-23T12:00:00"
 *  Output: "Sep 23, 2024 08:00AM" (if user's in America/New_York timezone)
 */
export const formatISODateToUserTimezone = (date: string): string => {
  if (typeof date !== "string") {
    throw new Error(INVALID_DATE_TYPE_ERROR_MESSAGE)
  }

  if (!isISODateTimeString(date)) {
    throw new Error(ISO_DATE_FORMAT_ERROR_MESSAGE)
  }

  // Unsafe access to 'error' typed value is handled by dayjs' isValid function
  /* eslint-disable */
  const parsedDate = dayjs.utc(date)
  if (!parsedDate.isValid()) {
    throw new Error(DATE_PARSING_ERROR_MESSAGE)
  }

  const userTimezone = dayjs.tz.guess()
  return parsedDate.tz(userTimezone).format("MM/DD/YYYY hh:mm A")
  //return parsedDate.format("MM/DD/YYYY hh:mm A")
  /* eslint-enable */
}
