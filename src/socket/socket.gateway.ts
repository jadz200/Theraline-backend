import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { GroupsService } from '../groups/groups.service';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { SocketService } from './socket.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class SocketGateway implements OnGatewayConnection {
  private readonly logger = new Logger(SocketGateway.name);
  @WebSocketServer() server: Server;
  constructor(
    private readonly socketService: SocketService,
    private readonly groupService: GroupsService,
  ) {}

  async handleConnection(client: Socket) {
    const info = await this.socketService.getUserFromSocket(client);
    if (!info) {
      this.logger.log('Issue with auth token');
      return;
    }
    client.join(info['sub']);
    this.logger.log(`Email ${info['email']} connected`);
    const groups_id = await this.groupService.get_groups_id(info['sub']);
    for (const groupId of groups_id) {
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
      }
      this.logger.log(`client ${client.id} joined ${groupId}`);
    }
    this.logger.log(
      `client ${client.id} listening to messages, connected:${client.connected}`,
    );
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  @ApiOperation({ summary: 'Receive a message via WebSocket' })
  @ApiBody({ description: 'The message payload', type: String })
  async handleMessage(client: Socket, message) {
    const info = await this.socketService.getUserFromSocket(client);
    console.log(message);

    this.logger.log(`user ${info['sub']} Sent message`);
  }
}
