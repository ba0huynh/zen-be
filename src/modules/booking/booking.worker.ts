// src/queues/booking.worker.ts
import { and, eq, isNull, ne } from "drizzle-orm";
import { bookingTherapistLogs, therapists } from "../../database/database.schema";
import db from "../../database/drizzle";
import bullMQ from "../../utils/bullmq";
import bookingQueue from "./booking.queue";
import BookingService from "./booking.service";
import Slack from "../../utils/slack";
import formatDate from "../../utils/format-date";

// FIX: Listen to the "booking" queue, not "findKTV"
bullMQ.Worker("booking", async (job) => {
    // Optional: if you want to handle specific named jobs inside the booking queue
    if (job.name !== "findKTV") return;

    const bookingId = job.data as string;
    console.log('findKTV worker triggered with id:', bookingId);

    const booking = await db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId) });
    if (!booking || booking.therapistEmail) {
        return;
    }
    console.log('booking : ',booking)
    const ktv = await db.select().from(therapists)
        .leftJoin(bookingTherapistLogs, and(
            eq(bookingTherapistLogs.bookingId, bookingId), 
            eq(bookingTherapistLogs.therapistEmail, therapists.email)))
        .where(isNull(bookingTherapistLogs.bookingId)).limit(1);
console.log('ktv',ktv)
    if (ktv.length === 0) {
        // await BookingService.sendNoKTVEmail(bookingId);
        // Slack.sendMessage(`No KTV found for booking ${bookingId} ${formatDate.dateTime(booking.startTime)}`);
    } else {
        const therapist = ktv[0].therapists;
        console.log(therapist)
        const therapistEmail = therapist.email;
        await Promise.all([
            // BookingService.sendKTVBookingEmail(therapistEmail, bookingId),
            db.insert(bookingTherapistLogs).values({ bookingId, therapistEmail }),
            Slack.sendMessage(`asking ${therapist.name} for booking ${bookingId} ${formatDate.dateTime(booking.startTime)}`),
        ]);
        console.log('assignin findKTV worker completed with id:', bookingId);
        bookingQueue.findKTV(bookingId, { delay: 1000 * 60 * 5 });
    }
},{concurrency:20});