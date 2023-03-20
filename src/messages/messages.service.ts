import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { SendMessageDto } from './dto/sendMessage.dto';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from './schema/message.schema';
import { Model } from 'mongoose';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}
  async findAll(group_id: string) {
    const messages = await this.messageModel.find({ group_id: group_id });
    return messages;
  }
  async create(user_id: string, group_id: string, message: SendMessageDto) {
    const time = Date.now();

    const sentMessage = await this.messageModel.create({
      user_id: user_id,
      group_id: group_id,
      text: message.text,
      send_at: time,
    });
    return sentMessage;
  }
  async getUserFromSocket(socket: Socket) {
    try {
      const auth_token = socket.handshake.headers.authorization;
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
