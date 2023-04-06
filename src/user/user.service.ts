import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Appointment, AppointmentDocument } from 'src/appointment/schema';
import { AuthService } from 'src/auth/auth.service';
import { CreateDoctorDto, User } from 'src/auth/dto';
import { UserDocument } from 'src/auth/schema/user.schema';
import * as argon from 'argon2';

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

  async getClinicInfo(id: string) {
    const doctor = await this.userModel
      .findOne({ _id: id })
      .select('clinicInfo');

    return doctor;
  }

  async getPatientList(id: string) {
    const resp = await this.appointmentModel.find({ doctor_id: id });
    return resp;
  }
}
