import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator";
import BookingService from './booking.service';
import { bookingValidator } from './booking.validator';

const bookingRoute = new Hono()

bookingRoute.post('/',zValidator('json',bookingValidator.makeBooking), async (c) => {
await BookingService.makeBooking(c.req.valid('json') )
    return c.json({message: 'success'})
})

export default bookingRoute
