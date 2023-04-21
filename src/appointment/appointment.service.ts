import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { PaginateModel, PaginateResult } from 'mongoose';
import { User } from '../auth/schema/user.schema';
import { AuthService } from '../auth/auth.service';
import {
  CreateAppointmentDto,
  EditAmountDto,
  GetpaymentInfoDto,
  PaymentInfoDto,
} from './dto/index';
import { Appointment, AppointmentDocument } from './schema/index';

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(Appointment.name);

  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: PaginateModel<AppointmentDocument>,
    private readonly authService: AuthService,
  ) {}

  async create_appointment(
    dto: CreateAppointmentDto,
    doctor_id,
  ): Promise<{ msg: string }> {
    const userFound = await this.authService.findById(dto.patient_id);

    if (!userFound || userFound.role.toString() !== 'PATIENT') {
      throw new BadRequestException('No patient with this id');
    }
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);
    if (
      startDate.toString() === 'Invalid Date' ||
      endDate.toString() === 'Invalid Date'
    ) {
      throw new BadRequestException(
        'start_date and/or end_date are not a correct time',
      );
    }
    if (startDate > endDate) {
      throw new BadRequestException('start_date cannot be after the end_date');
    }
    const appoinment = await this.appointmentModel.create({
      patient_id: dto.patient_id,
      title: dto.title,
      start_date: startDate,
      end_date: endDate,
      doctor_id,
      status: 'CREATED',
      paymentInfo: dto.paymentInfo,
    });
    this.logger.log(`Appointment ${appoinment._id} created by ${doctor_id}`);

    return { msg: 'Created Appointment' };
  }

  async confirm_appointment(
    appointment_id: string,
    patient_id,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      patient_id,
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

  async cancel_appointment(
    appointment_id: string,
    user_id,
  ): Promise<{ msg: string }> {
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
    dto: PaymentInfoDto,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id,
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

    this.logger.log(`Appointment ${appointment._id} has been confirmed`);
    return { msg: 'Appointment complete with payment info' };
  }

  async confirm_payment(appointment_id, doctor_id): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id,
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

    this.logger.log(
      `Payment for appointment ${appointment._id} has been confirmed`,
    );
    return { msg: 'Appointment has been paid' };
  }

  async get_all_paymentInfo(
    doctor_id,
    page,
  ): Promise<PaginateResult<GetpaymentInfoDto>> {
    const options = {
      page,
      limit: 25,
      select: 'patient_id paymentInfo',
      sort: { createdAt: -1 },
    };
    const paymentInfo: PaginateResult<GetpaymentInfoDto> =
      await this.appointmentModel.paginate(
        { doctor_id, status: 'DONE' },
        options,
      );
    const resp = await Promise.all(
      paymentInfo.docs.map(async (appoinment) => {
        const patientId = appoinment.patient_id;
        const patient: User = await this.authService.getPatientProfile(
          patientId,
        );
        const result: GetpaymentInfoDto = {
          _id: appoinment._id.toString(),
          patient_id: patientId,
          fullName: patient.fullName,
          image: patient.image,
          email: patient.email,
          paymentInfo: appoinment.paymentInfo,
        };
        return result;
      }),
    );

    return {
      ...paymentInfo,
      docs: resp,
    };
  }

  async edit_payment_info(
    appointment_id,
    doctor_id,
    dto: EditAmountDto,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointment_id)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointment_id,
      doctor_id,
    });
    if (!appointment) {
      throw new NotFoundException('Appointment Not Found');
    }
    await this.appointmentModel.updateOne(appointment, {
      $set: {
        'paymentInfo.amount': dto.amount,
        'paymentInfo.status': dto.status,
      },
    });
    this.logger.log(
      `Appointment ${appointment._id} has now an amount of ${dto}`,
    );
    return { msg: 'Payment info for appointment has been  edited' };
  }

  async get_patient_appointment(
    patient_id,
    page,
  ): Promise<PaginateResult<Appointment>> {
    const options = {
      page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp: PaginateResult<Appointment> =
      await this.appointmentModel.paginate({ patient_id }, options);
    this.logger.log(`Appointments for ${patient_id} retrieved`);

    return resp;
  }

  async get_doctor_appointment(
    doctor_id,
    page,
  ): Promise<PaginateResult<Appointment>> {
    const options = {
      page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp = await this.appointmentModel.paginate({ doctor_id }, options);
    this.logger.log(`Appointments for ${doctor_id} retrieved`);

    return resp;
  }

  async get_payment_stats(doctorId) {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const startOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - currentDate.getDay(),
    );
    const endOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (6 - currentDate.getDay()),
      23,
      59,
      59,
      999,
    );

    const monthlyAppointmentsPromise = this.appointmentModel.find({
      doctor_id: doctorId,
      start_date: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
      'paymentInfo.status': 'PAID',
    });

    const weeklyAppointmentsPromise = this.appointmentModel.find({
      doctor_id: doctorId,
      start_date: {
        $gte: startOfWeek,
        $lte: endOfWeek,
      },
      'paymentInfo.status': 'PAID',
    });

    const allAppointmentsPromise = this.appointmentModel.find({
      doctor_id: doctorId,
      'paymentInfo.status': 'PAID',
    });

    const [monthlyAppointments, weeklyAppointments, allAppointments] =
      await Promise.all([
        monthlyAppointmentsPromise,
        weeklyAppointmentsPromise,
        allAppointmentsPromise,
      ]);

    const monthlyAmount = monthlyAppointments.reduce(
      (sum, appoinment) => sum + appoinment.paymentInfo.amount,
      0,
    );
    const weeklyAmount = weeklyAppointments.reduce(
      (sum, appoinment) => sum + appoinment.paymentInfo.amount,
      0,
    );
    const allAmount = allAppointments.reduce(
      (sum, appoinment) => sum + appoinment.paymentInfo.amount,
      0,
    );

    return { week: weeklyAmount, month: monthlyAmount, all: allAmount };
  }

  async get_appointments_chart(doctorId) {
    const currentDate = new Date();
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const endOfYear = new Date(
      currentDate.getFullYear(),
      11,
      31,
      23,
      59,
      59,
      999,
    );
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
    const startOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - currentDate.getDay(),
    );
    const endOfWeek = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + (6 - currentDate.getDay()),
      23,
      59,
      59,
      999,
    );

    const getAppointmentsByStatus = (status, startDate, endDate) => {
      return this.appointmentModel
        .find({
          doctor_id: doctorId,
          start_date: {
            $gte: startDate,
            $lte: endDate,
          },
          status,
        })
        .sort({ start_date: 1 });
    };

    const [
      monthlyAppointmentsDone,
      weeklyAppointmentsDone,
      yearlyAppointmentsDone,
    ] = await Promise.all([
      getAppointmentsByStatus('DONE', startOfMonth, endOfMonth),
      getAppointmentsByStatus('DONE', startOfWeek, endOfWeek),
      getAppointmentsByStatus('DONE', startOfYear, endOfYear),
    ]);

    const [
      monthlyAppointmentsCanceled,
      weeklyAppointmentsCanceled,
      yearlyAppointmentsCanceled,
    ] = await Promise.all([
      getAppointmentsByStatus('CANCELED', startOfMonth, endOfMonth),
      getAppointmentsByStatus('CANCELED', startOfWeek, endOfWeek),
      getAppointmentsByStatus('CANCELED', startOfYear, endOfYear),
    ]);

    const divideAppointmentsByPeriod = (appointments, period) => {
      const counts = {};
      let dateKey = '';

      if (period.type === 'WEEK') dateKey = 'getDay';
      else if (period.type === 'MONTH') {
        dateKey = 'getDate';
      } else {
        dateKey = 'getMonth';
      }
      appointments.forEach((appointment) => {
        const day = appointment.start_date[dateKey]();

        if (counts[day]) {
          counts[day] += 1;
        } else {
          counts[day] = 1;
        }
      });
      return counts;
    };
    const appointmentsByDayOfWeekDone = divideAppointmentsByPeriod(
      weeklyAppointmentsDone,
      { type: 'WEEK' },
    );
    const appointmentsByDayOfWeekCanceled = divideAppointmentsByPeriod(
      weeklyAppointmentsCanceled,
      { type: 'WEEK' },
    );

    const appointmentsByDayOfMonthDone = divideAppointmentsByPeriod(
      monthlyAppointmentsDone,
      { type: 'MONTH' },
    );
    const appointmentsByDayOfMonthCanceled = divideAppointmentsByPeriod(
      monthlyAppointmentsCanceled,
      { type: 'MONTH' },
    );

    const appointmentsByMonthOfYearDone = divideAppointmentsByPeriod(
      yearlyAppointmentsDone,
      { type: 'YEAR' },
    );

    const appointmentsByMonthOfYearCanceled = divideAppointmentsByPeriod(
      yearlyAppointmentsCanceled,
      { type: 'YEAR' },
    );

    return {
      week: {
        done: appointmentsByDayOfWeekDone,
        canceled: appointmentsByDayOfWeekCanceled,
      },
      month: {
        done: appointmentsByDayOfMonthDone,
        canceled: appointmentsByDayOfMonthCanceled,
      },
      year: {
        done: appointmentsByMonthOfYearDone,
        canceled: appointmentsByMonthOfYearCanceled,
      },
    };
  }
}
