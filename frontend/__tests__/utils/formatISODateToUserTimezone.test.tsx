// Disabling these ESLint rules for mocking the "dayjs" module
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Disabling to mock return value of "dayjs.tz.guess" function
/* eslint-disable @typescript-eslint/no-unsafe-call */

import {
  DATE_PARSING_ERROR_MESSAGE,
  INVALID_DATE_TYPE_ERROR_MESSAGE,
  ISO_DATE_FORMAT_ERROR_MESSAGE,
  formatISODateToUserTimezone,
} from "../../src/utils/date"
import "@testing-library/jest-dom"
import dayjs from "dayjs"

const timezoneTestData = {
  input: "2024-09-23T12:00:00Z",
  timezones: [
    {
      timezone: "America/New_York", // Eastern Daylight Time (EDT)
      expectedOutput: "09/23/2024 08:00 AM",
    },
    {
      timezone: "America/Chicago", // Central Daylight Time (CDT)
      expectedOutput: "09/23/2024 07:00 AM",
    },
    {
      timezone: "America/Denver", // Mountain Daylight Time (MDT)
      expectedOutput: "09/23/2024 06:00 AM",
    },
    {
      timezone: "America/Los_Angeles", // Pacific Daylight Time (PDT)
      expectedOutput: "09/23/2024 05:00 AM",
    },
    {
      timezone: "America/Anchorage", // Alaska Daylight Time (AKDT)
      expectedOutput: "09/23/2024 04:00 AM",
    },
    {
      timezone: "Pacific/Honolulu", // Hawaii Standard Time (HAST, no DST)
      expectedOutput: "09/23/2024 02:00 AM",
    },
  ],
}

describe("formatISODateToUserTimezone", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return formatted date string relative to different timezones when called with valid ISO date input", () => {
    for (const { timezone, expectedOutput } of timezoneTestData.timezones) {
      jest.spyOn(dayjs.tz, "guess").mockReturnValue(timezone)
      expect(formatISODateToUserTimezone(timezoneTestData.input)).toBe(
        expectedOutput,
      )
    }
  })

  it("should throw INVALID_DATE_TYPE_ERROR_MESSAGE when called with non-string date", () => {
    const input = 12345
    expect(() =>
      formatISODateToUserTimezone(input as unknown as string),
    ).toThrow(INVALID_DATE_TYPE_ERROR_MESSAGE)
  })

  it("should throw ISO_DATE_FORMAT_ERROR_MESSAGE when called with invalid ISO date string", () => {
    const input = "12345"
    expect(() => formatISODateToUserTimezone(input)).toThrow(
      ISO_DATE_FORMAT_ERROR_MESSAGE,
    )
  })

  it("should throw ISO_DATE_FORMAT_ERROR_MESSAGE when called with an empty string", () => {
    const input = ""
    expect(() => formatISODateToUserTimezone(input)).toThrow(
      ISO_DATE_FORMAT_ERROR_MESSAGE,
    )
  })

  it("should throw DATE_PARSING_ERROR_MESSAGE when date can't be parsed", () => {
    const input = "2024-09-23T12:00:00Z"
    jest.spyOn(dayjs.prototype, "isValid").mockReturnValue(false)
    expect(() => formatISODateToUserTimezone(input)).toThrow(
      DATE_PARSING_ERROR_MESSAGE,
    )
  })
})
