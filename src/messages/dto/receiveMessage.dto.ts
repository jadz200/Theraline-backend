import mongoose from 'mongoose';

export class receiveMessage {
  _id: mongoose.Types.ObjectId;
  text: string;
  user_id: string;
  send_at: Date;
}
