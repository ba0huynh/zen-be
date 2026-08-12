const env = {
  database: {
    url: Bun.env.DATABASE_URL,
  },
  port: Bun.env.PORT,
  app: {
    url: Bun.env.APP_URL ?? `http://localhost:${Bun.env.PORT ?? 4000}`,
    secret: Bun.env.APP_SECRET!,
  },
  redis: {
    url: Bun.env.REDIS_URL,
  },
  resend: {
    apiKey: Bun.env.RESEND_API_KEY,
  }
};
export default env;