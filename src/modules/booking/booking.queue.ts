import bullMQ from "../../utils/bullmq";
import "./booking.worker"
const queue = bullMQ.Queue("booking");
function findKTV(bookingId: string, options?: { delay: number }) {
    queue.add("findKTV", bookingId, {...options,attempts: 3})
}

const bookingQueue = {
    findKTV,
} as const

export default bookingQueue;