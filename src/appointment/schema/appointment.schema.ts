import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as mongoosePaginate from 'mongoose-paginate-v2';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');
export type AppointmentDocument = Appointment & Document;

export type AppointmentStatus = 'CREATED' | 'CONFIRMED' | 'CANCELED' | 'DONE';
export type PaymentStatus = 'PENDING' | 'AWAITING' | 'PAID';
export type PaymentMethod = 'CASH' | 'CHECK' | 'CREDIT CARD';

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
  title: string;
  @Prop({ required: true })
  doctor_id: string;
  @Prop({ required: true })
  start_date: Date;
  @Prop({ required: true })
  end_date: Date;
  @Prop({ required: true })
  status: AppointmentStatus;
  @Prop({
    type: {
      amount: Number,
      status: String,
      method: String,
      date: Date,
    },
  })
  paymentInfo: paymentInfo;
}

export const AppointmentSchema =
  SchemaFactory.createForClass(Appointment).plugin(aggregatePaginate);
