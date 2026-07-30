import { Hono } from 'hono'
import env from '../env';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

export default {
  port: Number(env.port) || 4000,
  fetch: app.fetch,
};