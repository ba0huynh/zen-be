import db from "../../database/drizzle"
import { places } from "../../database/entities/place.entity"

async function getList(){
    return await db.query.places.findMany()
}

const PlaceService = { getList } as const
export default PlaceService