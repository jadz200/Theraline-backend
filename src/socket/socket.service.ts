import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SocketService {
  async getUserFromSocket(socket: Socket) {
    try {
      const auth_token = socket.handshake.query.accessToken.toString();
      if (!auth_token) {
        throw new WsException('Missing authorization header');
      }
      const token = auth_token.replace('Bearer ', '');
      if (!token) {
        throw new WsException('Missing bearer token');
      }
      let decoded;
      try {
        decoded = jwt.verify(token, 'AT_SECRET');
      } catch (error) {
        throw new WsException('Payload is missing!');
      }

      return decoded;
    } catch (error) {
      socket.disconnect();
      return;
    }
  }
}
