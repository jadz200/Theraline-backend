import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/sendMessage.dto';

import { Logger } from '@nestjs/common';
import { GroupsService } from 'src/groups/groups.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway implements OnGatewayConnection {
  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly messagesService: MessagesService,
    private readonly groupService: GroupsService,
  ) {}

  async handleConnection(client: Socket) {
    const info = await this.messagesService.getUserFromSocket(client);
    if (!info) {
      this.logger.log('Issue with auth token');
      return;
    }
    const groupId = client.handshake.query.groupId as string;
    const inGroup = await this.groupService.check_user_group(
      info['sub'],
      groupId,
    );
    if (!inGroup) {
      this.logger.log(`User ${info['sub']} is not in group ${groupId}`);
      client.disconnect();
    }
    client.join(groupId);
    // this.server.to(groupId).emit('userJoined', info['email']);
    const messages = await this.messagesService.findAll(groupId);
    this.server.to(groupId).emit('previousMessages', { messages });
    this.logger.log(
      `Email ${info['email']} connected into client ${client.id} joined ${groupId}`,
    );
  }
  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, message: SendMessageDto) {
    const info = await this.messagesService.getUserFromSocket(client);
    const groupId = client.handshake.query.groupId as string;

    const createdMessage = await this.messagesService.create(
      info['sub'],
      groupId,
      message,
    );
    this.server.to(groupId).emit('newMessage', {
      message: createdMessage,
    });
    this.logger.log(`user ${info['sub']} Sent message`);
  }
}
