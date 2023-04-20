import mongoose from 'mongoose';
import { ClinicInfo } from '../schema';
import { UserRole } from '../schema/user.schema';

export class User {
  _id: mongoose.Types.ObjectId;

  email: string;

  password: string;

  firstName: string;

  lastName: string;

  role: UserRole;

  hashedRt: string;

  image?: string;

  phone?: string;

  birthday?: Date;

  gender?: string;

  groups: string[];

  clinicInfo?: ClinicInfo;

  expoToken?: string;
}
