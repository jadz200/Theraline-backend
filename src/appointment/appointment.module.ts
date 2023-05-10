import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AppointementController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentSchema } from './schema/index';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    JwtModule.register({}),

    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    AuthModule,
    EmailModule,
  ],
  controllers: [AppointementController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
