import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from 'src/appointment/schema';
import { User } from 'src/auth/dto';
import { UserSchema } from 'src/auth/schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    JwtModule.register({}),

    AuthModule,
    CloudinaryModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
