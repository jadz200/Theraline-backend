import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class SocketService {
  async getUserFromSocket(socket: Socket) {
    try {
      const authToken = socket.handshake.query.accessToken.toString();
      if (!authToken) {
        throw new WsException('Missing authorization header');
      }
      const token = authToken.replace('Bearer ', '');
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
    }
    return 'No user';
  }
}
