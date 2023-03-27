import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AppointementController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointementSchema } from './schema/appointment.schema';

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
