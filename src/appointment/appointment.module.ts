import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AppointementController, AppointmentService } from './index';
import { Appointment, AppointmentSchema } from './schema/index';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Appointment.name,
        schema: AppointmentSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [AppointementController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
