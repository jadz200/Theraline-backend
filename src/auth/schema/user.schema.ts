import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');
export type UserDocument = User & Document;

export type UserRole = ['PATIENT', 'MODERATOR', 'DOCTOR', 'ADMIN'];

export class ClinicInfo {
  @Prop()
  phone: string;
  @Prop()
  location: string;
  @Prop()
  name: string;
}
@Schema()
export class User {
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ required: true })
  firstName: string;
  @Prop({ required: true })
  lastName: string;
  @Prop()
  phone?: string;
  @Prop()
  birthday?: Date;
  @Prop()
  gender?: string;
  @Prop({ required: true })
  role: UserRole;
  @Prop()
  hashedRt: string;
  @Prop()
  groups: string[];
  @Prop()
  clinicInfo?: ClinicInfo;
  @Prop()
  image?: string;
  @Prop()
  expoToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(aggregatePaginate);
