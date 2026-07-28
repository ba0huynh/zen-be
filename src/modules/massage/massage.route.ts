import { Hono } from 'hono'
import { zValidator } from "@hono/zod-validator";
import { translationHeaderValidator } from './validator/translation-header.validator';
import MassageService from './massage.service';

const massageRoute = new Hono()


massageRoute.get('/',zValidator('header',translationHeaderValidator), async (c) => {
  return c.json(await MassageService.getMassages(c.req.valid('header').langageCode ))
})

export default massageRoute
