import mongoose from 'mongoose';

export class MessageDto {
  _id: mongoose.Types.ObjectId;

  text: string;

  user_id: string;

  send_at: Date;

  sentByMe?: boolean;

  username?: string;

  group_id: string;
}
