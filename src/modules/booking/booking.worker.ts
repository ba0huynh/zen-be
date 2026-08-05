// src/queues/booking.worker.ts
import { eq, isNull } from "drizzle-orm";
import { bookingTherapistLogs, therapists } from "../../database/database.schema";
import db from "../../database/drizzle";
import bullMQ from "../../utils/bullmq";
import bookingQueue from "./booking.queue";
import BookingService from "./booking.service";
import Slack from "../../utils/slack";

// FIX: Listen to the "booking" queue, not "findKTV"
const worker = bullMQ.Worker("booking", async (job) => {
    // Optional: if you want to handle specific named jobs inside the booking queue
    if (job.name !== "findKTV") return;

    const bookingId = job.data as string;
    console.log('findKTV worker triggered with id:', bookingId);
    
    const booking = await db.query.bookings.findFirst({ where: (b, { eq }) => eq(b.id, bookingId) });
    if (!booking || booking.therapistEmail) {
        return;
    }
    const ktv = await db.select().from(therapists)
        .leftJoin(bookingTherapistLogs, eq(bookingTherapistLogs.therapistEmail, therapists.email))
        .where(isNull(bookingTherapistLogs.bookingId)).limit(1);

    if (ktv.length === 0) {
        await BookingService.sendNoKTVEmail(bookingId);
        Slack.sendMessage(`No KTV found for booking ${bookingId} ${booking.startTime}`);
    } else {
        const therapistEmail = ktv[0].therapists.email;
        await Promise.all([
            BookingService.sendKTVBookingEmail(therapistEmail, bookingId),
            db.insert(bookingTherapistLogs).values({ bookingId, therapistEmail })
        ]);
        bookingQueue.findKTV(bookingId, { delay: 1000 * 60 * 5 });
    }
});

worker.on('ready', () => {
    console.log('Booking Worker is connected and ready to process jobs!');
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});