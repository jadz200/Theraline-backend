import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { PatientService } from 'src/patient/patient.service';
import { CreateAppointmentDto } from './dto/createAppointement.dto';
import { Appointment, AppointmentDocument } from './schema/appointement.schema';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    private readonly authService: AuthService,
    private readonly patientService: PatientService,
  ) {}
  async create_appointment(dto: CreateAppointmentDto, doctor_id) {
    const userFound = await this.patientService.findById(dto.patient_id);
    console.log(userFound);
    if (!userFound) {
      throw new BadRequestException('No user with this id');
    }
    await this.appointmentModel.create({
      patient_id: dto.patient_id,
      time: dto.time,
      doctor_id: doctor_id,
      appointmentStatus: 'CREATED',
      paymentInfo: dto.paymentInfo,
    });
    return { msg: 'Created Appointment' };
  }
  async confirm_appointment(appointment_id: string, patient_id) {
    const appointmentFound = await this.appointmentModel.exists({
      _id: appointment_id,
      patient_id: patient_id,
    });
    if (!appointmentFound) {
      throw new BadRequestException('No appointment for this user');
    }
    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { appointmentStatus: 'CONFIRMED' },
    );
    return { msg: 'Appointment confirmed' };
  }
  async cancel_appointment(appointment_id: string, user_id) {
    const appointmentFound = await this.appointmentModel.exists({
      $or: [
        {
          _id: appointment_id,
          patient_id: user_id,
        },
        {
          _id: appointment_id,
          doctor_id: user_id,
        },
      ],
    });
    if (!appointmentFound) {
      throw new BadRequestException('No appointment for this user');
    }
    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { appointmentStatus: 'CANCELED' },
    );
    return { msg: 'Appointment canceled' };
  }
}
