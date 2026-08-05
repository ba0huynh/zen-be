import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator";
import BookingService from './booking.service';
import { bookingValidator } from './booking.validator';

const bookingRoute = new Hono()

bookingRoute.post('/', zValidator('json', bookingValidator.makeBooking), async (c) => {
    await BookingService.makeBooking(c.req.valid('json'))
    return c.json({ message: 'success' })
})

bookingRoute.get('/accept', zValidator('query', bookingValidator.acceptBooking), async (c) => {
    const { email, id } = c.req.valid('query')
    const message = await BookingService.acceptBooking(email, id)
    return c.html(message, 200)
})

export default bookingRoute
