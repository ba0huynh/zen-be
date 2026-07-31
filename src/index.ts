import { Hono } from 'hono'
import env from '../env';
import massageRoute from './modules/massage/massage.route';
import bookingRoute from './modules/booking/booking.route';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono()
app.use(logger());
app.use(
  "*",
  cors({
    // origin: [env.cors.origin!],
    // credentials: true, // allow cookies/headers
    allowMethods: ["GET", "POST",
      //  "DELETE", "PUT"
      ],
    allowHeaders: ["Content-Type",
      //  "Authorization"
      ],
  }),
);
app.onError((e,c) => {
  console.log(JSON.stringify(e))
  return c.json({ error: 'Internal server error' }, 500)
})
app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.route('/massages', massageRoute)
app.route('/bookings', bookingRoute)
export default {
  port: Number(env.port) || 4000,
  fetch: app.fetch,
};