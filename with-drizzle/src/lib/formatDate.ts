import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (date: Date) => dayjs(date).format('DD/MM/YYYY')

export const formatDateTime = (date: Date) =>
  dayjs(date).format('DD/MM/YYYY hh:mm:ss A')

export const timesAgo = (date: Date) => dayjs(date).fromNow()
