import mongoose, { ObjectId } from 'mongoose';
import { UserRole } from '../schema/user.schema';

export class User {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  hashedRt: string;
}
