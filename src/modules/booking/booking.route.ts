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

bookingRoute.get('/cancel', zValidator('query', bookingValidator.cancelBooking), async (c) => {
    const { id, token } = c.req.valid('query')
    const preview = await BookingService.previewCancelBooking(id, token)
    if (!preview.ok) return c.html(bookingPage.result(preview), 400)
    return c.html(bookingPage.confirm({
        title: preview.title,
        message: preview.message,
        details: preview.details,
        action: '/bookings/cancel',
        fields: { id, token },
        submitLabel: 'Yes, cancel my booking',
    }), 200)
})

bookingRoute.post('/cancel', zValidator('form', bookingValidator.cancelBooking), async (c) => {
    const { id, token } = c.req.valid('form')
    const result = await BookingService.cancelBooking(id, token)
    return c.html(bookingPage.result(result), result.ok ? 200 : 400)
})

bookingRoute.get('/:id', zValidator('param', bookingValidator.getBooking), async (c) => {
    const booking = await BookingService.getBooking(c.req.valid('param').id)
    if (!booking) return c.json({ message: 'Booking not found' }, 404)
    return c.json(booking)
})

export default bookingRoute
