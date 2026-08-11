import z from "zod"
import { BookingSchema } from "../../database/entities/booking.entity";
import { BookingMassageSchema } from "../../database/entities/booking_massage.entity";

const makeBooking = BookingSchema.pick({phone:true,startTime:true,address:true, name:true,email:true})  .extend({
  massages: BookingMassageSchema.pick({duration:true,massageId:true,price:true}).array(),
  ...BookingSchema.pick({gender:true,note:true}).partial().shape
 })
 const acceptBooking = z.object({email:z.email(),id:z.string()})
 const getBookings = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["pending", "assigned"]).optional(),
 })
 const getBooking = z.object({ id: z.string() })
export const bookingValidator = {makeBooking,acceptBooking,getBookings,getBooking} as const
export type BookingValidatorType = {
  [K in keyof typeof bookingValidator]: z.infer<(typeof bookingValidator)[K]>;
};
