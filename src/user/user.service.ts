import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/appointment/schema';
import { AuthService } from 'src/auth/auth.service';
import { CreateDoctorDto, User } from 'src/auth/dto';
import { UserDocument } from 'src/auth/schema/user.schema';
import * as argon from 'argon2';
import { UserDetail, patientInfo } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectModel(Appointment.name)
    private appointmentModel: PaginateModel<AppointmentDocument>,
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
  ) {}

  async createDoctor(dto: CreateDoctorDto) {
    const temp = await this.authService.findByEmail(dto.email);
    if (temp) {
      throw new BadRequestException('Email already in use');
    }
    const hash = await argon.hash(dto.password);
    const user = await this.userModel.create({
      email: dto.email,
      password: hash,
      role: 'DOCTOR',
      firstName: dto.firstName,
      lastName: dto.lastName,
      groups: [],
      clinicInfo: dto.clinicInfo,
      image: dto.image,
    });
    this.logger.log(`Created new user ${user.id} as a ${user.role}`);

    return { msg: 'Created Doctor Account' };
  }

  async deleteUser(user_id: string) {
    this.userModel.deleteOne({ _id: user_id });
  }

  async getClinicInfo(id: string) {
    const doctor = await this.userModel
      .findOne({ _id: id })
      .select('clinicInfo');

    return doctor;
  }

  async getPatientList(id: string) {
    const patientIds = await this.appointmentModel.distinct('patient_id', {
      doctor_id: id,
    });
    const patientList = [];
    for (const patient_id of patientIds) {
      const patient = await this.userModel
        .findOne({ _id: patient_id })
        .select('_id firstName lastName email image');
      if (!patient) {
        continue;
      }
      const latestAppoinments = await this.appointmentModel
        .find({
          patient_id: patient_id,
        })
        .sort({ start_date: -1 })
        .limit(2);
      if (latestAppoinments[0].status.toString() === 'DONE') {
        const patientInfo: patientInfo = {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          image: patient.image,
          lastAppointment: latestAppoinments[0],
        };
        patientList.push(patientInfo);
      } else {
        const patientInfo: patientInfo = {
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          image: patient.image,
          nextAppointment: latestAppoinments[0],
          lastAppointment: latestAppoinments[1],
        };
        patientList.push(patientInfo);
      }
    }
    return patientList;
  }

  async get_all_patients() {
    return await this.userModel
      .find({ role: ['PATIENT'] })
      .select('firstName lastName email image');
  }

  async get_patient_details(email: string) {
    const user: User = await this.userModel
      .findOne({ email: email })
      .select('firstName lastName email gender phone birthday');
    const doctors_id: string[] = await this.appointmentModel.distinct(
      'patient_id',
      {
        patient_id: user._id,
      },
    );
    console.log(user);
    const resp: UserDetail = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      phone: user.phone,
      gender: user.gender,
      groups: user.groups,
      doctors_id: doctors_id,
    };

    return resp;
  }

  async find_by_email(email: string): Promise<User> {
    return await this.userModel.findOne({ email: email });
  }
}
