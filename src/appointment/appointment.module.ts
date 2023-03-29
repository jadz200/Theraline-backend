import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { AppointementController, AppointmentService } from './index';
import { Appointment, AppointementSchema } from './schema/index';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointementSchema },
    ]),
    AuthModule,
  ],
  controllers: [AppointementController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
