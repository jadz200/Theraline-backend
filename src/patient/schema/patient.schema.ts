import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

@Schema()
export class Patient {
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  phone: string;
  @Prop({ required: true })
  birthday: string;
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop()
  appointments: string[];
  @Prop()
  docs: string[];
  @Prop({ required: true, unique: true })
  user_id: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
