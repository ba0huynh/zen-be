// src/queues/booking.worker.ts
import { and, count, eq, isNull } from "drizzle-orm";
import { bookingTherapistLogs, therapists } from "../../database/database.schema";
import db from "../../database/drizzle";
import bullMQ from "../../utils/bullmq";
import bookingQueue from "./booking.queue";
import BookingService from "./booking.service";

/** How long before the booking starts we give up and raise the "no therapist" alarm. */
const NO_KTV_CUTOFF_MS = 1000 * 60 * 45;
/** How long we wait for a therapist to accept before offering the booking to the next one. */
const OFFER_TIMEOUT_MS = 1000 * 60 * 2.5;

bullMQ.Worker("booking", async (job) => {
    if (job.name !== "findKTV") return;

    const bookingId = job.data as string;

    const booking = await db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId) });
    if (!booking || booking.therapistEmail || booking.cancelledAt) {
        return;
    }
    const ktv = await db.select().from(therapists)
        .leftJoin(bookingTherapistLogs, and(
            eq(bookingTherapistLogs.bookingId, bookingId), 
            eq(bookingTherapistLogs.therapistEmail, therapists.email)))
        .where(isNull(bookingTherapistLogs.bookingId)).limit(1);
    if (ktv.length === 0) {
        // Everyone has been asked. Don't raise the alarm yet — a therapist may still
        // accept, or a new one may be added. Wait until 45 minutes before the start
        // time, then re-check and only give up if we are still unassigned.
        const untilCutoff = new Date(booking.startTime).getTime() - NO_KTV_CUTOFF_MS - Date.now();
        if (untilCutoff > 0) {
            await bookingQueue.findKTV(bookingId, { delay: untilCutoff });
            return;
        }
        await BookingService.sendNoKTVEmail(bookingId);
        await BookingService.notifyNoKTV(bookingId);
    } else {
        const therapist = ktv[0].therapists;
        const therapistEmail = therapist.email;
        const [offers] = await db.select({ value: count() }).from(bookingTherapistLogs).where(eq(bookingTherapistLogs.bookingId, bookingId));
        const asked = (offers?.value ?? 0) + 1;
        await Promise.all([
            await BookingService.sendKTVBookingEmail(therapistEmail, bookingId),
            db.insert(bookingTherapistLogs).values({ bookingId, therapistEmail }),
            BookingService.notifyKTVAsked(bookingId, therapist, asked),
        ]);
        await bookingQueue.findKTV(bookingId, { delay: OFFER_TIMEOUT_MS });
    }
},{concurrency:20});
