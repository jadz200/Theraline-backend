import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Message, MessageSchema } from '../messages/schema/message.schema';
import { User, UserSchema } from '../auth/schema/user.schema';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { Group, GroupSchema } from './schema/group.schema';
import { AuthModule } from 'src/auth/auth.module';
import { Appointment, AppointmentSchema } from 'src/appointment/schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    CloudinaryModule,
    AuthModule,
    JwtModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
