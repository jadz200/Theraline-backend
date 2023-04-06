import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SocketGateway } from '../socket/socket.gateway';
import { AuthModule } from '../auth/auth.module';
import { GroupsModule } from '../groups/groups.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { MessageController } from './messages.controller';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    AuthModule,
    GroupsModule,
    SocketModule,
  ],
  controllers: [MessageController],
  providers: [MessagesService, SocketGateway],
})
export class MessagesModule {}
