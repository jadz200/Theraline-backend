import mongoose from 'mongoose';
import { GroupType } from '../schema/group.schema';

export class Chat {
  _id: mongoose.Types.ObjectId;
  name: string;
  groupType: GroupType;
}
export class getChatsDto {
  chats: Chat[];
}
