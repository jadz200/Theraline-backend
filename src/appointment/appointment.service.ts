import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { CreateAppointmentDto } from './dto/index';
import { Appointment, AppointmentDocument } from './schema/index';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: PaginateModel<AppointmentDocument>,
    private readonly authService: AuthService,
  ) {}
  async create_appointment(dto: CreateAppointmentDto, doctor_id) {
    const userFound = await this.authService.findById(dto.patient_id);

    if (!userFound || userFound.role.toString() !== 'PATIENT') {
      throw new BadRequestException('No patient with this id');
    }
    await this.appointmentModel.create({
      patient_id: dto.patient_id,
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.start_date,
      doctor_id: doctor_id,
      status: 'CREATED',
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
      throw new BadRequestException('No appointment for this patient');
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

  async get_doctor_appointment(doctor_id, page) {
    const options = {
      page: page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp = this.appointmentModel.paginate(
      { doctor_id: doctor_id },
      options,
    );
    return resp;
  }
}
