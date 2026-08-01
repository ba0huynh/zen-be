import db from "../../database/drizzle"
import { bookings } from "../../database/entities/booking.entity"
import { bookingMassages } from "../../database/entities/booking_massage.entity"
import { BookingValidatorType } from "./booking.validator"

async function makeBooking({ massages: massagesPayload, ...bookingPayload }: BookingValidatorType['makeBooking']) {

    const [booking] = await db.insert(bookings).values(bookingPayload).returning()
    await db.insert(bookingMassages).values(massagesPayload.map((massage) => ({ ...massage, bookingId: booking.id })))
}

const BookingService = {
    makeBooking,
} as const
export default BookingService

