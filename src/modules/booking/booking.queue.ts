import bullMQ from "../../utils/bullmq";
import "./booking.worker"
const queue = bullMQ.Queue("booking");
function findKTV(bookingId: string, options?: { delay: number }) {
    return queue.add("findKTV", bookingId, {
        ...options,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
    })
}

const bookingQueue = {
    findKTV,
} as const

export default bookingQueue;
