import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export class Notes {
  @Prop()
  _id: mongoose.Types.ObjectId;

  @Prop()
  author: string;

  @Prop()
  title: string;

  @Prop()
  body: string;
}
