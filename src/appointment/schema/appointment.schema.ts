import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

export type AppointmentStatus = ['CREATED', 'CONFIRMED', 'CANCELED', 'DONE'];
export type PaymentStatus = ['N/A', 'PENDING', 'AWAITING', 'PAID'];
export type PaymentMethod = ['N/A', 'CASH', 'CHECK', 'CREDIT CARD'];

export class paymentInfo {
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  date: Date;
}

@Schema()
export class Appointment {
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true })
  patient_id: string;
  @Prop({ required: true })
  doctor_id: string;
  @Prop({ required: true })
  start_date: Date;
  @Prop({ required: true })
  end_date: Date;
  @Prop({ required: true })
  status: AppointmentStatus;
  @Prop({
    required: true,
    type: {
      amount: Number,
      status: String,
      method: String,
      date: Date,
    },
  })
  paymentInfo: paymentInfo;
}

export const AppointementSchema = SchemaFactory.createForClass(Appointment);
