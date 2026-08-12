// src/queues/booking.worker.ts
import { and, count, eq, isNull } from "drizzle-orm";
import { bookingTherapistLogs, therapists } from "../../database/database.schema";
import db from "../../database/drizzle";
import bullMQ from "../../utils/bullmq";
import bookingQueue from "./booking.queue";
import BookingService from "./booking.service";

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
        bookingQueue.findKTV(bookingId, { delay: 1000 * 60 * 2.5 });
    }
},{concurrency:20});