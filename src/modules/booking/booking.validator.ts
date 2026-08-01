import z from "zod"
import { BookingSchema } from "../../database/entities/booking.entity";
import { BookingMassageSchema } from "../../database/entities/booking_massage.entity";

const makeBooking = BookingSchema.pick({phone:true,startTime:true,address:true,})  .extend({
  massages: BookingMassageSchema.pick({duration:true,massageId:true,price:true}).array(),
  ...BookingSchema.pick({gender:true,note:true}).partial().shape
 })
export const bookingValidator = {makeBooking} as const
export type BookingValidatorType = {
  [K in keyof typeof bookingValidator]: z.infer<(typeof bookingValidator)[K]>;
};