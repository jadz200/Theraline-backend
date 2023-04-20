import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { PaymentInfo } from './paymentInfo.schema';
import { AppointmentStatus } from './status.schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');

export type AppointmentDocument = Appointment & Document;

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
  paymentInfo: PaymentInfo;
}

export const AppointmentSchema =
  SchemaFactory.createForClass(Appointment).plugin(aggregatePaginate);
