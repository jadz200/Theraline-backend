import mongoose from 'mongoose';

export class getMessage {
  _id: mongoose.Types.ObjectId;
  text: string;
  user_id: string;
  send_at: Date;
  sentByMe: boolean;
}

export class getChatMessages {
  messages: getMessage[];
}
