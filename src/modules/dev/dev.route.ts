import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import env from '../../../env'
import resend from '../../utils/resend'
import { FROM_EMAIL } from '../booking/booking.constant'
import { EMAIL_TEMPLATES, EmailTemplate, loadSample, renderEmail } from './dev.service'

const devRoute = new Hono()

/**
 * Every route here can send real email, so it is gated behind APP_SECRET.
 * Pass it as `x-dev-secret` header or `?secret=` (the query form is there so
 * previews can be opened straight in a browser).
 */
devRoute.use('*', async (c, next) => {
    const secret = c.req.header('x-dev-secret') ?? c.req.query('secret')
    if (!env.app.secret || secret !== env.app.secret) {
        return c.json({ error: 'Unauthorized' }, 401)
    }
    await next()
})

devRoute.get('/emails', (c) => {
    return c.json({
        templates: EMAIL_TEMPLATES,
        preview: `GET /dev/emails/:template?secret=…&bookingId=(optional)`,
        send: `POST /dev/emails/:template?secret=…  body: { "to": "you@example.com", "bookingId": "(optional)" }`,
    })
})

const templateParam = z.object({ template: z.enum(EMAIL_TEMPLATES) })

devRoute.get('/emails/:template', zValidator('param', templateParam), async (c) => {
    const { template } = c.req.valid('param')
    const booking = await loadSample(c.req.query('bookingId'))
    if (!booking) return c.json({ error: 'Booking not found' }, 404)

    const { subject, html, text } = renderEmail(template as EmailTemplate, booking)
    if (c.req.query('format') === 'text') return c.text(`${subject}\n\n${text}`)
    return c.html(html)
})

const sendBody = z.object({
    to: z.email(),
    bookingId: z.string().optional(),
})

devRoute.post('/emails/:template', zValidator('param', templateParam), zValidator('json', sendBody), async (c) => {
    console.log('env.resend.apiKey',env.resend.apiKey)
    const { template } = c.req.valid('param')
    const { to, bookingId } = c.req.valid('json')
    const booking = await loadSample(bookingId)
    if (!booking) return c.json({ error: 'Booking not found' }, 404)

    const { subject, html, text } = renderEmail(template as EmailTemplate, booking)
    const result = await resend.emails.send({ from: FROM_EMAIL, to, subject, html, text })

    if (result.error) return c.json({ sent: false, template, to, error: result.error }, 502)
    return c.json({ sent: true, template, to, subject, id: result.data?.id })
})

export default devRoute
