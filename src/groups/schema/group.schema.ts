import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type GroupDocument = Group & Document;

export type GroupType = ['PRIVATE', 'GROUP'];

@Schema()
export class Group {
  _id: mongoose.Types.ObjectId;
  @Prop({})
  name: string;
  @Prop({ required: true })
  created_at: Date;
  @Prop({ required: true })
  groupType: GroupType;
  @Prop({ required: true })
  users: string[];
  @Prop()
  image: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
