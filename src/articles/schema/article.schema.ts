import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
import * as mongoosePaginate from 'mongoose-paginate-v2';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const aggregatePaginate = require('mongoose-paginate-v2');

export type ArticleDocument = Article & Document;

@Schema()
export class Article {
  _id: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  author_id: string;
}

export const ArticleSchema =
  SchemaFactory.createForClass(Article).plugin(aggregatePaginate);
