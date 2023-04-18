import { Injectable, Logger } from '@nestjs/common';
import { SendMessageDto } from './dto/sendMessage.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { PaginateModel, PaginateResult } from 'mongoose';
import { GroupsService } from '../groups/groups.service';
import { SocketGateway } from '../socket/socket.gateway';
import { Expo } from 'expo-server-sdk';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  private expo = new Expo();

  constructor(
    @InjectModel(Message.name)
    private messageModel: PaginateModel<MessageDocument>,
    private readonly groupService: GroupsService,
    private readonly messageGateway: SocketGateway,
    private readonly authService: AuthService,
  ) {}

  async get_chat_messages(
    user_id,
    group_id: string,
    page: number,
  ): Promise<PaginateResult<Message>> {
    await this.groupService.check_group_valid(group_id);

    const options = {
      page: page,
      limit: 30,
      sort: { send_at: -1 },
    };
    const resp: PaginateResult<Message> = await this.messageModel.paginate(
      { group_id: group_id },
      options,
    );
    for (const index in resp.docs) {
      resp.docs[index].username = await this.authService.getName(
        resp.docs[index].user_id,
      );
      if (resp.docs[index].user_id == user_id) {
        resp.docs[index].sentByMe = true;
      } else {
        resp.docs[index].sentByMe = false;
      }
    }
    return resp;
  }

  async sendMessage(
    user_id: string,
    group_id: string,
    message: SendMessageDto,
  ): Promise<{ msg: string }> {
    await this.groupService.check_group_valid(group_id);
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
    this.logger.log('Message sent');
    return { msg: 'message sent' };
  }
}
