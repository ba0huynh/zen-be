import { sql } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./database.schema";
const db = drizzle({ client: sql, schema });
export default db;
