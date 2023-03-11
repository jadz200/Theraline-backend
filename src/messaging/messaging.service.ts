import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MsgDto } from 'src/common/dto/msg.dto';
import { RetrieveMessagesDto } from './dto/retrieveMessages.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}
  async send_message(dto: SendMessageDto, user_id: string): Promise<MsgDto> {
    const time = Date.now();

    await this.messageModel.create({
      user_id: user_id,
      group_id: dto.group_id,
      text: dto.text,
      send_at: time,
    });

    return { msg: 'Sent Message' };
  }
  async retrieve_messages(group_id: string) {
    const resp = await this.messageModel
      .find({ group_id: group_id })
      .sort({ send_at: 'asc' });
    return resp;
  }
}
