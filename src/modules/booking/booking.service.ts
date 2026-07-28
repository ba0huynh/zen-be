import db from "../../database/drizzle"
import { bookings } from "../../database/entities/booking.entity"
import { BookingValidatorType } from "./booking.validator"

async function makeBooking(data: BookingValidatorType['makeBooking']) {
    return await db.insert(bookings).values(data)
}

const BookingService = {
    makeBooking,
} as const
export default BookingService

