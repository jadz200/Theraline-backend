import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { PatientModule } from 'src/patient/patient.module';
import { AppointementController } from './appointement.controller';
import { AppointmentService } from './appointement.service';
import { Appointment, AppointementSchema } from './schema/appointement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointementSchema },
    ]),
    AuthModule,
    PatientModule,
  ],
  controllers: [AppointementController],
  providers: [AppointmentService],
})
export class AppointementModule {}
