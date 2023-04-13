import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import mongoose from 'mongoose';

export enum SentByMe {
  YES = 'YES',
  NO = 'NO',
}
export class getMessage {
  _id: mongoose.Types.ObjectId;
  text: string;
  user_id: string;
  send_at: Date;
  me: string;
}

export class getChat {
  messages: getMessage[];
}
