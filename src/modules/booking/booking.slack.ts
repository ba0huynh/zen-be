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

/** One compact line: "<icon> *Label* · a · b". Returns [] so empty rows drop out. */
function line(icon: string, label: string, parts: (string | false | null | undefined)[]) {
    const body = parts.filter(Boolean) as string[]
    if (!body.length) return []
    return [`${icon} *${label}* · ${body.join(" · ")}`]
}

/**
 * The same massage is often booked several times at different lengths. Group by name
 * and list the lengths so one long session reads as "Traditional (60m, 90m ×2)"
 * instead of repeating the full name once per row.
 */
function summariseServices(massages: SlackBooking["massages"]) {
    const byName = new Map<string, Map<number, number>>()
    for (const m of massages) {
        const name = esc(m.massage.translations[0]?.name ?? "Massage")
        const lengths = byName.get(name) ?? new Map<number, number>()
        lengths.set(m.duration, (lengths.get(m.duration) ?? 0) + m.quantity)
        byName.set(name, lengths)
    }
    return [...byName]
        .map(([name, lengths]) => {
            const parts = [...lengths].map(([mins, qty]) => qty > 1 ? `${mins}m ×${qty}` : `${mins}m`)
            return `${name} (${parts.join(", ")})`
        })
        .join(" · ")
}

function details(booking: SlackBooking, status: string) {
    const totalPrice = booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0)
    const totalDuration = booking.massages.reduce((acc, cur) => acc + cur.duration * cur.quantity, 0)
    const services = summariseServices(booking.massages)
    const gender = booking.gender === "female" ? "Female" : booking.gender === "male" ? "Male" : "No preference"

    return [
        ...line(":alarm_clock:", "When", [formatDate.fullEn(booking.startTime), `${totalDuration} mins`]),
        ...line(":round_pushpin:", "Where", [
            esc(booking.address),
            booking.room && `Room ${esc(booking.room)}`,
            booking.tower && `Tower ${esc(booking.tower)}`,
        ]),
        ...line(":massage:", "Service", [services]),
        ...line(":moneybag:", "Total", [money(totalPrice), "cash"]),
        ...line(":male-doctor:", "Therapist", [gender, status]),
        ...line(":memo:", "Note", [booking.note && esc(booking.note).replace(/\s*\n\s*/g, " · ")]),
    ].join("\n")
}

/** Customer contact sits at the foot of the message, one channel per line. */
function contact(booking: SlackBooking) {
    return [
        `:bust_in_silhouette: ${esc(booking.name)}`,
        `:telephone_receiver: ${esc(booking.phone)}`,
        `:e-mail: ${esc(booking.email)}`,
    ].join("\n")
}

function message(header: string, booking: SlackBooking, status: string) {
    return `${header}\n${LINE}\n${details(booking, status)}\n${LINE}\n${contact(booking)}\n_Ref: ${booking.id}_`
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
        "All asked, none accepted — needs manual follow-up",
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
