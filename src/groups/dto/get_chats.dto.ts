import mongoose from 'mongoose';
import { receiveMessage } from '../../messages/dto/receiveMessage.dto';
import { GroupType } from '../schema/group.schema';

export class Chat {
  _id: mongoose.Types.ObjectId;
  name: string;
  groupType: GroupType;
  groupImage: string;
  latestMessage?: receiveMessage;
  image?: string;
}

export class getChatsDto {
  chats: Chat[];
}
