import { eq } from "drizzle-orm"
import db from "../../database/drizzle"
import { bookings } from "../../database/entities/booking.entity"
import { bookingMassages } from "../../database/entities/booking_massage.entity"
import resend from "../../utils/resend"
import bookingQueue from "./booking.queue"
import { BookingValidatorType } from "./booking.validator"
import Slack from "../../utils/slack"

async function makeBooking({ massages: massagesPayload, ...bookingPayload }: BookingValidatorType['makeBooking']) {
    const [booking] = await db.insert(bookings).values(bookingPayload).returning()
    await db.insert(bookingMassages).values(massagesPayload.map((massage) => ({ ...massage, bookingId: booking.id })))
    bookingQueue.findKTV(booking.id)
}

async function sendKTVBookingEmail(email: string, bookingId: string) {
    const booking = await db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId) })
    if (!booking) return
    await resend.emails.send({
        from: "zen@jobfling.com",
        to: email,
        subject: "New Booking",
        html: "There is a new booking for you.",
    })
}
async function sendNoKTVEmail(bookingId: string) {
    const booking = await db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId) })
    if (!booking) return
    const { email } = booking
    await resend.emails.send({
        from: "zen@jobfling.com",
        to: email,
        subject: "No KTV",
        html: "<p>Sorry, we couldn't find a KTV for you booking.</p>",
    })
}

async function acceptBooking(email: string, bookingId: string) {
    const [booking, ktv] = await Promise.all([
        db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId), with: { therapist: true } }),
        db.query.therapists.findFirst({ where: (t, { eq }) => eq(t.email, email) })
    ])
    if (!ktv) return "KTV không tồn tại"
    if (!booking) return "Booking không tồn tại"
    if (booking.therapist) return `Booking đã có KTV khác chấp nhận (${booking.therapist.name})`
    await db.update(bookings).set({ therapistEmail: email }).where(eq(bookings.id, bookingId))
    await Slack.sendMessage(`Booking ${booking.startTime} đã được chấp nhận bởi ${ktv.name}`)
    return "Booking đã được chấp nhận thành công"
}

const BookingService = {
    makeBooking, sendKTVBookingEmail,
    sendNoKTVEmail,
    acceptBooking,
} as const
export default BookingService

