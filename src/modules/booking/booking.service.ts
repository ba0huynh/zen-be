import { and, count, eq, isNotNull, isNull } from "drizzle-orm"
import db from "../../database/drizzle"
import { bookings } from "../../database/entities/booking.entity"
import { bookingMassages } from "../../database/entities/booking_massage.entity"
import resend from "../../utils/resend"
import bookingQueue from "./booking.queue"
import { BookingValidatorType } from "./booking.validator"
import Slack from "../../utils/slack"
import formatDate from "../../utils/format-date"
import bookingEmail from "./booking.email"
import env from "../../../env"
import appToken from "../../utils/token"
import bookingSlack from "./booking.slack"

async function makeBooking({ massages: massagesPayload, ...bookingPayload }: BookingValidatorType['makeBooking']) {
    console.log('bookingPayload',bookingPayload)
    const [booking] = await db.insert(bookings).values(bookingPayload).returning()
    await db.insert(bookingMassages).values(massagesPayload.map((massage) => ({ ...massage, bookingId: booking.id })))
    bookingQueue.findKTV(booking.id)
    await sendBookingConfirmationEmail(booking.id)
    await notifyBookingCreated(booking.id)
}

async function sendKTVBookingEmail(email: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { massages: { with: MASSAGES_WITH } },
    })
    if (!booking) return

    const acceptUrl = `${env.app.url}/bookings/accept?email=${encodeURIComponent(email)}&id=${encodeURIComponent(bookingId)}`
    const { subject, html, text } = bookingEmail.ktvBooking({
        acceptUrl,
        startTime: formatDate.full(booking.startTime),
        address: booking.address,
        room: booking.room,
        tower: booking.tower,
        note: booking.note,
        gender: booking.gender,
        massages: booking.massages.map(({ massage, duration, quantity }) => ({
            name: massage.translations[0]?.name ?? "Massage",
            duration,
            quantity,
        })),
        totalPrice: booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
    })

    await resend.emails.send({ from: "zen@jobfling.com", to: email, subject, html, text })
}

async function sendNoKTVEmail(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { massages: { with: MASSAGES_WITH } },
    })
    if (!booking) return

    const { subject, html, text } = bookingEmail.noKTV({
        bookingId: booking.id,
        startTime: formatDate.fullEn(booking.startTime),
        address: booking.address,
        room: booking.room,
        tower: booking.tower,
        massages: booking.massages.map(({ massage, duration, quantity }) => ({
            name: massage.translations[0]?.name ?? "Massage",
            duration,
            quantity,
        })),
        totalPrice: booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
    })

    await resend.emails.send({ from: "zen@jobfling.com", to: booking.email, subject, html, text })
}

async function acceptBooking(email: string, bookingId: string) {
    const [booking, ktv] = await Promise.all([
        db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId), with: { therapist: true } }),
        db.query.therapists.findFirst({ where: (t, { eq }) => eq(t.email, email) })
    ])
    if (!ktv) return { ok: false, title: "Therapist not found", message: `${email} is not registered as a therapist.` }
    if (!booking) return { ok: false, title: "Booking not found", message: "This booking does not exist or has been cancelled." }
    if (booking.therapist) return { ok: false, title: "Already taken", message: `${booking.therapist.name} accepted this booking first.` }
    await db.update(bookings).set({ therapistEmail: email }).where(eq(bookings.id, bookingId))
    const accepted = await loadForSlack(bookingId)
    if (accepted) await Slack.sendMessage(bookingSlack.accepted(accepted, ktv))
    return {
        ok: true,
        title: "Booking accepted",
        message: `Thanks ${ktv.name}! This booking is now yours.`,
        details: [
            { label: "Customer", value: booking.name },
            { label: "Time", value: formatDate.fullEn(booking.startTime) },
            { label: "Address", value: booking.address },
            { label: "Reference", value: booking.id },
        ],
    }
}


const MASSAGES_WITH = {
    massage: {
        with: {
            translations: {
                where: (t: any, { eq }: any) => eq(t.languageCode, "en")
            }
        }
    }
} as const

function serialize<T extends { massages: any[], therapistEmail: string | null, cancelledAt: string | null }>({ massages, ...booking }: T) {
    return {
        ...booking,
        status: booking.cancelledAt ? "cancelled" : booking.therapistEmail ? "assigned" : "pending",
        totalPrice: massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
        massages: massages.map(({ massage, ...bookingMassage }) => ({
            id: bookingMassage.id,
            massageId: bookingMassage.massageId,
            name: massage.translations[0]?.name ?? null,
            image: massage.image,
            price: bookingMassage.price,
            duration: bookingMassage.duration,
            quantity: bookingMassage.quantity,
        })),
    }
}

async function getBookings({ page, limit, status }: BookingValidatorType['getBookings']) {
    const filter = status === "cancelled" ? isNotNull(bookings.cancelledAt)
        : status === "assigned" ? and(isNull(bookings.cancelledAt), isNotNull(bookings.therapistEmail))
            : status === "pending" ? and(isNull(bookings.cancelledAt), isNull(bookings.therapistEmail))
                : undefined

    const [rows, [totals]] = await Promise.all([
        db.query.bookings.findMany({
            where: filter,
            orderBy: (b, { desc }) => desc(b.startTime),
            limit,
            offset: (page - 1) * limit,
            with: { therapist: true, massages: { with: MASSAGES_WITH } },
        }),
        db.select({ value: count() }).from(bookings).where(filter),
    ])

    const total = totals?.value ?? 0
    return { data: rows.map(serialize), page, limit, total, totalPages: Math.ceil(total / limit) }
}

async function getBooking(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: {
            therapist: true,
            massages: { with: MASSAGES_WITH },
            logs: { with: { therapist: true }, orderBy: (l, { asc }) => asc(l.therapistEmail) },
        },
    })
    if (!booking) return null
    const { logs, ...rest } = booking
    return {
        ...serialize(rest),
        logs: logs.map(({ therapist }) => ({
            email: therapist.email,
            name: therapist.name,
            accepted: therapist.email === booking.therapistEmail,
        })),
    }
}

function cancelUrlFor(bookingId: string) {
    return `${env.app.url}/bookings/cancel?id=${encodeURIComponent(bookingId)}&token=${appToken.sign(bookingId)}`
}

async function sendBookingConfirmationEmail(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { massages: { with: MASSAGES_WITH } },
    })
    if (!booking) return

    const { subject, html, text } = bookingEmail.bookingConfirmation({
        cancelUrl: cancelUrlFor(booking.id),
        name: booking.name,
        startTime: formatDate.fullEn(booking.startTime),
        address: booking.address,
        room: booking.room,
        tower: booking.tower,
        massages: booking.massages.map(({ massage, duration, quantity }) => ({
            name: massage.translations[0]?.name ?? "Massage",
            duration,
            quantity,
        })),
        totalPrice: booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
    })

    await resend.emails.send({ from: "zen@jobfling.com", to: booking.email, subject, html, text })
}

async function sendCancelledKTVEmail(email: string, booking: { id: string, startTime: string, address: string, room: string | null, tower: string | null }) {
    const { subject, html, text } = bookingEmail.bookingCancelled({
        bookingId: booking.id,
        startTime: formatDate.fullEn(booking.startTime),
        address: booking.address,
        room: booking.room,
        tower: booking.tower,
    })
    await resend.emails.send({ from: "zen@jobfling.com", to: email, subject, html, text })
}

async function findCancellable(bookingId: string, token: string) {
    if (!appToken.verify(bookingId, token)) {
        return { error: { ok: false, title: "Invalid link", message: "This cancellation link is not valid. Please use the link from your confirmation email." } } as const
    }
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { therapist: true, massages: { with: MASSAGES_WITH } },
    })
    if (!booking) {
        return { error: { ok: false, title: "Booking not found", message: "This booking no longer exists." } } as const
    }
    if (booking.cancelledAt) {
        return { error: { ok: false, title: "Already cancelled", message: `This booking was already cancelled on ${formatDate.fullEn(booking.cancelledAt)}.` } } as const
    }
    return { booking } as const
}

function cancelDetails(booking: { startTime: string, address: string, room: string | null, tower: string | null, massages: { price: number, quantity: number }[] }) {
    const place = [booking.room && `Room ${booking.room}`, booking.tower && `Tower ${booking.tower}`, booking.address].filter(Boolean).join(", ")
    return [
        { label: "Time", value: formatDate.fullEn(booking.startTime) },
        { label: "Location", value: place },
        { label: "Total", value: `${booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0).toLocaleString("vi-VN")} ₫` },
    ]
}

async function previewCancelBooking(bookingId: string, token: string) {
    const { error, booking } = await findCancellable(bookingId, token)
    if (error) return error
    return {
        ok: true,
        title: "Cancel this booking?",
        message: "This cannot be undone. You'll need to make a new booking if you change your mind.",
        details: cancelDetails(booking),
    }
}

async function cancelBooking(bookingId: string, token: string) {
    const { error, booking } = await findCancellable(bookingId, token)
    if (error) return error

    const [cancelled] = await db.update(bookings)
        .set({ cancelledAt: new Date().toISOString() })
        .where(and(eq(bookings.id, bookingId), isNull(bookings.cancelledAt)))
        .returning()
    if (!cancelled) {
        return { ok: false, title: "Already cancelled", message: "This booking was already cancelled." }
    }

    if (booking.therapistEmail) await sendCancelledKTVEmail(booking.therapistEmail, booking)
    await Slack.sendMessage(bookingSlack.cancelled({ ...booking, cancelledAt: cancelled.cancelledAt }))

    return {
        ok: true,
        title: "Booking cancelled",
        message: "Your booking has been cancelled. Sorry to see you go — you're welcome back any time.",
        details: cancelDetails(booking),
    }
}

function loadForSlack(bookingId: string) {
    return db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { therapist: true, massages: { with: MASSAGES_WITH } },
    })
}

async function notifyBookingCreated(bookingId: string) {
    const booking = await loadForSlack(bookingId)
    if (!booking) return
    await Slack.sendMessage(bookingSlack.created(booking))
}

async function notifyKTVAsked(bookingId: string, therapist: { name: string }, asked: number) {
    const booking = await loadForSlack(bookingId)
    if (!booking) return
    await Slack.sendMessage(bookingSlack.ktvAsked(booking, therapist, asked))
}

async function notifyNoKTV(bookingId: string) {
    const booking = await loadForSlack(bookingId)
    if (!booking) return
    await Slack.sendMessage(bookingSlack.noKTV(booking))
}

const BookingService = {
    makeBooking, sendKTVBookingEmail,
    sendNoKTVEmail,
    acceptBooking,
    getBookings,
    getBooking,
    sendBookingConfirmationEmail,
    previewCancelBooking,
    cancelBooking,
    notifyKTVAsked,
    notifyNoKTV,
} as const
export default BookingService

