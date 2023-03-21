import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePatientDto } from './dto/createPatient.dto';
import { Patient, PatientDocument } from './schema/patient.schema';

@Injectable()
export class PatientService {
  private readonly logger = new Logger(PatientService.name);

  constructor(
    @InjectModel(Patient.name) private patientModel: Model<PatientDocument>,
  ) {}
  async create_patient(dto: CreatePatientDto) {
    const user = await this.patientModel.create({
      email: dto.email,
      birthday: dto.birthday,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      user_id: dto.user_id,
    });
    this.logger.log(`Created patient with id ${user.id}`);
    return { msg: 'Created patient' };
  }
  async findById(id: string) {
    return await this.patientModel.find({ _id: id });
  }
}
