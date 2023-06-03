import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel, PaginateResult } from 'mongoose';
import { Expo } from 'expo-server-sdk';
import { AuthService } from 'src/auth/auth.service';
import { SendMessageDto } from './dto/sendMessage.dto';
import { Message, MessageDocument } from './schema/message.schema';
import { GroupsService } from '../groups/groups.service';
import { SocketGateway } from '../socket/socket.gateway';
import { MessageDto } from './dto/message.dto';

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
      page,
      limit: 30,
      sort: { send_at: -1 },
    };
    const resp: PaginateResult<MessageDto> = await this.messageModel.paginate(
      { group_id },
      options,
    );
    const user = await this.authService.findById(user_id);
    const messages: MessageDto[] = await Promise.all(
      resp.docs.map(async (message) => {
        let username;
        if (user.role === 'DOCTOR')
          username = await this.authService.getName(message.user_id);
        else {
          const messageUser = await this.authService.findById(message.user_id);
          if (messageUser.role === 'DOCTOR')
            username = await this.authService.getName(message.user_id);
          else username = await this.authService.getUsername(message.user_id);
        }

        const sentByMe = message.user_id === user_id;
        const result: MessageDto = {
          _id: message._id,
          text: message.text,
          user_id: message.user_id,
          send_at: message.send_at,
          username,
          sentByMe,
          group_id: message.group_id,
        };
        return result;
      }),
    );
    return { ...resp, docs: messages };
  }

  async sendMessage(
    user_id: string,
    group_id: string,
    message: SendMessageDto,
  ): Promise<{ msg: string }> {
    await this.groupService.check_group_valid(group_id);
    const time = Date.now();
    const sentMessage = await this.messageModel.create({
      user_id,
      group_id,
      text: message.text,
      send_at: time,
    });
    const { server } = this.messageGateway;
    server.to(group_id).emit('newMessage', {
      message: sentMessage,
    });
    this.logger.log('Message sent');
    return { msg: 'message sent' };
  }
}
