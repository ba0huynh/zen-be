import { sql } from "drizzle-orm";
import { customType } from "drizzle-orm/pg-core";
import wkx from "wkx";
export const gen_random_uuid = sql`gen_random_uuid()`;

export const geography = customType<{
  data: { latitude: number; longitude: number };
  driverData: string;
}>({
  dataType() {
    return "geography";
  },
  toDriver(value: { longitude: string | number; latitude: string | number }) {
    return `SRID=4326;POINT(${value.longitude} ${value.latitude})`;
  },
  fromDriver(value) {
    if (!value) return { latitude: 0, longitude: 0 };
    try {
      // 'value' is a hex string of EWKB, convert it to Buffer
      const buffer = Buffer.from(value, "hex");
      const geom = wkx.Geometry.parse(buffer);
      if (geom instanceof wkx.Point) {
        return { latitude: geom.y, longitude: geom.x };
      }
      return { latitude: 0, longitude: 0 };
    } catch {
      return { latitude: 0, longitude: 0 };
    }
  },
});
