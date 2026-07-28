import { Hono } from 'hono'
import PlaceService from './place.service';

const placeRoute = new Hono()

placeRoute.get('/', async (c) => {
const places = await PlaceService.getList()
    return c.json(places)
})

export default placeRoute
