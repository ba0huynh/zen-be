import Redis from "ioredis";
import env from "../../env";

const redis = new Redis(env.redis.url!, {
  maxRetriesPerRequest: null, // Required by BullMQ workers
});
export default redis;