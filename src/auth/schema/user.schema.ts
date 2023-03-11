import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = User & Document;

export type UserRole = ['PATIENT', 'MODERATOR', 'DOCTOR'];

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
  @Prop({ required: true })
  role: UserRole;
  @Prop()
  hashedRt: string;
  @Prop()
  Groups: mongoose.Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
