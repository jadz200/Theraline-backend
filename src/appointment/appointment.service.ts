import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { PaginateModel, PaginateResult } from 'mongoose';
import { User } from 'src/auth/schema/user.schema';
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
    const start_date = new Date(dto.start_date);
    const end_date = new Date(dto.end_date);
    if (
      start_date.toString() === 'Invalid Date' ||
      end_date.toString() === 'Invalid Date'
    ) {
      throw new BadRequestException(
        'start_date and/or end_date are not a correct time',
      );
    }

    const appoinment = await this.appointmentModel.create({
      patient_id: dto.patient_id,
      title: dto.title,
      start_date: start_date,
      end_date: end_date,
      doctor_id: doctor_id,
      status: 'CREATED',
      paymentInfo: dto.paymentInfo,
    });
    this.logger.log(`Appointment ${appoinment._id} created by ${doctor_id}`);

    return { msg: 'Created Appointment' };
  }

  async confirm_appointment(appointment_id: string, patient_id) {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      patient_id: patient_id,
    });
    if (!appointment) {
      throw new BadRequestException('No appointment for this patient');
    }
    if (appointment.status.toString() !== 'CREATED') {
      throw new BadRequestException(
        'Appointment is not in the CREATED status ',
      );
    }

    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { status: 'CONFIRMED' },
    );
    this.logger.log(`Appointment ${appointment_id} confirmed by ${patient_id}`);

    return { msg: 'Appointment confirmed' };
  }

  async cancel_appointment(appointment_id: string, user_id) {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
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
    if (!appointment) {
      throw new BadRequestException('No appointment for this patient');
    }
    if (
      appointment.status.toString() !== 'CREATED' &&
      appointment.status.toString() !== 'CONFIRMED'
    ) {
      throw new BadRequestException(
        'Appointment is not in the CONFIRMED or CREATED status',
      );
    }

    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { status: 'CANCELED' },
    );
    this.logger.log(`Appointment ${appointment_id} canceled by ${user_id}`);

    return { msg: 'Appointment canceled' };
  }

  async complete_appointment(
    doctor_id: string,
    appointment_id: string,
    dto: paymentInfoDto,
  ) {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id: doctor_id,
    });
    if (!appointment) {
      throw new BadRequestException('No appointment for this doctor');
    }
    const date = new Date(dto.date);
    if (date.toString() === 'Invalid Date') {
      throw new BadRequestException('date is not a correct time');
    }
    if (appointment.status.toString() !== 'CONFIRMED') {
      throw new BadRequestException(
        'Appointment is not in the CONFIRMED status ',
      );
    }

    await this.appointmentModel.findByIdAndUpdate(
      { _id: appointment_id },
      { status: 'DONE', paymentInfo: dto },
    );
    return { msg: 'Appointment complete with payment info' };
  }

  async confirm_payment(appointment_id, doctor_id) {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id: doctor_id,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }
    if (appointment.status !== 'DONE') {
      throw new BadRequestException("Appointment isn't complete");
    }
    if (appointment.paymentInfo.status === 'PAID') {
      throw new BadRequestException('Appointment already paid');
    }
    await this.appointmentModel.updateOne(appointment, {
      $set: { 'paymentInfo.status': 'PAID' },
    });

    return { msg: 'Appointment has already been paid' };
  }

  async get_all_paymentInfo(doctor_id, page) {
    const options = {
      page: page,
      limit: 25,
      select: 'patient_id paymentInfo',
      sort: { createdAt: -1 },
    };
    const paymentInfo: PaginateResult<Appointment> =
      await this.appointmentModel.paginate(
        { doctor_id: doctor_id, status: 'DONE' },
        options,
      );

    for (const index in paymentInfo.docs) {
      const patient_id = paymentInfo.docs[index].patient_id;
      const patient: User = await this.authService.getPatientProfile(
        patient_id,
      );
      console.log(patient.fullName);
      const test = { ...patient, ...paymentInfo.docs[index].paymentInfo };
      // paymentInfo.docs[index] = test;
      console.log(test);
      // temp[i] = { firstName: patient.firstName };
    }
    this.logger.log(`Payment Info for ${doctor_id} retrieved`);
    return paymentInfo;
  }

  async get_patient_appointment(patient_id, page) {
    const options = {
      page: page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp = await this.appointmentModel.paginate(
      { patient_id: patient_id },
      options,
    );
    this.logger.log(`Appointments for ${patient_id} retrieved`);

    return resp;
  }

  async edit_amount(appointment_id, doctor_id, amount) {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id: doctor_id,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }
    await this.appointmentModel.updateOne(appointment, {
      $set: { 'paymentInfo.amount': amount },
    });
  }

  async get_doctor_appointment(doctor_id, page) {
    const options = {
      page: page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp = await this.appointmentModel.paginate(
      { doctor_id: doctor_id },
      options,
    );
    this.logger.log(`Appointments for ${doctor_id} retrieved`);

    return resp;
  }
}
