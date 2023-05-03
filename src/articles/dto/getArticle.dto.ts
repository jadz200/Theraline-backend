import mongoose from 'mongoose';

export class GetArticleDto {
  _id: mongoose.Types.ObjectId;

  title: string;

  date: Date;

  content: string;

  author: {
    name: string;
    image: string;
  };
}
