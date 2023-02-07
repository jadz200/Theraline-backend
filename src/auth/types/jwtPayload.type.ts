import mongoose from 'mongoose';
import { UserRole } from '../schema/user.schema';

export type JwtPayload = {
  email: string;
  sub: mongoose.Types.ObjectId;
  role: UserRole;
};
