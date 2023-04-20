import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import * as mongoosePaginate from 'mongoose-paginate-v2';
import { ClinicInfo } from './clinicInfo.schema';
import { UserRole } from './userRole.schema';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');

export type UserDocument = User & Document;

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

  // virtuals
  fullName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(aggregatePaginate);

UserSchema.virtual('fullName').get(function getfullName() {
  return `${this.firstName} ${this.lastName}`;
});
export { UserRole };
