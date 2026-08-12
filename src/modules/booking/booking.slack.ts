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
    return `${amount.toLocaleString("en-US")} VND`
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
        `${esc(m.massage.translations[0]?.name ?? "Massage")} — ${m.duration} mins × ${m.quantity} — ${money(m.price * m.quantity)}`)
    const gender = booking.gender === "female" ? "Female" : booking.gender === "male" ? "Male" : "No preference"

    return [
        section(":bust_in_silhouette: Customer", [
            `Name: ${esc(booking.name)}`,
            `Phone: ${esc(booking.phone)}`,
            `Email: ${esc(booking.email)}`,
        ]),
        section(":alarm_clock: When", [
            `Start: ${formatDate.fullEn(booking.startTime)}`,
            `Duration: ${totalDuration} mins`,
        ]),
        section(":round_pushpin: Location", [
            `Address: ${esc(booking.address)}`,
            booking.room && `Room: ${esc(booking.room)}`,
            booking.tower && `Tower: ${esc(booking.tower)}`,
        ]),
        section(":massage: Services", services),
        section(":moneybag: Payment", [
            `Total: ${money(totalPrice)}`,
            "Method: Cash",
        ]),
        section(":male-doctor: Therapist", [
            `Requested: ${gender}`,
            `Status: ${status}`,
        ]),
        booking.note ? section(":memo: Notes", [esc(booking.note)]) : "",
    ].join("")
}

function message(header: string, booking: SlackBooking, status: string) {
    return `${header}\n${LINE}${details(booking, status)}\n\n${LINE}\n_Ref: ${booking.id}_`
}

function created(booking: SlackBooking) {
    return message(":sparkles: *NEW BOOKING*", booking, "Looking for a therapist")
}

function accepted(booking: SlackBooking, therapist: { name: string }) {
    return message(
        `:white_check_mark: *BOOKING ACCEPTED* — ${esc(therapist.name)}`,
        booking,
        `Accepted by ${esc(therapist.name)}`,
    )
}

function noKTV(booking: SlackBooking) {
    return message(
        ":rotating_light: *NO THERAPIST FOUND*",
        booking,
        "Every therapist has been asked, none accepted — needs manual follow-up",
    )
}

function cancelled(booking: SlackBooking) {
    return message(
        ":x: *BOOKING CANCELLED*",
        booking,
        booking.therapist ? `Cancelled — ${esc(booking.therapist.name)} has been notified` : "Cancelled — no therapist was assigned",
    )
}

/** Deliberately short: this fires once per therapist offered, so it stays scannable. */
function ktvAsked(booking: Pick<SlackBooking, "id" | "startTime" | "address">, therapist: { name: string }, asked: number) {
    return `:mailbox_with_mail: *Inviting therapist* — ${esc(therapist.name)} (#${asked})
• When: ${formatDate.fullEn(booking.startTime)}
• Address: ${esc(booking.address)}
• Ref: ${booking.id}`
}

const bookingSlack = {
    created,
    ktvAsked,
    accepted,
    noKTV,
    cancelled,
} as const

export default bookingSlack
