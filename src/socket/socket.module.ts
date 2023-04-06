import { Module } from '@nestjs/common';
import { GroupsModule } from '../groups/groups.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
  imports: [GroupsModule],
  providers: [SocketService, SocketGateway],
  exports: [SocketGateway, SocketService],
})
export class SocketModule {}
