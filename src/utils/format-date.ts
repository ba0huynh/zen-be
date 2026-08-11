 type DateInput = Date | string | number;

/**
 * Formats a given date into a full Vietnamese date-time string.
 * @example "18/02/2026, 16:30:00"
 */
 function dateTime(dateInput: DateInput): string {
  const date = new Date(dateInput);

  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a given date into a Vietnamese date-only string.
 * @example "18/02/2026"
 */
 function date(dateInput: DateInput): string {
  const date = new Date(dateInput);

  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Formats a given date into a Vietnamese time-only string (24-hour format).
 * @example "16:30:00"
 */
 function time(dateInput: DateInput): string {
  const date = new Date(dateInput);

  return date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a given date into a long-form Vietnamese readable date.
 * @example "Thứ Năm, ngày 6 tháng 8 năm 2026"
 */
 function longDate(dateInput: DateInput): string {
  const date = new Date(dateInput);

  return date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const formatDate = {
  dateTime,
  date,
  time,
  longDate,
} as const

export default formatDate