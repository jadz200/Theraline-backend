import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies/index';
import { RolesGuard } from '../common/guards/index';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { Appointment, AppointmentSchema } from 'src/appointment/schema';

@Module({
  imports: [
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    CloudinaryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
