import { therapists } from "../database.schema"
import db from "../drizzle"

type TherapistSeed = typeof therapists.$inferInsert

const data: TherapistSeed[] = [
    { email: "huynh8a0k5@gmail.com", name: "Bao Huynh" },
]

export default async function runTherapistSeed() {
    await Promise.all(data.map(async (value) => {
        await db.insert(therapists).values(value).onConflictDoUpdate({ target: therapists.email, set: value })
    }))
    console.log(`Therapist seeded successfully!`);
}
