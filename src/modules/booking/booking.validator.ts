import z from "zod"
import { BookingSchema } from "../../database/entities/booking.entity";

const makeBooking = BookingSchema.pick({phone:true,price:true,address:true,duration:true,massageId:true,startTime:true})  
export const bookingValidator = {makeBooking} as const
export type BookingValidatorType = {
  [K in keyof typeof bookingValidator]: z.infer<(typeof bookingValidator)[K]>;
};