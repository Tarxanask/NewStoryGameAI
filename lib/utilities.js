import { ALLOWED_HTML_TAGS } from './constants'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const purifyText = (text) => {
  if (!text) return

  return DOMPurify.sanitize(text, { ALLOWED_TAGS: ALLOWED_HTML_TAGS })
}

export const relativeTimeFromFirstLog = (timestamp, gameLog) => {
  if(!gameLog) return
  const firstLogTimestamp = gameLog[0].timestamp
  const diff = dayjs(timestamp).diff(dayjs(firstLogTimestamp), 'second')
  const minutes = Math.floor(diff / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (diff % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
}
