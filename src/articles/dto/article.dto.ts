import { ObjectId } from 'mongoose';

export class ArticleDto {
  _id: string | ObjectId;

  title: string;

  date: string | Date;

  content: string;
}
