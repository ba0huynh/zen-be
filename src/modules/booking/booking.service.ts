import { eq } from "drizzle-orm"
import db from "../../database/drizzle"
import { bookings } from "../../database/entities/booking.entity"
import { bookingMassages } from "../../database/entities/booking_massage.entity"
import resend from "../../utils/resend"
import bookingQueue from "./booking.queue"
import { BookingValidatorType } from "./booking.validator"
import Slack from "../../utils/slack"
import formatDate from "../../utils/format-date"

async function makeBooking({ massages: massagesPayload, ...bookingPayload }: BookingValidatorType['makeBooking']) {
    console.log('bookingPayload',bookingPayload)
    const [booking] = await db.insert(bookings).values(bookingPayload).returning()
    await db.insert(bookingMassages).values(massagesPayload.map((massage) => ({ ...massage, bookingId: booking.id })))
    bookingQueue.findKTV(booking.id)
    await Slack.sendMessage(await formatBooking(booking.id))
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
    if (!ktv) return { ok: false, title: "Không tìm thấy KTV", message: `Email ${email} chưa được đăng ký làm kỹ thuật viên.` }
    if (!booking) return { ok: false, title: "Không tìm thấy booking", message: "Booking này không tồn tại hoặc đã bị huỷ." }
    if (booking.therapist) return { ok: false, title: "Booking đã có người nhận", message: `Booking này đã được ${booking.therapist.name} chấp nhận trước đó.` }
    await db.update(bookings).set({ therapistEmail: email }).where(eq(bookings.id, bookingId))
    await Slack.sendMessage(`Booking ${formatDate.dateTime(booking.startTime)} đã được chấp nhận bởi ${ktv.name}`)
    return {
        ok: true,
        title: "Đã nhận booking",
        message: `Cảm ơn ${ktv.name}! Bạn đã nhận booking này.`,
        details: [
            { label: "Khách hàng", value: booking.name },
            { label: "Thời gian", value: formatDate.dateTime(booking.startTime) },
            { label: "Địa chỉ", value: booking.address },
            { label: "Mã booking", value: booking.id },
        ],
    }
}


async function formatBooking(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: {
            massages: {
                with: {
                    massage: {
                        with: {
                            translations: {
                                where: (t, { eq }) => eq(t.languageCode, "en")
                            }
                        }
                    }
                }
            }
        }
    })
    if (!booking) return "Booking không tồn tại"
    const massages = booking.massages.map((massage) => ({ ...massage, price: Number(massage.price) }))
    const price = massages.reduce((acc, cur) => acc + cur.quantity * cur.price, 0)

    const names = massages.map((massage) => {
        const {duration,massage:detail,quantity} = massage
        return `${detail.translations[0].name} - ${duration} Mins - ${quantity} Times`
    }).join(', ')
    return `━━━━━━━━━━━━━━━━━
Booking from ${booking.name} at ${booking.address}
therapy: ${names}
:round_pushpin: Property: ${booking.address}
- Room: ${booking.room}
• Tower: ${booking.tower}
• Address: ${booking.address}
:alarm_clock: Start: ${booking.startTime}
Duration: 2 hours
    
:male-doctor: Therapist: ${booking.gender === "female" ? "Female / Nữ" : "Male / Nam"}
:moneybag: Price: ₫ ${price} VND
• Method: in cash
━━━━━━━━━━━━━━━━━
- Email: ${booking.email}
- Mobile: ${booking.phone}
- Reference: ${booking.id}`;
}

const BookingService = {
    makeBooking, sendKTVBookingEmail,
    sendNoKTVEmail,
    acceptBooking,
} as const
export default BookingService

