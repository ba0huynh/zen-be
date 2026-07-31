import { Hono } from 'hono'
import env from '../env';
import massageRoute from './modules/massage/massage.route';
import bookingRoute from './modules/booking/booking.route';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/massages', massageRoute)
app.route('/bookings', bookingRoute)
export default {
  port: Number(env.port) || 4000,
  fetch: app.fetch,
};