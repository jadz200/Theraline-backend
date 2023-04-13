import { Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { PaginateModel } from 'mongoose';
import { GroupsService } from '../groups/groups.service';
import { SocketGateway } from '../socket/socket.gateway';
import { Expo } from 'expo-server-sdk';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private expo = new Expo();

  constructor(
    @InjectModel(Message.name)
    private messageModel: PaginateModel<MessageDocument>,
    private readonly groupService: GroupsService,
    private readonly messageGateway: SocketGateway,
  ) {}

  async findAll(group_id: string) {
    const messages = await this.messageModel.find({ group_id: group_id });
    return messages;
  }

  async get_chat(user_id, group_id: string, page: number) {
    const options = {
      page: page,
      limit: 30,
      sort: { send_at: -1 },
    };
    const resp = await this.messageModel.paginate(
      { group_id: group_id },
      options,
    );
    // for (const message in resp.docs) {
    // if (resp.docs[message].user_id == user_id) {
    // const jsonObject = JSON.parse(resp);
    // console.log(test);
    // } else {
    // resp.docs[message]['me'] = 'NO';
    // }
    // }
    return resp;
  }

  async sendMessage(
    user_id: string,
    group_id: string,
    message: SendMessageDto,
  ) {
    const time = Date.now();

    const sentMessage = await this.messageModel.create({
      user_id: user_id,
      group_id: group_id,
      text: message.text,
      send_at: time,
    });
    const server = this.messageGateway.server;
    server.to(group_id).emit('newMessage', {
      message: sentMessage,
    });
    this.logger.log('sending message');
    return sentMessage;
  }
}
