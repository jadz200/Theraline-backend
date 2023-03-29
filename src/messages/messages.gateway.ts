import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { SendMessageDto } from './dto/sendMessage.dto';

import { Logger } from '@nestjs/common';
import { GroupsService } from '../groups/groups.service';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
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
    client.join(info['sub']);
    this.logger.log(`Email ${info['email']} connected`);
    const groupId = client.handshake.query.groupId as string;
    if (groupId) {
      let inGroup;
      try {
        inGroup = await this.groupService.check_user_group_socket(
          info['sub'],
          groupId,
        );
      } catch (error) {
        throw new WsException('User does not belong in group');
      }
      if (!inGroup) {
        this.logger.log(`User ${info['sub']} is not in group ${groupId}`);
        client.disconnect();
      }
      client.join(groupId);

      const messages = await this.messagesService.findAll(groupId);
      this.server.to(groupId).emit('previousMessages', { messages });
      this.logger.log(`client ${client.id} joined ${groupId}`);
    }
    this.logger.log(`client ${client.id} listening to messages`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage('sendMessage')
  @ApiOperation({ summary: 'Receive a message via WebSocket' })
  @ApiBody({ description: 'The message payload', type: String })
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
    // this.server.to(info['sub']).emit('IncomingMessage', {
    // message: { groupId },
    // });
    this.logger.log(`user ${info['sub']} Sent message`);
  }
}
