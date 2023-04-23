import mongoose from 'mongoose';
import { Notes } from 'src/user/schema/notes.schema';
import { ClinicInfo, Gender } from '../schema';
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

  gender: Gender;

  notes: Notes[];

  groups: string[];

  clinicInfo?: ClinicInfo;

  expoToken?: string;
}
