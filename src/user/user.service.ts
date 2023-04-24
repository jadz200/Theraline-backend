import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { PaginateModel } from 'mongoose';
import * as argon from 'argon2';
import { Appointment, AppointmentDocument } from '../appointment/schema';
import { AuthService } from '../auth/auth.service';
import { User, UserDocument } from '../auth/schema/user.schema';
import {
  PatientDetail,
  PatientInfo,
  EditDoctoInfoDto,
  CreateDoctorDto,
  CreateNotesDto,
} from './dto';
import { Notes } from './schema/notes.schema';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly cloudinaryService: CloudinaryService,
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
      gender: dto.gender,
      birthday: dto.birthday,
      clinicInfo: dto.clinicInfo,
      image: dto.image,
      phone: dto.phone,
    });
    this.logger.log(`Created new user ${user.id} as a ${user.role}`);

    return { msg: 'Created Doctor Account' };
  }

  async edit_doctor(dto: EditDoctoInfoDto, doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Id is not in valid format');
    }

    const doctor: User = await this.userModel.findOne({ _id: doctorId });

    if (!doctor) {
      throw new NotFoundException('Doctor Not Found');
    }
    const newimage = (await this.cloudinaryService.upload(dto.image)).url;

    await this.userModel.updateOne(
      { _id: doctorId },
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        image: newimage,
      },
    );
    const doctoredited: User = await this.userModel.findOne({ _id: doctorId });

    console.log(doctoredited);
    this.logger.log(`Doctor ${doctor._id} has been edited`);
    return { msg: 'Doctor changed info' };
  }

  async deleteUser(user_id: string): Promise<{ msg: string }> {
    await this.userModel.deleteOne({ _id: user_id });
    return { msg: 'User deleted' };
  }

  async getClinicInfo(id: string) {
    const doctor = await this.userModel
      .findOne({ _id: id })
      .select('clinicInfo');

    return doctor;
  }

  async getPatientList(id: string): Promise<PatientInfo[]> {
    const patientIds = await this.appointmentModel.distinct('patient_id', {
      doctor_id: id,
    });
    const patientList: PatientInfo[] = await Promise.all(
      patientIds.map(async (patient_id) => {
        const patient = await this.userModel
          .findOne({ _id: patient_id })
          .select('_id firstName lastName email image phone');

        const latestAppoinments = await this.appointmentModel
          .find({ patient_id })
          .sort({ start_date: -1 })
          .limit(2);
        let patientInfo: PatientInfo;
        if (latestAppoinments[0].status === 'DONE') {
          patientInfo = {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            image: patient.image,
            phone: patient.phone,
            lastAppointment: latestAppoinments[0],
          };
        } else {
          patientInfo = {
            _id: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            email: patient.email,
            image: patient.image,
            nextAppointment: latestAppoinments[0],
            lastAppointment: latestAppoinments[1],
          };
        }
        return patientInfo;
      }),
    );

    return patientList;
  }

  async get_all_patients(): Promise<User[]> {
    const resp: User[] = await this.userModel
      .find({ role: ['PATIENT'] })
      .select('firstName lastName email image');
    return resp;
  }

  async get_patient_details_email(email: string): Promise<PatientDetail> {
    const user: User = await this.userModel
      .findOne({ email })
      .select('firstName lastName email gender phone birthday');
    const doctorsId: string[] = await this.appointmentModel.distinct(
      'patient_id',
      {
        patient_id: user._id,
      },
    );
    const resp: PatientDetail = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      groups: user.groups,
      doctors: doctorsId,
    };

    return resp;
  }

  async get_patient_details_id(patientId, doctorId): Promise<PatientDetail> {
    const user: User = await this.userModel
      .findOne({ _id: patientId })
      .select('firstName lastName email gender phone birthday notes');
    const doctorsId: string[] = await this.appointmentModel.distinct(
      'patient_id',
      {
        patient_id: user._id,
      },
    );
    const filteredNotes: Notes[] = user.notes.filter(
      (note) => note.author === doctorId,
    );
    const resp: PatientDetail = {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      phone: user.phone,
      gender: user.gender,
      birthday: user.birthday,
      groups: user.groups,
      doctors: doctorsId,
      notes: filteredNotes,
    };

    return resp;
  }

  async add_note(doctorId, dto: CreateNotesDto) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Id is not in valid format');
    }
    const user: User = await this.userModel.findOne({ _id: dto.user_id });
    const note: Notes = { title: dto.title, body: dto.body, author: doctorId };
    await this.userModel.updateOne(
      { _id: user._id },
      { $push: { notes: note } },
    );
    return { msg: 'added a note' };
  }

  async get_notes(doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException('Id is not in valid format');
    }

    const resp: Notes[] = await this.userModel.aggregate([
      // Match all users with notes that have the same author
      { $match: { 'notes.author': doctorId } },

      // Unwind the notes array
      { $unwind: '$notes' },

      // Match notes with the same author
      { $match: { 'notes.author': doctorId } },

      {
        $project: {
          _id: 0,
          patient_id: '$_id',
          fullName: { $concat: ['$firstName', ' ', '$lastName'] },
          title: '$notes.title',
          body: '$notes.body',
        },
      },
    ]);
    return resp;
  }

  async find_by_email(email: string): Promise<User> {
    return this.userModel.findOne({ email });
  }
}
