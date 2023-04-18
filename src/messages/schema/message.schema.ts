import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as mongoosePaginate from 'mongoose-paginate-v2';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');

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
  @Prop({ required: false })
  sentByMe: boolean;
  @Prop({ required: false })
  username: string;
}

const MessageSchema =
  SchemaFactory.createForClass(Message).plugin(aggregatePaginate);

// MessageSchema.virtual('sentByMe');

export { MessageSchema };
