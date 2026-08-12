import { Gender } from "../../database/database.type"
import formatDate from "../../utils/format-date"

type SlackBooking = {
    id: string
    name: string
    phone: string
    email: string
    startTime: string
    address: string
    room: string | null
    tower: string | null
    note: string | null
    gender: Gender | null
    cancelledAt: string | null
    therapist: { name: string, email: string } | null
    massages: {
        price: number
        duration: number
        quantity: number
        massage: { translations: { name: string }[] }
    }[]
}

const LINE = "━━━━━━━━━━━━━━━━━━━━━━━━"

/** Slack requires these three escaped inside message text. */
function esc(value: string) {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function money(amount: number) {
    return `${amount.toLocaleString("vi-VN")} ₫`
}

function section(title: string, lines: (string | false | null | undefined)[]) {
    const body = lines.filter(Boolean) as string[]
    if (!body.length) return ""
    const bullets = body.flatMap((line) => line.split("\n")).filter((line) => line.trim())
    return `\n\n*${title}*\n${bullets.map((line) => `• ${line}`).join("\n")}`
}

function details(booking: SlackBooking, status: string) {
    const totalPrice = booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0)
    const totalDuration = booking.massages.reduce((acc, cur) => acc + cur.duration * cur.quantity, 0)
    const services = booking.massages.map((m) =>
        `${esc(m.massage.translations[0]?.name ?? "Massage")} — ${m.duration} phút × ${m.quantity} — ${money(m.price * m.quantity)}`)
    const gender = booking.gender === "female" ? "Nữ" : booking.gender === "male" ? "Nam" : "Không yêu cầu"

    return [
        section(":bust_in_silhouette: Khách hàng", [
            `Tên: ${esc(booking.name)}`,
            `Điện thoại: ${esc(booking.phone)}`,
            `Email: ${esc(booking.email)}`,
        ]),
        section(":alarm_clock: Thời gian", [
            `Bắt đầu: ${formatDate.full(booking.startTime)}`,
            `Thời lượng: ${totalDuration} phút`,
        ]),
        section(":round_pushpin: Địa điểm", [
            `Địa chỉ: ${esc(booking.address)}`,
            booking.room && `Phòng: ${esc(booking.room)}`,
            booking.tower && `Tòa: ${esc(booking.tower)}`,
        ]),
        section(":massage: Dịch vụ", services),
        section(":moneybag: Thanh toán", [
            `Tổng: ${money(totalPrice)}`,
            "Hình thức: Tiền mặt",
        ]),
        section(":male-doctor: Kỹ thuật viên", [
            `Yêu cầu: ${gender}`,
            `Trạng thái: ${status}`,
        ]),
        booking.note ? section(":memo: Ghi chú", [esc(booking.note)]) : "",
    ].join("")
}

function message(header: string, booking: SlackBooking, status: string) {
    return `${header}\n${LINE}${details(booking, status)}\n\n${LINE}\n_Mã booking: ${booking.id}_`
}

function created(booking: SlackBooking) {
    return message(":sparkles: *BOOKING MỚI*", booking, "Đang tìm KTV")
}

function ktvAsked(booking: SlackBooking, therapist: { name: string }, asked: number) {
    return message(
        `:mailbox_with_mail: *ĐANG MỜI KTV* — ${esc(therapist.name)}`,
        booking,
        `Đã mời ${esc(therapist.name)} (KTV thứ ${asked}), chờ phản hồi`,
    )
}

function accepted(booking: SlackBooking, therapist: { name: string }) {
    return message(
        `:white_check_mark: *BOOKING ĐÃ ĐƯỢC NHẬN* — ${esc(therapist.name)}`,
        booking,
        `Đã nhận bởi ${esc(therapist.name)}`,
    )
}

function noKTV(booking: SlackBooking) {
    return message(
        ":rotating_light: *KHÔNG TÌM ĐƯỢC KTV*",
        booking,
        "Đã hỏi hết KTV, không ai nhận — cần xử lý thủ công",
    )
}

function cancelled(booking: SlackBooking) {
    return message(
        ":x: *BOOKING ĐÃ BỊ HUỶ*",
        booking,
        booking.therapist ? `Đã huỷ — ${esc(booking.therapist.name)} đã được thông báo` : "Đã huỷ — chưa có KTV nhận",
    )
}

const bookingSlack = {
    created,
    ktvAsked,
    accepted,
    noKTV,
    cancelled,
} as const

export default bookingSlack
