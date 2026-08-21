import { places } from "../database.schema"
import db from "../drizzle"

type PlaceSeed = typeof places.$inferInsert

// NOTE: coordinates below are approximate centre points for each development.
// Verify them against the real building entrance before using them for dispatch
// or distance calculations.
const data: PlaceSeed[] = [
    {
        id: "b0000000-0000-0000-0000-000000000001",
        name: "Oakwood Residence Saigon D7",
        address: "1056A Đường Nguyễn Văn Linh, Tân Hưng, Hồ Chí Minh 700000, Vietnam",
        location: { latitude: 10.730270, longitude: 106.704340 },
    },
    {
        id: "b0000000-0000-0000-0000-000000000002",
        name: "Oakwood Hotel & Apartments Saigon BT",
        address: "330A – 330B Đ. Ung Văn Khiêm, Thạnh Mỹ Tây, Hồ Chí Minh 700000, Vietnam",
        location: { latitude: 10.801435, longitude: 106.722858 },
    },
    {
        id: "b0000000-0000-0000-0000-000000000003",
        name: "Sedona Suites Ho Chi Minh City D1",
        address: "67 Lê Lợi, Sài Gòn, Hồ Chí Minh, Vietnam",
        location: { latitude: 10.7733574, longitude: 106.7005909 },
    },
    {
        id: "b0000000-0000-0000-0000-000000000004",
        name: "Saigon Domaine Luxury Residences BT",
        address: "1057 Bình Quới, Hồ Chí Minh 700000, Vietnam",
        location: { latitude: 10.8228789, longitude: 106.727289},
    },
]

export default async function runPlaceSeed() {
    await Promise.all(data.map(async (value) => {
        await db.insert(places).values(value).onConflictDoUpdate({ target: places.id, set: value })
    }))
    console.log(`Place seeded successfully!`);
}
