import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator";
import BookingService from './booking.service';
import { bookingValidator } from './booking.validator';
import bookingPage from './booking.page';

const bookingRoute = new Hono()

bookingRoute.post('/', zValidator('json', bookingValidator.makeBooking), async (c) => {
    await BookingService.makeBooking(c.req.valid('json'))
    return c.json({ message: 'success' })
})

bookingRoute.get('/', zValidator('query', bookingValidator.getBookings), async (c) => {
    return c.json(await BookingService.getBookings(c.req.valid('query')))
})

bookingRoute.get('/accept', zValidator('query', bookingValidator.acceptBooking), async (c) => {
    const { email, id } = c.req.valid('query')
    const result = await BookingService.acceptBooking(email, id)
    return c.html(bookingPage.result(result), result.ok ? 200 : 400)
})

bookingRoute.get('/:id', zValidator('param', bookingValidator.getBooking), async (c) => {
    const booking = await BookingService.getBooking(c.req.valid('param').id)
    if (!booking) return c.json({ message: 'Booking not found' }, 404)
    return c.json(booking)
})

export default bookingRoute
