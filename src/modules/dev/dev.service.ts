import db from "../../database/drizzle"
import env from "../../../env"
import appToken from "../../utils/token"
import formatDate from "../../utils/format-date"
import bookingEmail from "../booking/booking.email"
import { Gender } from "../../database/database.type"

export const EMAIL_TEMPLATES = [
    "ktvBooking",
    "noKTV",
    "bookingConfirmation",
    "bookingAccepted",
    "bookingCancelled",
    "adminNotice",
] as const
export type EmailTemplate = typeof EMAIL_TEMPLATES[number]

type SampleBooking = {
    id: string
    name: string
    phone: string
    email: string
    startTime: string
    address: string
    room: string | null
    tower: string | null
    note: string | null
    gender: Gender | null
    therapistName: string
    massages: { name: string, duration: number, quantity: number }[]
    totalPrice: number
}

/** Used when no ?bookingId= is supplied, so previews work against an empty database. */
const SAMPLE: SampleBooking = {
    id: "00000000-0000-0000-0000-0000000000ff",
    name: "Nguyen Van A",
    phone: "+84901234567",
    email: "customer@example.com",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
    address: "208 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh City",
    room: "L2-1203",
    tower: "Landmark 2",
    note: "Payment: Cash\nNotes: please call on arrival",
    gender: "female",
    therapistName: "Tran Thi B",
    massages: [
        { name: "Zen Wellness Traditional", duration: 60, quantity: 1 },
        { name: "Zen Night Recovery", duration: 90, quantity: 2 },
    ],
    totalPrice: 2_660_000,
}

const MASSAGES_WITH = {
    massage: { with: { translations: { where: (t: any, { eq }: any) => eq(t.languageCode, "en") } } },
} as const

/** Renders against a real booking when given an id, otherwise against SAMPLE. */
export async function loadSample(bookingId?: string): Promise<SampleBooking | null> {
    if (!bookingId) return SAMPLE

    const booking = await db.query.bookings.findFirst({
        where: (b, { eq }) => eq(b.id, bookingId),
        with: { therapist: true, massages: { with: MASSAGES_WITH } },
    })
    if (!booking) return null

    return {
        id: booking.id,
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        startTime: booking.startTime,
        address: booking.address,
        room: booking.room,
        tower: booking.tower,
        note: booking.note,
        gender: booking.gender,
        therapistName: booking.therapist?.name ?? SAMPLE.therapistName,
        massages: booking.massages.map(({ massage, duration, quantity }) => ({
            name: massage.translations[0]?.name ?? "Massage",
            duration,
            quantity,
        })),
        totalPrice: booking.massages.reduce((acc, cur) => acc + cur.price * cur.quantity, 0),
    }
}

export function renderEmail(template: EmailTemplate, b: SampleBooking) {
    const place = { address: b.address, room: b.room, tower: b.tower }
    const acceptUrl = `${env.app.url}/bookings/accept?email=${encodeURIComponent("therapist@example.com")}&id=${encodeURIComponent(b.id)}`
    const cancelUrl = `${env.app.url}/bookings/cancel?id=${encodeURIComponent(b.id)}&token=${appToken.sign(b.id)}`
    const enTime = formatDate.fullEn(b.startTime)

    switch (template) {
        case "ktvBooking":
            return bookingEmail.ktvBooking({
                acceptUrl, ...place, startTime: formatDate.full(b.startTime),
                note: b.note, gender: b.gender, massages: b.massages, totalPrice: b.totalPrice,
            })
        case "noKTV":
            return bookingEmail.noKTV({
                bookingId: b.id, ...place, startTime: enTime,
                massages: b.massages, totalPrice: b.totalPrice,
            })
        case "bookingConfirmation":
            return bookingEmail.bookingConfirmation({
                cancelUrl, name: b.name, ...place, startTime: enTime,
                massages: b.massages, totalPrice: b.totalPrice,
            })
        case "bookingAccepted":
            return bookingEmail.bookingAccepted({
                cancelUrl, name: b.name, therapistName: b.therapistName, ...place, startTime: enTime,
                massages: b.massages, totalPrice: b.totalPrice,
            })
        case "bookingCancelled":
            return bookingEmail.bookingCancelled({ bookingId: b.id, ...place, startTime: enTime })
        case "adminNotice":
            return bookingEmail.adminNotice({
                heading: "Booking accepted", status: `Accepted by ${b.therapistName}`,
                bookingId: b.id, startTime: enTime, customerName: b.name, phone: b.phone,
                email: b.email, note: b.note, therapistName: b.therapistName,
                ...place, massages: b.massages, totalPrice: b.totalPrice,
            })
    }
}
