import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { CreateAppointmentDto, paymentInfoDto } from './dto/index';
import { Appointment, AppointmentDocument } from './schema/index';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(Appointment.name);

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
    const appoinment = await this.appointmentModel.create({
      patient_id: dto.patient_id,
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.start_date,
      doctor_id: doctor_id,
      status: 'CREATED',
      paymentInfo: dto.paymentInfo,
    });
    this.logger.log(`Appointment ${appoinment._id} created by ${doctor_id}`);

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
    this.logger.log(`Appointment ${appointment_id} confirmed by ${patient_id}`);

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
    this.logger.log(`Appointment ${appointment_id} canceled by ${user_id}`);

    return { msg: 'Appointment canceled' };
  }
  async complete_appointment(appointment_id: string, dto: paymentInfoDto) {
    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { appointmentStatus: 'DONE' },
      { $set: { paymentInfo: dto } },
    );
    return { msg: 'added payment' };
  }

  async get_all_paymentInfo(doctor_id) {
    const paymentInfo = await this.appointmentModel
      .find({ doctor_id: doctor_id })
      .select('paymentInfo');
    this.logger.log(`Payment Info for ${doctor_id} retrieved`);
    return paymentInfo;
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
    this.logger.log(`Appointments for ${doctor_id} retrieved`);

    return resp;
  }
}
