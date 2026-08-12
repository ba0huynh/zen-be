 type DateInput = Date | string | number;

/**
 * Formats a given date into a full Vietnamese date-time string.
 * @example "16:30 18/02/2026"
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
 * @example "16:30"
 */
 function time(dateInput: DateInput): string {
  const date = new Date(dateInput);

  return date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
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

/**
 * Formats a given date into a full Vietnamese weekday + time string.
 * @example "Thứ Tư, 12/08/2026 lúc 05:30"
 */
 function full(dateInput: DateInput): string {
  const date = new Date(dateInput);

  const day = date.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const clock = date.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${day} lúc ${clock}`;
}

/**
 * Formats a given date into an English weekday + time string, still in Vietnam time.
 * @example "Wed, 12 Aug 2026 at 08:30 (GMT+7)"
 */
 function fullEn(dateInput: DateInput): string {
  const date = new Date(dateInput);

  const day = date.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const clock = date.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${day} at ${clock} (GMT+7)`;
}

const formatDate = {
  dateTime,
  full,
  fullEn,
  date,
  time,
  longDate,
} as const

export default formatDate
