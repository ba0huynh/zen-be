import { Gender } from "../../database/database.type"
import escapeHtml from "../../utils/escape-html"

type Row = { label: string, value: string }
type Layout = {
    preheader: string
    heading: string
    intro: string
    rows: Row[]
    accent?: string
    cta?: { label: string, url: string, fallback: string }
}

type MassageLine = { name: string, duration: number, quantity: number }
type Place = { address: string, room: string | null, tower: string | null }

type KTVBooking = Place & {
    acceptUrl: string
    startTime: string
    note: string | null
    gender: Gender | null
    massages: MassageLine[]
    totalPrice: number
}

type NoKTV = Place & {
    bookingId: string
    startTime: string
    massages: MassageLine[]
    totalPrice: number
}

const MUTED = "#6d7a72"
const BORDER = "#e2e7e3"
const GREEN = "#2f7a5a"
const AMBER = "#a8641f"

function formatPlace({ address, room, tower }: Place, labels: { room: string, tower: string }) {
    return [room && `${labels.room} ${room}`, tower && `${labels.tower} ${tower}`, address].filter(Boolean).join(", ")
}

function formatServices(massages: MassageLine[], unit: string) {
    return massages.map((m) => `${m.name} — ${m.duration} ${unit} × ${m.quantity}`).join("\n")
}

function formatPrice(totalPrice: number) {
    return `${totalPrice.toLocaleString("vi-VN")} ₫`
}

function layout({ preheader, heading, intro, rows, cta, accent = GREEN }: Layout) {
    const cells = rows.map(({ label, value }) => `<tr>
      <td style="padding:11px 0;border-bottom:1px solid ${BORDER};color:${MUTED};font-size:14px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:11px 0 11px 16px;border-bottom:1px solid ${BORDER};font-size:14px;font-weight:600;text-align:right;vertical-align:top;">${escapeHtml(value)}</td>
    </tr>`).join("")

    const button = cta ? `
  <tr><td align="center" style="padding:26px 28px 6px;">
    <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${accent};color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:14px 34px;border-radius:10px;">${escapeHtml(cta.label)}</a>
  </td></tr>
  <tr><td align="center" style="padding:14px 28px 28px;">
    <p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};word-break:break-all;">${escapeHtml(cta.fallback)}<br /><a href="${escapeHtml(cta.url)}" style="color:${accent};">${escapeHtml(cta.url)}</a></p>
  </td></tr>` : `
  <tr><td style="padding:28px;"></td></tr>`

    return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f4;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1b241f;">
  <tr><td style="padding:28px 28px 0;">
    <p style="margin:0 0 18px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${MUTED};">Zen Massage</p>
    <h1 style="margin:0 0 8px;font-size:21px;font-weight:650;">${escapeHtml(heading)}</h1>
    <p style="margin:0;font-size:15px;line-height:1.55;color:${MUTED};">${escapeHtml(intro)}</p>
  </td></tr>
  <tr><td style="padding:22px 28px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${BORDER};">${cells}</table>
  </td></tr>${button}
</table>
</td></tr></table>
</body>
</html>`
}

function plain(heading: string, rows: Row[], tail: string) {
    const body = rows.map(({ label, value }) => `${label}: ${value.replace(/\n/g, "; ")}`).join("\n")
    return `${heading}\n\n${body}\n\n${tail}`
}

function ktvBooking({ acceptUrl, startTime, note, gender, massages, totalPrice, ...place }: KTVBooking) {
    const location = formatPlace(place, { room: "Phòng", tower: "Tòa" })
    const services = formatServices(massages, "phút")
    const heading = "Có booking mới"
    const rows: Row[] = [
        { label: "Thời gian", value: startTime },
        { label: "Địa điểm", value: location },
        { label: "Dịch vụ", value: services },
        { label: "KTV yêu cầu", value: gender === "female" ? "Nữ" : gender === "male" ? "Nam" : "Không yêu cầu" },
        { label: "Tổng tiền", value: formatPrice(totalPrice) },
    ]
    if (note) rows.push({ label: "Ghi chú", value: note })

    return {
        subject: `Booking mới — ${startTime}`,
        html: layout({
            preheader: `Booking ${startTime} — ${location}`,
            heading,
            intro: "Booking này đang chờ kỹ thuật viên. Nhấn nút bên dưới để nhận — ai xác nhận trước sẽ được nhận booking.",
            rows,
            cta: { label: "Nhận booking này", url: acceptUrl, fallback: "Nút không hoạt động? Mở liên kết:" },
        }),
        text: plain(heading, rows, `Nhận booking này: ${acceptUrl}`),
    }
}

function noKTV({ bookingId, startTime, massages, totalPrice, ...place }: NoKTV) {
    const location = formatPlace(place, { room: "Room", tower: "Tower" })
    const heading = "We couldn't confirm your booking"
    const rows: Row[] = [
        { label: "Requested time", value: startTime },
        { label: "Location", value: location },
        { label: "Services", value: formatServices(massages, "mins") },
        { label: "Total", value: formatPrice(totalPrice) },
        { label: "Reference", value: bookingId },
    ]

    return {
        subject: `We couldn't confirm your booking — ${startTime}`,
        html: layout({
            preheader: `No therapist was available for ${startTime}`,
            heading,
            intro: "We're sorry — no therapist was available for the time you requested, so this booking has not been confirmed. You have not been charged. Reply to this email and we'll help you find another slot.",
            rows,
            accent: AMBER,
        }),
        text: plain(heading, rows, "We're sorry — no therapist was available for the time you requested. You have not been charged. Reply to this email and we'll help you find another slot."),
    }
}

type BookingConfirmation = Place & {
    cancelUrl: string
    name: string
    startTime: string
    massages: MassageLine[]
    totalPrice: number
}

type BookingCancelled = Place & {
    bookingId: string
    startTime: string
}

function bookingConfirmation({ cancelUrl, name, startTime, massages, totalPrice, ...place }: BookingConfirmation) {
    const location = formatPlace(place, { room: "Room", tower: "Tower" })
    const heading = "We've received your booking"
    const rows: Row[] = [
        { label: "Time", value: startTime },
        { label: "Location", value: location },
        { label: "Services", value: formatServices(massages, "mins") },
        { label: "Total", value: formatPrice(totalPrice) },
        { label: "Payment", value: "Cash on arrival" },
    ]

    return {
        subject: `Booking received — ${startTime}`,
        html: layout({
            preheader: `${startTime} — ${location}`,
            heading,
            intro: `Thanks ${name}! We're finding a therapist for you and will email again as soon as one is confirmed. Need to cancel? Use the link below.`,
            rows,
            accent: MUTED,
            cta: { label: "Cancel this booking", url: cancelUrl, fallback: "Button not working? Open this link:" },
        }),
        text: plain(heading, rows, `Cancel this booking: ${cancelUrl}`),
    }
}

function bookingCancelled({ bookingId, startTime, ...place }: BookingCancelled) {
    const location = formatPlace(place, { room: "Room", tower: "Tower" })
    const heading = "Booking cancelled"
    const rows: Row[] = [
        { label: "Time", value: startTime },
        { label: "Location", value: location },
        { label: "Reference", value: bookingId },
    ]

    return {
        subject: `Booking cancelled — ${startTime}`,
        html: layout({
            preheader: `The customer cancelled the booking on ${startTime}`,
            heading,
            intro: "The customer has cancelled the booking you accepted. You no longer need to travel to this location.",
            rows,
            accent: AMBER,
        }),
        text: plain(heading, rows, "The customer has cancelled the booking you accepted. You no longer need to travel to this location."),
    }
}

const bookingEmail = {
    ktvBooking,
    noKTV,
    bookingConfirmation,
    bookingCancelled,
} as const

export default bookingEmail
