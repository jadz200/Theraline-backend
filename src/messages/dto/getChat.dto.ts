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
  sentByMe: string;
}

export class getChat {
  messages: getMessage[];
}
