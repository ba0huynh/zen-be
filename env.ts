const env = {
  database: {
    url: Bun.env.DATABASE_URL,
  },
  port: Bun.env.PORT,
  redis: {
    url: Bun.env.REDIS_URL,
  },
  resend: {
    apiKey: Bun.env.RESEND_API_KEY,
  }
};
export default env;