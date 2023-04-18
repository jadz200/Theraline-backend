import { ObjectId, Schema } from 'mongoose';
import { PaginationResp } from 'src/common/dto/pagintionResp.dto';

export class ArticleDto {
  _id?: string | ObjectId;
  title: string;
  date: string | Date;
  content: string;
}
