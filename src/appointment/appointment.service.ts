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
import { getDaysInMonth } from '../common/util/getDaysInMonth';
import { GetAppointmentDto } from './dto/getAppointmentsDto';

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
    doctorId,
  ): Promise<{ msg: string }> {
    const userFound = await this.authService.findById(dto.patient_id);

    if (!userFound || userFound.role.toString() !== 'PATIENT') {
      throw new BadRequestException('No patient with this id');
    }

    if (
      dto.start_date.toString() === 'Invalid Date' ||
      dto.end_date.toString() === 'Invalid Date'
    ) {
      throw new BadRequestException(
        'start_date and/or end_date are not a correct time',
      );
    }
    if (dto.start_date > dto.end_date) {
      throw new BadRequestException('start_date cannot be after the end_date');
    }
    const appoinment = await this.appointmentModel.create({
      patient_id: dto.patient_id,
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.end_date,
      doctor_id: doctorId,
      status: 'CREATED',
    });
    this.logger.log(`Appointment ${appoinment._id} created by ${doctorId}`);

    return { msg: 'Created Appointment' };
  }

  async confirm_appointment(
    appointmentId: string,
    patientId,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointmentId,
      patien_id: patientId,
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
      { _id: appointmentId },
      { status: 'CONFIRMED' },
    );
    this.logger.log(`Appointment ${appointmentId} confirmed by ${patientId}`);

    return { msg: 'Appointment confirmed' };
  }

  async cancel_appointment(
    appointmentId: string,
    userId,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      $or: [
        {
          _id: appointmentId,
          patient_id: userId,
        },
        {
          _id: appointmentId,
          doctor_id: userId,
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
      { _id: appointmentId },
      { status: 'CANCELED' },
    );
    this.logger.log(`Appointment ${appointmentId} canceled by ${userId}`);

    return { msg: 'Appointment canceled' };
  }

  async complete_appointment(
    doctorId: string,
    appoinmentId: string,
    dto: PaymentInfoDto,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appoinmentId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appoinmentId,
      doctor_id: doctorId,
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
      { _id: appoinmentId },
      { status: 'DONE', paymentInfo: dto },
    );

    this.logger.log(`Appointment ${appointment._id} has been confirmed`);
    return { msg: 'Appointment complete with payment info' };
  }

  async confirm_payment(appoinmentId, doctorId): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appoinmentId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appoinmentId,
      doctor_id: doctorId,
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
    doctorId,
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
        { doctor_id: doctorId, status: 'DONE' },
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

    this.logger.log(`Payment Info retrieved fro ${doctorId}`);
    return {
      ...paymentInfo,
      docs: resp,
    };
  }

  async edit_payment_info(
    appointmentId,
    doctorId,
    dto: EditAmountDto,
  ): Promise<{ msg: string }> {
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const appointment: Appointment = await this.appointmentModel.findOne({
      _id: appointmentId,
      doctor_id: doctorId,
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
    patientId,
    page,
  ): Promise<PaginateResult<Appointment>> {
    const options = {
      page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp: PaginateResult<Appointment> =
      await this.appointmentModel.paginate({ patient_id: patientId }, options);
    this.logger.log(`Appointments for ${patientId} retrieved`);

    return resp;
  }

  async get_doctor_appointment(
    doctorId,
    page,
  ): Promise<PaginateResult<GetAppointmentDto>> {
    const options = {
      page,
      limit: 25,
      sort: { createdAt: -1 },
    };
    const resp = await this.appointmentModel.paginate(
      { doctor_id: doctorId },
      options,
    );
    const appointments: GetAppointmentDto[] = await Promise.all(
      resp.docs.map(async (appointment) => {
        const [patientInfo, doctorInfo] = await Promise.all([
          await this.authService.getPatientProfile(appointment.patient_id),
          await this.authService.getPatientProfile(appointment.patient_id),
        ]);
        return {
          _id: appointment._id,
          title: appointment.title,
          doctor: {
            _id: appointment.doctor_id,
            fullName: `${doctorInfo.firstName} ${doctorInfo.lastName}`,
            email: doctorInfo.email,
          },
          patient: {
            _id: appointment.patient_id,
            fullName: `${patientInfo.firstName} ${patientInfo.lastName}`,
            email: patientInfo.email,
          },
          status: appointment.status,
          start_date: appointment.start_date,
          end_date: appointment.end_date,
          paymentInfo: appointment.paymentInfo,
        };
      }),
    );
    this.logger.log(`Appointments for ${doctorId} retrieved`);

    return { ...resp, docs: appointments };
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
    this.logger.log(`Got Payment amount for ${doctorId}`);

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
      let dateKey;

      if (period.type === 'WEEK') {
        dateKey = (appointment) =>
          appointment.start_date.toLocaleString('default', { weekday: 'long' });
      } else if (period.type === 'MONTH') {
        dateKey = (appointment) =>
          `Day ${appointment.start_date.toLocaleString('default', {
            day: 'numeric',
          })}`;
      } else {
        dateKey = (appointment) =>
          appointment.start_date.toLocaleString('default', { month: 'long' });
      }
      appointments.forEach((appointment) => {
        const day = dateKey(appointment);

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
    this.logger.log(`Got Appointment Bar Chart for ${doctorId}`);

    return {
      week: {
        label: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        done: appointmentsByDayOfWeekDone,
        canceled: appointmentsByDayOfWeekCanceled,
      },
      month: {
        label: getDaysInMonth(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
        ),
        done: appointmentsByDayOfMonthDone,
        canceled: appointmentsByDayOfMonthCanceled,
      },
      year: {
        label: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ],
        done: appointmentsByMonthOfYearDone,
        canceled: appointmentsByMonthOfYearCanceled,
      },
    };
  }

  async get_monthly_payment_count(doctorId) {
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

    const divideAppointmentsByPeriod = (appointments) => {
      const counts = {};

      appointments.forEach((appointment) => {
        const day = appointment.start_date.toLocaleString('default', {
          month: 'long',
        });

        if (counts[day]) {
          counts[day] += 1;
        } else {
          counts[day] = 1;
        }
      });
      return counts;
    };
    const appointments: Appointment[] = await this.appointmentModel
      .find({
        doctor_id: doctorId,
        start_date: {
          $gte: startOfYear,
          $lte: endOfYear,
        },
        'paymentInfo.status': 'PAID',
      })
      .sort({ start_date: 1 });

    const payments = divideAppointmentsByPeriod(appointments);
    this.logger.log(`Got Monthly Payment Count Bar Chart for ${doctorId}`);
    return payments;
  }
}
