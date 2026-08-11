import { Queue as BullMQQueue, Worker as BullMQWorker, Job } from "bullmq";
import redis from "./redis";

function Queue(name: string) {
    return new BullMQQueue(name, { connection: redis });
}
function Worker(name: string, handler: (job: Job) => Promise<void>, option: { concurrency?: number }) {
    const { concurrency = 1 } = option
    return new BullMQWorker(name, handler, { connection: redis, concurrency,removeOnComplete:{age:0} });
}

const bullMQ = {
    Queue,
    Worker,
} as const
export default bullMQ;
