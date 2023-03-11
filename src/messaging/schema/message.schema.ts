import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()
export class Message {
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true })
  text: string;
  @Prop({ required: true })
  user_id: string;
  @Prop({ required: true })
  group_id: string;
  @Prop({ required: true })
  send_at: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
