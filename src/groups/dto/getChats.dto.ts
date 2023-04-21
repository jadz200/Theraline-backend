import mongoose from 'mongoose';
import { MessageDto } from '../../messages/dto/message.dto';
import { GroupType } from '../schema/group.schema';

export class Chat {
  _id: mongoose.Types.ObjectId;

  name: string;

  groupType: GroupType;

  groupImage: string;

  latestMessage?: MessageDto;

  image?: string;
}
