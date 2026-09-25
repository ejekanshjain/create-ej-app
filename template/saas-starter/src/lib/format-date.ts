export type DateFormatOptions = {
  /** Abbreviated month ("Jan") instead of the full name. */
  short?: boolean
  /** Append the time of day. */
  time?: boolean
  /** Drop the year. */
  noYear?: boolean
  /** Render in this IANA zone instead of the viewer's. */
  timeZone?: string
}

function asValidDate(
  date: Date | string | number | null | undefined
): Date | null {
  if (date == null) return null
  const instant = new Date(date)
  return Number.isFinite(instant.getTime()) ? instant : null
}

/**
 * Date and time are formatted separately and joined with a fixed " at ",
 * because the connector ICU inserts between them changed across versions
 * (", " in ICU 72 and later). Bun, Node, and each browser ship different ICU
 * data, so one `toLocaleString` call renders differently per viewer and
 * breaks hydration.
 */
function joinDateAndTime(
  instant: Date,
  dateOptions: Intl.DateTimeFormatOptions,
  timeOptions: Intl.DateTimeFormatOptions,
  timeZone: string | undefined
): string {
  const zone = timeZone ? { timeZone } : {}
  const datePart = instant.toLocaleDateString('en-US', {
    ...dateOptions,
    ...zone
  })
  const timePart = instant.toLocaleTimeString('en-US', {
    ...timeOptions,
    ...zone
  })
  return `${datePart} at ${timePart}`
}

/**
 * Formats a date as an `en-US` string, such as "March 3, 2026".
 * Returns `-` for a missing or invalid date.
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  options?: DateFormatOptions
): string => {
  const instant = asValidDate(date)
  if (!instant) return '-'

  const dateOptions: Intl.DateTimeFormatOptions = {
    ...(options?.noYear ? {} : { year: 'numeric' }),
    month: options?.short ? 'short' : 'long',
    day: 'numeric'
  }

  if (!options?.time) {
    return instant.toLocaleDateString('en-US', {
      ...dateOptions,
      ...(options?.timeZone ? { timeZone: options.timeZone } : {})
    })
  }

  return joinDateAndTime(
    instant,
    dateOptions,
    { hour: '2-digit', minute: '2-digit' },
    options.timeZone
  )
}
